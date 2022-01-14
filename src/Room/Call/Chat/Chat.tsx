import React, { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import styles from "./Chat.module.scss";
import { targetValueSetter } from "../../../Home/Home";
import { ReactComponent as RightArrow } from "./right-arrow.svg";
import { useSocket } from "../../ConnectionProvider";

const getMessageElement = (msg: LocalChatMessage, i: number) => {
  return (
    <div className={styles.message} key={`chatMessage_${i}`}>
      {msg.sender}: {msg.text}
    </div>
  );
};

interface ReceivedChatMessage {
  type: "message";
  message: string; // the actual chat message
  nickname?: string;
  source: string;
}

interface LocalChatMessage {
  text: string;
  sender: string;
}

export const Chat = () => {
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showFullChat, setShowFullChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([] as LocalChatMessage[]);

  const { lastMessage, sendToServer, nickname, localUserId } =
    useSocket<ReceivedChatMessage>("message");

  const receiveMsg = (text: string, sender: string) => {
    console.log("receiveMsg from ", sender);
    console.log(text);
    setChatMessages([...chatMessages, { text, sender }]);
  };

  useEffect(() => {
    if (lastMessage) {
      const sender = lastMessage.nickname || lastMessage.source;
      receiveMsg(lastMessage.message, sender);
    }
  }, [lastMessage]);

  const shownMessages =
    showFullChat || chatMessages.length <= 3
      ? chatMessages
      : chatMessages.slice(chatMessages.length - 3, chatMessages.length);

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
              sendToServer({
                type: "message",
                message: chatMessage,
              });
              setChatMessage("");
              receiveMsg(chatMessage, nickname || "me");
            }
          }}
        />
      </div>
    </div>
  );
};
