import React, { useState } from 'react';
import { targetValueSetter } from '../../Home/Home';
import styles from './Welcome.module.scss';

import { ReactComponent as CircleIcon } from './circle.svg';

interface Props {
  start: (nickname: string) => void;
}

export const Welcome = (props: Props) => {
  const oldNickname = window.localStorage.getItem('nickname') || '';
  const [nickname, setNickname] = useState(oldNickname);
  // TODO: use room from url if it's there
  const [room, setRoom] = useState('');

  return (
    <div className={styles.welcomeScreen}>
      <div className={styles.bubbleContainer}>
        {bubbles.map(({ size, offsetBottom, offsetLeft }, i) => (
          <Bubble
            key={i}
            size={size}
            offsetBottom={offsetBottom}
            offsetLeft={offsetLeft}
          />
        ))}
      </div>

      <div className={styles.topContainer}>
        <p className={styles.greeting}>Hello</p>
      </div>
      <div className={styles.nicknameContainer}>
        <p className={styles.nicknameHeader}>Your nickname</p>
        <input
          className={styles.nicknameInput}
          onChange={targetValueSetter(setNickname)}
          value={nickname}
        />
      </div>
      <div className={styles.roomContainer}>
        <p className={styles.nicknameHeader}>Room name</p>
        <input
          className={styles.nicknameInput}
          onChange={targetValueSetter(setRoom)}
          value={room}
        />
      </div>
      <div className={styles.bottomContainer}>
        <div
          className={styles.startButton}
          onClick={() => props.start(nickname)}
        >
          Join
        </div>
      </div>
    </div>
  );
};

// TODO: make this dependent on the screen size
const amountOfBubbles = 30;

const bubbles: Omit<BubbleProps, 'key'>[] = new Array(amountOfBubbles)
  .fill(null)
  .map(() => ({
    size: 30 + Math.floor(Math.random() * 50),
    offsetBottom: Math.floor(Math.random() * 100),
    offsetLeft: Math.floor(Math.random() * 100),
  }));

type BubbleProps = {
  key: number;
  size: number;
  offsetBottom: number;
  offsetLeft: number;
};
const Bubble = (props: BubbleProps) => {
  const size = `${props.size}px`;
  const offsetBottom = `${props.offsetBottom}%`;
  const offsetLeft = `${props.offsetLeft}%`;
  return (
    <CircleIcon
      key={props.key}
      width={size}
      height={size}
      style={{
        stroke: 'yellow',
        position: 'fixed',
        bottom: offsetBottom,
        left: offsetLeft,
        // zIndex: '-1',
      }}
    />
  );
};
