import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.scss";

export const targetValueSetter = (callback: Function) => (e: any) => {
  callback(e.target.value);
};

export const Home = () => {
  const [roomId, setRoomId] = useState("");
  let navigate = useNavigate();

  const handleJoinRoom = () => {
    navigate(`/videocall/room/${roomId}`);
  };

  return (
    <div>
      <input
        className={styles.roomInput}
        value={roomId}
        placeholder="Room ID"
        onChange={targetValueSetter(setRoomId)}
      />
      <div className={styles.joinButton} onClick={handleJoinRoom}>
        Join room
      </div>
      <Link to="createRoom">
        <div className={styles.roomButton}>Create room</div>
      </Link>
      <Link to="room/room1">
        <div className={styles.roomButton}>Room 1</div>
      </Link>
      <Link to="room/room2">
        <div className={styles.roomButton}>Room 2</div>
      </Link>
    </div>
  );
};
