import { useGenericTrack } from "./GenericStream";

const getScreenVideoStream = () => {
  return navigator.mediaDevices.getDisplayMedia({
    video: true,
  });
};

export const useScreenVideo = () => {
  return useGenericTrack(getScreenVideoStream, "video");
};
