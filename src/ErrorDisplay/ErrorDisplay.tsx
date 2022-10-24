import React from 'react';

import styles from './ErrorDisplay.module.scss';

type Props = {
  title?: string;
  message: string;
};

export const ErrorDisplay = (props: Props) => {
  const { title = 'Error', message } = props;

  return (
    <div className={styles.errorContainer}>
      {title}: {message}
    </div>
  );
};
