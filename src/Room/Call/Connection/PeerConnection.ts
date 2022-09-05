import { SocketPublisher } from './Publisher';
import { MessagesToClient, MessageToServerValues } from './SocketTypes';

interface Peers {
  [remoteUserId: string]: {
    peerConnection: RTCPeerConnection;
    videoSender?: RTCRtpSender;
  };
}

export class PeerConnectionManager {
  private peers: Peers;
  private socketPublisher: SocketPublisher;
  private sendToServer: (msg: MessageToServerValues) => void;

  constructor(
    socketPublisher: SocketPublisher,
    sendToServer: (msg: MessageToServerValues) => void
  ) {
    this.peers = {};
    this.socketPublisher = socketPublisher;
    this.sendToServer = sendToServer;

    this.socketPublisher.subscribe('media-offer', (msg) =>
      this.handleMediaOffer(msg)
    );

    this.socketPublisher.subscribe('media-answer', (msg) =>
      this.handleMediaAnswer(msg)
    );

    this.socketPublisher.subscribe('new-ice-candidate', (msg) =>
      this.handleNewICECandidateMsg(msg)
    );

    this.createPeerConnection = this.createPeerConnection.bind(this);
    this.sendVideo = this.sendVideo.bind(this);
  }

  public reset() {
    for (const peer of Object.values(this.peers)) {
      peer.peerConnection.close();
    }
  }

  public createPeerConnection(remoteUserId: string) {
    if (this.peers[remoteUserId]) {
      console.warn(`peer connection with ${remoteUserId} already exists!`);
      return this.peers[remoteUserId].peerConnection;
    }
    console.log('Creating PeerConnection with user ' + remoteUserId);
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    // save reference to peer connection
    this.peers[remoteUserId] = { peerConnection: pc };

    // first three of these event handlers are required
    pc.onicecandidate = (event) =>
      this.handleICECandidateEvent(event, remoteUserId);
    // onnegotiationneeded is not called in case of video-answer
    pc.onnegotiationneeded = () => {
      this.handleNegotiationNeededEvent(pc, remoteUserId);
    };
    // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    // myPeerConnection.onsignalingstatechange = () => handleSignalingStateChangeEvent(myPeerConnection);
    return pc;
  }

  // called by RTCPeerConnection when new ICE candidate is found for our network
  private handleICECandidateEvent(
    event: RTCPeerConnectionIceEvent,
    remoteUserId: string
  ) {
    if (event.candidate) {
      // let others know of our candidate
      this.sendToServer({
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
        this.sendToServer({
          type: 'media-offer',
          target: remoteUserId,
          sdp: pc.localDescription!,
        });
      })
      .catch(this.handleError);
  }

  private handleMediaOffer(msg: MessagesToClient['media-offer']) {
    const sourceId = msg.source.id;
    let peer = this.peers[sourceId];
    if (!peer) {
      this.peers[sourceId] = {
        peerConnection: this.createPeerConnection(sourceId),
      };
    }
    const pc = this.peers[sourceId].peerConnection;

    pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
      .then(() => {
        return pc.createAnswer();
      })
      .then((answer) => {
        return pc.setLocalDescription(answer);
      })
      .then(() => {
        this.sendToServer({
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

  public sendVideo(videoTrack: MediaStreamTrack) {
    for (const peer of Object.values(this.peers)) {
      if (peer.videoSender) {
        // Don't await this promise
        peer.videoSender.replaceTrack(videoTrack);
      } else {
        peer.videoSender = peer.peerConnection.addTrack(videoTrack);
      }
    }
  }

  private handleError = (e: any) => {
    console.error(e);
  };

  public removePeerConnection(remoteUserId: string) {
    delete this.peers[remoteUserId];
  }
}
