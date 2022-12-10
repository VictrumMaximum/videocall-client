import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useConnections } from '../Call';
import { useStreams } from '../MediaStreams/CameraStream';
import { MessagesToClient } from '../SocketConnection/SocketTypes';

export interface IPeersContext {
  peers: {
    [remoteUserId: string]: {
      peerConnection: RTCPeerConnection;
      stream: MediaStream;
      videoSender?: RTCRtpSender;
    };
  };
  sendVideo: () => void;
}

const PeersContext = createContext<IPeersContext | null>(null);

export const PeersProvider: React.FC = ({ children }) => {
  const [peers, setPeers] = useState<IPeersContext['peers']>({});
  const { socketConnection } = useConnections();
  const { localCameraStream } = useStreams();

  const subsRef = useRef<number[]>([]);

  // called by RTCPeerConnection when new ICE candidate is found for our network
  const handleICECandidateEvent = useCallback(
    (event: RTCPeerConnectionIceEvent, remoteUserId: string) => {
      if (event.candidate) {
        // let others know of our candidate
        socketConnection.sendToServer({
          type: 'new-ice-candidate',
          target: remoteUserId,
          candidate: event.candidate,
        });
      }
    },
    [socketConnection]
  );

  // called by RTCPeerconnection when a track is added or removed
  const handleNegotiationNeededEvent = useCallback(
    async (pc: RTCPeerConnection, remoteUserId: string) => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketConnection.sendToServer({
          type: 'media-offer',
          target: remoteUserId,
          sdp: pc.localDescription!,
        });
      } catch (e) {
        handleError(e);
      }
    },
    [socketConnection]
  );

  const createPeer = useCallback(
    (remoteUserId: string) => {
      if (peers[remoteUserId]) {
        console.warn(`peer connection with ${remoteUserId} already exists!`);
        return peers[remoteUserId];
      }
      console.log('Creating PeerConnection with user ' + remoteUserId);
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      const peer = { peerConnection: pc, stream: new MediaStream() };

      setPeers({
        ...peers,
        [remoteUserId]: peer,
      });

      // first three of these event handlers are required
      pc.onicecandidate = (event) =>
        handleICECandidateEvent(event, remoteUserId);
      // onnegotiationneeded is not called in case of video-answer
      pc.onnegotiationneeded = () => {
        handleNegotiationNeededEvent(pc, remoteUserId);
      };
      // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
      // myPeerConnection.onsignalingstatechange = () => handleSignalingStateChangeEvent(myPeerConnection);
      return peer;
    },
    [peers, handleICECandidateEvent, handleNegotiationNeededEvent]
  );

  const handleMediaOffer = useCallback(
    async (msg: MessagesToClient['media-offer']) => {
      try {
        const sourceId = msg.source.id;

        const pc =
          peers[sourceId]?.peerConnection ??
          createPeer(sourceId).peerConnection;

        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketConnection.sendToServer({
          type: 'media-answer',
          target: sourceId,
          sdp: pc.localDescription!, // I think it's safe to do ! here because of setLocalDescription
        });
      } catch (error) {
        console.log(msg.sdp.sdp); // Failed to set remote video description send parameters for m-section with mid='0'});
        handleError(error);
      }
    },
    [peers, socketConnection, createPeer]
  );

  const handleMediaAnswer = useCallback(
    (msg: MessagesToClient['media-answer']) => {
      console.log(msg.source.id);
      console.log(peers);
      peers[msg.source.id].peerConnection.setRemoteDescription(
        new RTCSessionDescription(msg.sdp)
      );
    },
    [peers]
  );

  const handleNewICECandidateMsg = useCallback(
    (msg: MessagesToClient['new-ice-candidate']) => {
      const userId = msg.source.id;
      if (peers[userId]) {
        peers[userId].peerConnection
          .addIceCandidate(new RTCIceCandidate(msg.candidate))
          .catch(console.error);
      }
    },
    [peers]
  );

  const sendVideo = useCallback(() => {
    const stream = localCameraStream;

    if (!stream) {
      console.log('no stream to send');
      return;
    }

    console.log(`sending stream to ${Object.entries(peers).length} peers`);

    const videoTrack = stream.getVideoTracks()[0];

    for (const peer of Object.values(peers)) {
      if (peer.videoSender) {
        // Don't await this promise
        peer.videoSender.replaceTrack(videoTrack);
      } else {
        peer.videoSender = peer.peerConnection.addTrack(videoTrack);
      }
    }
  }, [localCameraStream, peers]);

  const handleUserJoinedRoom = useCallback(
    (msg: MessagesToClient['user-joined-room']) => {
      console.log('handleUserJoinedRoom');

      const peer = createPeer(msg.source.id);
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
    },
    [createPeer]
  );

  const handleUserLeftRoom = useCallback(
    (msg: MessagesToClient['user-left-room']) => {
      const userId = msg.source.id;

      const { [userId]: _, ...rest } = peers;
      setPeers(rest);
    },
    [peers]
  );

  useEffect(() => {
    if (localCameraStream) {
      sendVideo();
    }
  }, [localCameraStream, sendVideo, peers]);

  useEffect(() => {
    const socketPublisher = socketConnection.getPublisher();

    subsRef.current.forEach((id) => socketPublisher.unsubscribe(id));

    subsRef.current = [
      socketPublisher.subscribe('media-offer', handleMediaOffer),
      socketPublisher.subscribe('media-answer', handleMediaAnswer),
      socketPublisher.subscribe('new-ice-candidate', handleNewICECandidateMsg),
      socketPublisher.subscribe('user-joined-room', handleUserJoinedRoom),
      socketPublisher.subscribe('user-left-room', handleUserLeftRoom),
    ];

    // TODO: unsub all these subs when unmounting
  }, [
    handleMediaOffer,
    handleMediaAnswer,
    handleNewICECandidateMsg,
    handleUserJoinedRoom,
    handleUserLeftRoom,
    socketConnection,
  ]);

  // TODO: set this in a memo
  const value = {
    peers,
    sendVideo,
  };

  return (
    <PeersContext.Provider value={value}>{children}</PeersContext.Provider>
  );
};

const handleError = (e: any) => {
  console.error(e);
};

export const usePeers = () => {
  const context = useContext(PeersContext);

  if (!context) {
    throw new Error('PeersContext not defined!');
  }

  return context;
};
