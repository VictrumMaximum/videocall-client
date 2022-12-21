import {
  WithMessage,
  WithPeers,
  WithSendToServer,
  WithUserId,
} from "../PeerContext";
import { streamContentMap } from "./TrackManagement";

// called by RTCPeerconnection when a track is added or removed
export const handleNegotiationNeededEvent = async (
  args: { pc: RTCPeerConnection } & WithUserId & WithSendToServer
) => {
  const { pc, remoteUserId, sendToServer } = args;

  console.log("handle negotiation");

  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendToServer({
      type: "media-offer",
      target: remoteUserId,
      sdp: pc.localDescription!,
      streamContentMap,
    });
  } catch (e) {
    handleError(e);
  }
};

export const handleMediaOffer = async (
  args: WithMessage<"media-offer"> & WithPeers & WithSendToServer
) => {
  const { msg, peers, sendToServer } = args;

  try {
    const source = msg.source;
    const sourceId = source.id;

    const peer = peers[sourceId];

    const pc = peer.peerConnection;
    peer.streamContentMap = msg.streamContentMap;

    await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendToServer({
      type: "media-answer",
      target: sourceId,
      sdp: pc.localDescription!, // I think it's safe to do ! here because of setLocalDescription
      streamContentMap,
    });
  } catch (error) {
    console.log(msg.sdp.sdp); // Failed to set remote video description send parameters for m-section with mid='0'});
    handleError(error);
  }
};

export const handleMediaAnswer = (
  args: WithMessage<"media-answer"> & WithPeers
) => {
  const { msg, peers } = args;

  const peer = peers[msg.source.id];

  peer.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));

  peer.streamContentMap = msg.streamContentMap;
};

const handleError = (e: any) => {
  console.error(e);
};
