import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import styles from "./Call.module.scss";

import { ReactComponent as RightArrow } from "./right-arrow.svg";

interface Message {
  sender: string;
  message: string;
}

const messages: Message[] = [
  { sender: "vic", message: "hey, i am home alone" },
  { sender: "tanya", message: "omg me too" },
  { sender: "vic", message: ";)" },
  {
    sender: "vic",
    message:
      "you thinking what i'm thinking? Because I think we are thinking the same thing",
  },
  { sender: "tanya", message: "omg you're so sexy" },
  { sender: "vic", message: "i know baby, i know" },
];

const getMessageElement = (msg: Message, i: number) => {
  return (
    <div className={styles.message} key={`chatMessage_${i}`}>
      {msg.sender}: {msg.message}
    </div>
  );
};

export const Call = () => {
  const [showChat, setShowChat] = useState(true);
  const [showFullChat, setShowFullChat] = useState(false);

  const shownMessages = showFullChat
    ? messages
    : messages.slice(messages.length - 3, messages.length);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.topBar}></div>
      <div className={styles.content}></div>
      <div className={styles.bottomBar}>
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
            />
            <RightArrow className={styles.rightArrow} />
          </div>
        </div>
      </div>
    </div>
  );
};
