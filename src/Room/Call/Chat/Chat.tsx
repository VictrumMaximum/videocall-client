import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import styles from './Chat.module.scss';
import { targetValueSetter } from '../../../Home/Home';
import { ReactComponent as RightArrow } from './right-arrow.svg';
import { getConnection } from '../Connection/Connection';

type ChatMessage = {
  from: string;
  text: string;
};

const getMessageElement = (msg: ChatMessage, i: number) => {
  return (
    <div className={styles.message} key={`chatMessage_${i}`}>
      {msg.from}: {msg.text}
    </div>
  );
};

export const Chat = () => {
  // Maybe not useState for this, to prevent so many copies?
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const publisher = getConnection().getPublisher();
    const x = publisher.subscribe('chatMessage', (msg) => {
      const chatMessage = {
        from: msg.source.name || msg.source.id,
        text: msg.text,
      };
      setMessages((currentMessages) => [...currentMessages, chatMessage]);
    });

    return () => {
      publisher.unsubscribe('chatMessage', x);
    };
  }, []);

  const onSend = (text: string) => {
    const connection = getConnection();
    connection.sendToServer({
      type: 'chatMessage',
      text,
    });
    const chatMessage = {
      from: connection.getLocalUserName() || 'me',
      text,
    };
    setMessages((currentMessages) => [...currentMessages, chatMessage]);
  };

  return <ChatWindow messages={messages} onSend={onSend} />;
};

interface ChatWindowProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

const ChatWindow = ({ messages, onSend }: ChatWindowProps) => {
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showFullChat, setShowFullChat] = useState(false);

  const shownMessages =
    showFullChat || messages.length <= 3
      ? messages
      : messages.slice(messages.length - 3, messages.length);

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
              onSend(chatMessage);
              setChatMessage('');
            }
          }}
        />
      </div>
    </div>
  );
};
