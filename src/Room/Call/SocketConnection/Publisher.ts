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

    const id = this.getUniqueId();

    subscribers.push({
      id,
      callback: callback as CallBack<MessageToClientValues>,
    });

    return id;
  }

  public emit(msg: MessageToClientValues) {
    const subscribers = this.subscriptions[msg.type];
    if (subscribers) {
      for (const subscriber of subscribers) {
        subscriber.callback(msg);
      }
    }
  }

  public unsubscribe(id: number) {
    for (const [msgType, subscribers] of Object.entries(this.subscriptions)) {
      if (subscribers.some((sub) => sub.id === id)) {
        this.subscriptions[msgType as keyof Subscriptions] = subscribers.filter(
          (sub) => sub.id !== id
        );
        break;
      }
    }
  }

  public reset() {
    this.subscriptions = {};
  }

  private getUniqueId() {
    const currentMax = Object.values(this.subscriptions).reduce((acc, x) => {
      return Math.max(acc, ...x.map((s) => s.id));
    }, 0);

    return currentMax + 1;
  }
}
