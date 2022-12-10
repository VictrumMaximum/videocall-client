import { initSocketConnection } from '../SocketConnection/SocketConnection';
import { MessagesToClient } from '../SocketConnection/SocketTypes';

export interface Peers {
  [remoteUserId: string]: {
    peerConnection: RTCPeerConnection;
    stream: MediaStream;
    videoSender?: RTCRtpSender;
  };
}

type SocketConnection = ReturnType<typeof initSocketConnection>;
// type StreamManager = ReturnType<typeof initStreamManager>;

class PeerConnectionManager {
  private peers: Peers;
  private setPeers: (peers: Peers) => void;
  private socketConnection: SocketConnection;
  // private streamManager: StreamManager;

  constructor(
    socketConnection: SocketConnection,
    // streamManager: StreamManager,
    peers: Peers,
    setPeers: (peers: Peers) => void
  ) {
    this.peers = peers;
    this.setPeers = setPeers;
    this.socketConnection = socketConnection;
    // this.streamManager = streamManager;

    const socketPublisher = this.socketConnection.getPublisher();

    socketPublisher.subscribe('media-offer', this.handleMediaOffer);
    socketPublisher.subscribe('media-answer', this.handleMediaAnswer);
    socketPublisher.subscribe(
      'new-ice-candidate',
      this.handleNewICECandidateMsg
    );

    socketPublisher.subscribe('user-joined-room', (msg) => {
      // this.sendVideo();

      const peer = this.createPeer(msg.source.id);
      const stream = peer.stream;

      peer.peerConnection.ontrack = (event: RTCTrackEvent) => {
        console.log('ontrack');
        const track = event.track;

        if (track.kind === 'video' && stream.getVideoTracks()[0]) {
          stream.getVideoTracks()[0].stop();
          stream.removeTrack(stream.getVideoTracks()[0]);
        }
        if (track.kind === 'audio' && stream.getAudioTracks()[0]) {
          stream.getAudioTracks()[0].stop();
          stream.removeTrack(stream.getAudioTracks()[0]);
        }
        stream.addTrack(track);
      };
    });

    socketPublisher.subscribe('user-left-room', (msg) => {
      const { [msg.source.id]: _, ...rest } = this.peers;
      this.setPeers(rest);
    });

    this.createPeer = this.createPeer.bind(this);
    // this.sendVideo = this.sendVideo.bind(this);
  }

  public reset() {
    for (const peer of Object.values(this.peers)) {
      peer.peerConnection.close();
    }

    this.setPeers({});
  }

  private createPeer(remoteUserId: string) {
    if (this.peers[remoteUserId]) {
      console.warn(`peer connection with ${remoteUserId} already exists!`);
      return this.peers[remoteUserId];
    }
    console.log('Creating PeerConnection with user ' + remoteUserId);
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    const peer = { peerConnection: pc, stream: new MediaStream() };

    this.setPeers({
      ...this.peers,
      [remoteUserId]: peer,
    });

    // first three of these event handlers are required
    pc.onicecandidate = (event) =>
      this.handleICECandidateEvent(event, remoteUserId);
    // onnegotiationneeded is not called in case of video-answer
    pc.onnegotiationneeded = () => {
      this.handleNegotiationNeededEvent(pc, remoteUserId);
    };
    // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    // myPeerConnection.onsignalingstatechange = () => handleSignalingStateChangeEvent(myPeerConnection);
    return peer;
  }

  // called by RTCPeerConnection when new ICE candidate is found for our network
  private handleICECandidateEvent(
    event: RTCPeerConnectionIceEvent,
    remoteUserId: string
  ) {
    if (event.candidate) {
      // let others know of our candidate
      this.socketConnection.sendToServer({
        type: 'new-ice-candidate',
        target: remoteUserId,
        candidate: event.candidate,
      });
    }
  }

  private handleNewICECandidateMsg(msg: MessagesToClient['new-ice-candidate']) {
    const userId = msg.source.id;
    if (this.peers[userId]) {
      this.peers[userId].peerConnection
        .addIceCandidate(new RTCIceCandidate(msg.candidate))
        .catch(console.error);
    }
  }

  // called by RTCPeerconnection when a track is added or removed
  private handleNegotiationNeededEvent(
    pc: RTCPeerConnection,
    remoteUserId: string
  ) {
    pc.createOffer()
      .then((offer) => {
        return pc.setLocalDescription(offer);
      })
      .then(() => {
        this.socketConnection.sendToServer({
          type: 'media-offer',
          target: remoteUserId,
          sdp: pc.localDescription!,
        });
      })
      .catch(this.handleError);
  }

  private handleMediaOffer(msg: MessagesToClient['media-offer']) {
    const sourceId = msg.source.id;

    const pc =
      this.peers[sourceId]?.peerConnection ?? this.createPeer(sourceId);

    pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
      .then(() => {
        return pc.createAnswer();
      })
      .then((answer) => {
        return pc.setLocalDescription(answer);
      })
      .then(() => {
        this.socketConnection.sendToServer({
          type: 'media-answer',
          target: sourceId,
          sdp: pc.localDescription!, // I think it's safe to do ! here because of setLocalDescription
        });
      })
      // TODO: revert this catch block once you've figured out why the sdp error occurs
      .catch((error) => {
        console.log(msg.sdp.sdp); // Failed to set remote video description send parameters for m-section with mid='0'});
        this.handleError(error);
      });
  }

  private handleMediaAnswer(msg: MessagesToClient['media-answer']) {
    this.peers[msg.source.id].peerConnection.setRemoteDescription(
      new RTCSessionDescription(msg.sdp)
    );
  }

  // public sendVideo() {
  //   const stream = this.streamManager.getLocalCameraStream();
  //   if (!stream) {
  //     return;
  //   }

  //   const videoTrack = stream.getVideoTracks()[0];

  //   for (const peer of Object.values(this.peers)) {
  //     if (peer.videoSender) {
  //       // Don't await this promise
  //       peer.videoSender.replaceTrack(videoTrack);
  //     } else {
  //       peer.videoSender = peer.peerConnection.addTrack(videoTrack);
  //     }
  //   }
  // }

  private handleError = (e: any) => {
    console.error(e);
  };
}

// let instance: PeerConnectionManager;

// export const initPeerConnectionManager = (
//   socketConnection: SocketConnection,
//   streamManager: StreamManager,
//   peers: Peers,
//   setPeers: (peers: Peers) => void
// ) => {
//   if (!instance) {
//     instance = new PeerConnectionManager(
//       socketConnection,
//       streamManager,
//       peers,
//       setPeers
//     );
//   }

//   return instance;
// };
