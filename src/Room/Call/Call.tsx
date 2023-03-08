import React from "react";

import { SocketProvider } from "./SocketConnection/SocketConnection";
import { PeersProvider } from "./PeerConnection/PeerContext";
import { StreamProvider } from "./MediaStreams/StreamProvider";
import { CallContent } from "./CallContent";

type CallProps = {
  roomId: string;
  nickname: string | null;
};

export const Call = (props: CallProps) => {
  const { roomId } = props;

  return (
    <SocketProvider roomId={roomId}>
      <StreamProvider>
        <PeersProvider>
          <CallContent roomId={roomId} />
        </PeersProvider>
      </StreamProvider>
    </SocketProvider>
  );
};
