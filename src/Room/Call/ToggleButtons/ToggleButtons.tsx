import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleCamera } from '../LocalVideo/LocalVideo';
import styles from './ToggleButtons.module.scss';

export const ToggleButtons = () => {
  return (
    <div className={styles.buttonContainer}>
      <RoundButton onClick={() => toggleCamera()} text="Camera" />
      <Link to="/videocall">
        <RoundButton text="Exit" />
      </Link>
    </div>
  );
};

interface RoundButtonProps {
  onClick?: (setEnabled: (enabled: boolean) => void) => void;
  text: string;
}
const RoundButton = (props: RoundButtonProps) => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOnClick = () => {
    if (!props.onClick) {
      return;
    }

    setLoading(true);
    props.onClick((enabled) => {
      setEnabled(enabled);
      setLoading(false);
    });
  };

  const activeClass = !loading && enabled ? styles.activeButton : '';
  const loadingClass = loading ? styles.loadingButton : '';

  return (
    <div
      className={`${styles.roundButton} ${activeClass} ${loadingClass}`}
      onClick={handleOnClick}
    >
      {props.text}
    </div>
  );
};
