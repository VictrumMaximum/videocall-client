import React, { useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import styles from "./Chat.module.scss";
import { targetValueSetter } from "../../../Utils/InputUtils";
import { ReactComponent as RightArrow } from "./right-arrow.svg";
import { useSocket } from "../SocketConnection/SocketConnection";
import { useTheme } from "../../../App";

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
  const { visible, setUnreadMessageAmount } = props;

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { publisher, localUser, sendToServer } = useSocket();

  const addChatMessage = useCallback(
    (chatMessage: Omit<ChatMessage, "timestamp">) => {
      const msgWithTimestamp = {
        ...chatMessage,
        timestamp: new Date(),
      };
      setMessages((currentMessages) => [...currentMessages, msgWithTimestamp]);
      if (!visible) {
        setUnreadMessageAmount((x) => x + 1);
      }
    },
    [visible, setUnreadMessageAmount]
  );

  useEffect(() => {
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
  }, [publisher, addChatMessage]);

  const onSend = (text: string) => {
    sendToServer({
      type: "chatMessage",
      text,
    });
    const chatMessage = {
      from: localUser.name || "me",
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
  const { colors } = useTheme();

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
  }, [messages.length, showFullChat]);

  return (
    <div
      className={styles.chatContainer}
      style={{ backgroundColor: colors.color3 }}
    >
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
          style={{ color: colors["text color 1"] }}
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
