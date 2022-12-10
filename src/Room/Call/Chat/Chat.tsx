import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import styles from './Chat.module.scss';
import { targetValueSetter } from '../../../Utils/InputUtils';
import { ReactComponent as RightArrow } from './right-arrow.svg';
import { useConnections } from '../Call';

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

  const { socketConnection } = useConnections();

  const addChatMessage = (chatMessage: ChatMessage) => {
    setMessages((currentMessages) => [...currentMessages, chatMessage]);
  };

  useEffect(() => {
    const publisher = socketConnection.getPublisher();
    const a = publisher.subscribe('chatMessage', (msg) => {
      addChatMessage({
        from: msg.source.name || msg.source.id,
        text: msg.text,
      });
    });

    const b = publisher.subscribe('user-left-room', (msg) => {
      addChatMessage({
        from: msg.source.name || msg.source.id,
        text: `[left the room]`,
      });
    });

    const c = publisher.subscribe('user-joined-room', (msg) => {
      addChatMessage({
        from: msg.source.name || msg.source.id,
        text: '[joined the room]',
      });
    });

    return () => {
      publisher.unsubscribe(a);
      publisher.unsubscribe(b);
      publisher.unsubscribe(c);
    };
  }, [socketConnection]);

  const onSend = (text: string) => {
    socketConnection.sendToServer({
      type: 'chatMessage',
      text,
    });
    const chatMessage = {
      from: socketConnection.getLocalUserName() || 'me',
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
