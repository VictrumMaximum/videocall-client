import { useGenericTrack } from "./GenericStream";

const getScreenVideoStream = () => {
  return navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });
};

export const useScreenVideo = () => {
  return useGenericTrack(getScreenVideoStream);
};
