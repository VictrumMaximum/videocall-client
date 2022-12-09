import {
  MessagesToClient,
  MessageToClientType,
  MessageToClientValues,
} from './SocketTypes';

type Subscriber = {
  id: number;
  callback: CallBack<MessageToClientValues>;
};

type CallBack<T> = (msg: T) => void;

type Subscriptions = {
  [msgType in MessageToClientType]?: Subscriber[];
};

export class SocketPublisher {
  private subscriptions: Subscriptions = {};

  public subscribe<T extends keyof MessagesToClient>(
    msgType: T,
    callback: CallBack<MessagesToClient[T]>
  ): number {
    let subscribers = this.subscriptions[msgType];
    if (!subscribers) {
      subscribers = [];
      this.subscriptions[msgType] = subscribers;
    }

    const max = subscribers.reduce((acc, x) => Math.max(acc, x.id), 0);

    subscribers.push({
      id: max + 1,
      callback: callback as CallBack<MessageToClientValues>,
    });
    return max + 1;
  }

  public emit(msg: MessageToClientValues) {
    const subscribers = this.subscriptions[msg.type];
    if (subscribers) {
      for (const subscriber of subscribers) {
        subscriber.callback(msg);
      }
    }
  }

  public unsubscribe(msgType: MessageToClientType, id: number) {
    this.subscriptions[msgType] = this.subscriptions[msgType]?.filter(
      (sub) => sub.id !== id
    );
  }

  public reset() {
    this.subscriptions = {};
  }
}
