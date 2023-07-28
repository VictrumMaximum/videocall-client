import React from "react";

import styles from "./Logs.module.scss";

type LogMessage = {
  message: string;
  type: "normal" | "error";
  timestamp: Date;
};

const convertToString = (e: any) => {
  if (e.toString) {
    return e.toString();
  }
  return JSON.stringify(e, null, 2);
};

const logNormal = (message: any) => {
  console.log(message);
  log(message, "normal");
};

const logError = (message: any) => {
  console.error(message);
  log(message, "error");
};

const log = (message: any, type: LogMessage["type"]) => {
  logs.push({
    message: convertToString(message),
    type,
    timestamp: new Date(),
  });
};

export const Logger = {
  log: logNormal,
  error: logError,
};

const logs: LogMessage[] = [];

export const Logs = () => {
  return (
    <div className={styles.container}>
      {logs.map(({ message, type, timestamp }, i) => (
        <div
          key={i}
          className={`${styles.messageContainer} ${
            type === "normal" ? styles.normalMessage : styles.errorMessage
          }`}
        >
          <span>{timestamp.toLocaleTimeString()}</span>
          <span className={styles.messageContent}>{message}</span>
        </div>
      ))}
    </div>
  );
};
