import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useStreams } from '../MediaStreams/CameraStream';
import { SendToServer, useSocket } from '../SocketConnection/SocketConnection';
import { MessagesToClient } from '../SocketConnection/SocketTypes';

export interface Peers {
  [remoteUserId: string]: {
    peerConnection: RTCPeerConnection;
    stream: MediaStream;
    videoSender?: RTCRtpSender;
  };
}

type SetPeers = (peers: Peers) => void;

type WithPeers = {
  peers: Peers;
};

type WithSetPeers = {
  setPeers: SetPeers;
};

type WithSendToServer = {
  sendToServer: SendToServer;
};

type WithUserId = {
  remoteUserId: string;
};

type WithMessage<T extends keyof MessagesToClient> = {
  msg: MessagesToClient[T];
};

type WithStream = {
  localCameraStream: MediaStream | null;
};

export interface IPeersContext {
  peers: Peers;
}

const PeersContext = createContext<IPeersContext | null>(null);

export const PeersProvider: React.FC = ({ children }) => {
  const [peers, setPeers] = useState<IPeersContext['peers']>({});
  const { socketConnection } = useSocket();
  const { localCameraStream } = useStreams();

  // Subscribe to socket messages with the appropriate handlers.
  // Unsubscribe and resubscribe when the useEffect content is re-evaluated.
  const subsRef = useRef<number[]>([]);
  useEffect(() => {
    const socketPublisher = socketConnection.getPublisher();
    const args = {
      peers,
      setPeers,
      sendToServer: socketConnection.sendToServer,
    };

    subsRef.current.forEach((id) => socketPublisher.unsubscribe(id));

    subsRef.current = [
      socketPublisher.subscribe('media-offer', (msg) =>
        handleMediaOffer({ msg, ...args })
      ),
      socketPublisher.subscribe('media-answer', (msg) =>
        handleMediaAnswer({ msg, ...args })
      ),
      socketPublisher.subscribe('new-ice-candidate', (msg) =>
        handleNewICECandidateMsg({ msg, ...args })
      ),
      socketPublisher.subscribe('user-joined-room', (msg) =>
        handleUserJoinedRoom({ msg, ...args })
      ),
      socketPublisher.subscribe('user-left-room', (msg) =>
        handleUserLeftRoom({ msg, ...args })
      ),
    ];

    return () => {
      subsRef.current.forEach((id) => socketPublisher.unsubscribe(id));
    };
  }, [socketConnection, peers]);

  useEffect(() => {
    if (localCameraStream) {
      sendVideo({ localCameraStream, peers });
    }
  }, [localCameraStream, peers]);

  const value = {
    peers,
    sendVideo,
  };

  useEffect(
    () => () => {
      Object.values(peers).forEach((peer) => {
        peer.peerConnection.close();
      });
    },
    [peers]
  );

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

// called by RTCPeerConnection when new ICE candidate is found for our network
const handleICECandidateEvent = (
  args: { event: RTCPeerConnectionIceEvent } & WithUserId & WithSendToServer
) => {
  const { event, remoteUserId, sendToServer } = args;

  if (event.candidate) {
    // let others know of our candidate
    sendToServer({
      type: 'new-ice-candidate',
      target: remoteUserId,
      candidate: event.candidate,
    });
  }
};

// called by RTCPeerconnection when a track is added or removed
const handleNegotiationNeededEvent = async (
  args: { pc: RTCPeerConnection } & WithUserId & WithSendToServer
) => {
  const { pc, remoteUserId, sendToServer } = args;

  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendToServer({
      type: 'media-offer',
      target: remoteUserId,
      sdp: pc.localDescription!,
    });
  } catch (e) {
    handleError(e);
  }
};

const createPeer = (
  args: WithPeers & WithSetPeers & WithUserId & WithSendToServer
) => {
  const { peers, setPeers, sendToServer, remoteUserId } = args;

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
    handleICECandidateEvent({ event, remoteUserId, sendToServer });
  // onnegotiationneeded is not called in case of video-answer
  pc.onnegotiationneeded = () => {
    handleNegotiationNeededEvent({ pc, remoteUserId, sendToServer });
  };
  // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
  // myPeerConnection.onsignalingstatechange = () => handleSignalingStateChangeEvent(myPeerConnection);
  return peer;
};

const handleMediaOffer = async (
  args: WithMessage<'media-offer'> & WithPeers & WithSetPeers & WithSendToServer
) => {
  const { msg, peers, setPeers, sendToServer } = args;

  try {
    const sourceId = msg.source.id;

    const pc =
      peers[sourceId]?.peerConnection ??
      createPeer({ remoteUserId: sourceId, peers, setPeers, sendToServer })
        .peerConnection;

    await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendToServer({
      type: 'media-answer',
      target: sourceId,
      sdp: pc.localDescription!, // I think it's safe to do ! here because of setLocalDescription
    });
  } catch (error) {
    console.log(msg.sdp.sdp); // Failed to set remote video description send parameters for m-section with mid='0'});
    handleError(error);
  }
};

const handleMediaAnswer = (args: WithMessage<'media-answer'> & WithPeers) => {
  const { msg, peers } = args;

  peers[msg.source.id].peerConnection.setRemoteDescription(
    new RTCSessionDescription(msg.sdp)
  );
};

const handleNewICECandidateMsg = (
  args: WithMessage<'new-ice-candidate'> & WithPeers
) => {
  const { msg, peers } = args;

  const userId = msg.source.id;
  if (peers[userId]) {
    peers[userId].peerConnection
      .addIceCandidate(new RTCIceCandidate(msg.candidate))
      .catch(console.error);
  }
};

const sendVideo = (args: WithStream & WithPeers) => {
  const { localCameraStream, peers } = args;

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
};

const handleUserJoinedRoom = (
  args: WithMessage<'user-joined-room'> &
    WithSendToServer &
    WithPeers &
    WithSetPeers
) => {
  const { msg, peers, setPeers, sendToServer } = args;
  console.log('handleUserJoinedRoom');

  const peer = createPeer({
    remoteUserId: msg.source.id,
    peers,
    setPeers,
    sendToServer,
  });
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
};

const handleUserLeftRoom = (
  args: WithMessage<'user-left-room'> & WithSetPeers & WithPeers
) => {
  const { msg, peers, setPeers } = args;

  const userId = msg.source.id;

  const { [userId]: _, ...rest } = peers;
  setPeers(rest);
};
