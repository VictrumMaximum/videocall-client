import React from "react";

import styles from "./Logs.module.scss";

type LogMessage = {
  message: string;
  type: "normal" | "error";
};

export const logNormal = (message: any) => {
  console.log(message);
  logs.push({ message: JSON.stringify(message, null, 2), type: "normal" });
};

export const logError = (message: any) => {
  console.error(message);
  logs.push({ message: JSON.stringify(message, null, 2), type: "error" });
};

const logs: LogMessage[] = [];

export const Logs = () => {
  return (
    <div className={styles.container}>
      {logs.map(({ message, type }, i) => (
        <div
          key={i}
          className={`${styles.message} ${
            type === "normal" ? styles.normalMessage : styles.errorMessage
          }`}
        >
          {message}
        </div>
      ))}
    </div>
  );
};
