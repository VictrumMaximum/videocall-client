import React, { useState } from 'react';
import styles from './ToggleButtons.module.scss';

export type ToggleButtonsProps = {
  components: {
    content: string;
    onClick: () => void;
  }[];
};

export const ToggleButtons = ({ components }: ToggleButtonsProps) => {
  return (
    <div className={styles.buttonContainer}>
      {components.map(({ onClick, content }, i) => (
        // Not really a useful key for React, but these buttons will not change
        // anyway, so no performance is lost here.
        <RoundButton key={i} onClick={onClick} content={content} />
      ))}
    </div>
  );
};

interface RoundButtonProps {
  onClick?: (setEnabled: (enabled: boolean) => void) => void;
  content: React.ReactNode;
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
      {props.content}
    </div>
  );
};
