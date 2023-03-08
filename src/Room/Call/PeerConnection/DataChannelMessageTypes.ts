export type DataChannelMessage =
  | "videoOn"
  | "videoOff"
  | "soundOn"
  | "soundOff";

export const parseDataChannelMessage = (msg: MessageEvent<string>) => {
  return msg.data as DataChannelMessage;
};
