import { useGenericTrack } from "./GenericStream";

const getScreenVideoStream = (constraints: DisplayMediaStreamOptions) => {
  return navigator.mediaDevices.getDisplayMedia(constraints);
};

export const useScreenVideo = () => {
  return useGenericTrack(getScreenVideoStream, {
    video: true,
    audio: true,
  });
};
