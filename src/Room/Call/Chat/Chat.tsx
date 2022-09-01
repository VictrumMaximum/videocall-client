import React, { useCallback, useContext, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import styles from "./Chat.module.scss";
import { targetValueSetter } from "../../../Home/Home";
import { ReactComponent as RightArrow } from "./right-arrow.svg";
import { useSocket, useSocketListener } from "../Connection/ConnectionProvider";

const getMessageElement = (msg: LocalChatMessage, i: number) => {
  return (
    <div className={styles.message} key={`chatMessage_${i}`}>
      {msg.sender}: {msg.text}
    </div>
  );
};

interface ReceivedChatMessage {
  type: "chatMessage";
  text: string; // the actual chat message
  nickname?: string;
  source: string;
}

interface LocalChatMessage {
  text: string;
  sender: string;
}

let count = 0;

export const Chat = () => {
  console.log("Render chat");
  const lastMessage = useSocketListener("chatMessage");
  const sendToServer = useSocket();

  // Maybe not useState for this, to prevent so many copies?
  const [messages, setMessages] = useState([] as LocalChatMessage[]);

  // const addMessage = useCallback(
  //   (text: string, sender: string) => {
  //     console.log("receiveMsg from ", sender);
  //     console.log(text);
  //     setMessages([...messages, { text, sender }]);
  //   },
  //   [messages, setMessages]
  // );

  useEffect(() => {
    if (lastMessage && count < 5) {
      const sender = lastMessage.nickname || lastMessage.source;
      setMessages((oldMessages) => [
        ...oldMessages,
        { text: lastMessage.text, sender },
      ]);
      // addMessage(lastMessage.text, sender);
      count++;
    }
  }, [lastMessage, setMessages]);

  const onSend = (text: string) => {
    sendToServer({
      type: "chatMessage",
      text,
    });
    setMessages((oldMessages) => [...oldMessages, { text, sender: "me" }]);
  };

  return <ChatWindow messages={messages} onSend={onSend} />;
};

interface ChatWindowProps {
  messages: LocalChatMessage[];
  onSend: (text: string) => void;
}

const ChatWindow = ({ messages, onSend }: ChatWindowProps) => {
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showFullChat, setShowFullChat] = useState(false);

  const shownMessages =
    showFullChat || messages.length <= 3
      ? messages
      : messages.slice(messages.length - 3, messages.length);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatOptions}>
        <button
          className={styles.chatOption}
          onClick={() => setShowFullChat(!showFullChat)}
        >
          F
        </button>
        <button
          className={styles.chatOption}
          onClick={() => setShowChat(!showChat)}
        >
          H
        </button>
      </div>
      {showChat && (
        <div className={styles.chatDialog}>
          {shownMessages.map(getMessageElement)}
        </div>
      )}
      <div className={styles.chatInputContainer}>
        <TextareaAutosize
          minRows={1}
          maxRows={6}
          className={styles.chatInput}
          onChange={targetValueSetter(setChatMessage)}
          value={chatMessage}
        />
        <RightArrow
          className={styles.rightArrow}
          onClick={() => {
            if (chatMessage.length > 0) {
              onSend(chatMessage);
              setChatMessage("");
            }
          }}
        />
      </div>
    </div>
  );
};
