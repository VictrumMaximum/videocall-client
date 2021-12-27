import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { targetValueSetter } from "../../Home/Home";
import { Connection, ConnectionArgs } from "../Connection/Connection";
import styles from "./Call.module.scss";

import { ReactComponent as RightArrow } from "./right-arrow.svg";

interface ChatMessage {
  sender: string;
  message: string;
}

const messages: ChatMessage[] = [
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

const getMessageElement = (msg: ChatMessage, i: number) => {
  return (
    <div className={styles.message} key={`chatMessage_${i}`}>
      {msg.sender}: {msg.message}
    </div>
  );
};

let connection: Connection;
const connect = (args: ConnectionArgs) => {
  if (!connection) {
    console.log("connecting...");
    connection = new Connection(args);
  }
};

const sendMsg = (msg: string) => {
  connection.sendToServer({
    type: "message",
    payload: msg,
  });
};

export const getOwnNickname = () => {
  return window.localStorage.getItem("nickname");
};

export const Call = () => {
  const params = useParams();
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showFullChat, setShowFullChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([] as ChatMessage[]);

  const receiveMsg = (msg: string, sender: string) => {
    setChatMessages((prevMsgs) => {
      return [...prevMsgs, { message: msg, sender }];
    });
  };

  useEffect(() => {
    connect({
      log: () => {
        console.log("yo log me");
      },
      createRemoteVideoElement: () => {
        console.log("yo create video element");
      },
      removeVideoElement: () => {
        console.log("yo remove video element");
      },
      updateConnectionStatus: () => {
        console.log("yo update connection status");
      },
      roomId: params.roomId!,
      receiveMsg: receiveMsg,
    });
  }, []);

  const shownMessages =
    showFullChat || chatMessages.length <= 3
      ? chatMessages
      : chatMessages.slice(chatMessages.length - 3, chatMessages.length);

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
              onChange={targetValueSetter(setChatMessage)}
              value={chatMessage}
            />
            <RightArrow
              className={styles.rightArrow}
              onClick={() => {
                if (chatMessage.length > 0) {
                  sendMsg(chatMessage);
                  setChatMessage("");
                  receiveMsg(chatMessage, getOwnNickname() || "me");
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
