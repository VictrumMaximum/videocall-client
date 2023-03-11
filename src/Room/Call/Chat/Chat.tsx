import React, { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import styles from "./Chat.module.scss";
import { targetValueSetter } from "../../../Utils/InputUtils";
import { ReactComponent as RightArrow } from "./right-arrow.svg";
import { useSocket } from "../SocketConnection/SocketConnection";

type ChatMessage = {
  timestamp: Date;
  from: string;
  text: string;
};

const getMessageElement = (msg: ChatMessage, i: number) => {
  return (
    <div className={styles.message} key={`chatMessage_${i}`}>
      <div>
        {msg.from}: {msg.text}
      </div>
      <div className={styles.messageTimestamp}>
        {msg.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};

type ChatProps = {
  visible: boolean;
  setUnreadMessageAmount: (f: (amount: number) => number) => void;
};

export const Chat = (props: ChatProps) => {
  // Maybe not useState for this, to prevent so many copies?
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { socketConnection } = useSocket();

  const addChatMessage = (chatMessage: Omit<ChatMessage, "timestamp">) => {
    const msgWithTimestamp = {
      ...chatMessage,
      timestamp: new Date(),
    };
    setMessages((currentMessages) => [...currentMessages, msgWithTimestamp]);
    if (!props.visible) {
      props.setUnreadMessageAmount((x) => x + 1);
    }
  };

  useEffect(() => {
    const publisher = socketConnection.getPublisher();
    const a = publisher.subscribe("chatMessage", (msg) => {
      addChatMessage({
        from: msg.source.name || msg.source.id,
        text: msg.text,
      });
    });

    const b = publisher.subscribe("user-left-room", (msg) => {
      addChatMessage({
        from: msg.source.name || msg.source.id,
        text: `[left the room]`,
      });
    });

    const c = publisher.subscribe("user-joined-room", (msg) => {
      addChatMessage({
        from: msg.source.name || msg.source.id,
        text: "[joined the room]",
      });
    });

    return () => {
      publisher.unsubscribe(a);
      publisher.unsubscribe(b);
      publisher.unsubscribe(c);
    };
  }, [socketConnection, addChatMessage]);

  const onSend = (text: string) => {
    socketConnection.sendToServer({
      type: "chatMessage",
      text,
    });
    const chatMessage = {
      from: socketConnection.getLocalUserName() || "me",
      text,
    };
    addChatMessage(chatMessage);
  };

  if (!props.visible) {
    return null;
  }

  return <ChatWindow messages={messages} onSend={onSend} />;
};

interface ChatWindowProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

const ChatWindow = ({ messages, onSend }: ChatWindowProps) => {
  const [chatMessage, setChatMessage] = useState("");
  const [showFullChat, setShowFullChat] = useState(false);

  const messageListRef = useRef<HTMLDivElement | null>(null);

  const shownMessages =
    showFullChat || messages.length <= 3
      ? messages
      : messages.slice(messages.length - 3, messages.length);

  const handleSendMessage = () => {
    if (chatMessage.length > 0) {
      onSend(chatMessage);
      setChatMessage("");
    }
  };

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
      });
    }
  }, [messages.length]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatDialog}>
        <div
          className={styles.chatSizeToggleContainer}
          onClick={() => setShowFullChat(!showFullChat)}
        >
          <RightArrow
            className={styles.chatSizeToggleArrow}
            style={{ rotate: showFullChat ? "90deg" : "-90deg" }}
          />
        </div>
        <div className={styles.messageList} ref={messageListRef}>
          {shownMessages.map(getMessageElement)}
        </div>
      </div>
      <div className={styles.chatInputContainer}>
        <TextareaAutosize
          minRows={1}
          maxRows={6}
          className={styles.chatInput}
          onChange={targetValueSetter(setChatMessage)}
          value={chatMessage}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSendMessage();
              // Prevent the text area inserting a newline
              event.preventDefault();
            }
          }}
        />
        <RightArrow
          className={styles.rightArrow}
          onClick={() => {
            handleSendMessage();
          }}
        />
      </div>
    </div>
  );
};
