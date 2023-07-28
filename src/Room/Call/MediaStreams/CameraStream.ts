import { useUserMedia } from "./UserMediaStream";

const getCameraStream = (constraints: MediaTrackConstraints | boolean) => {
  return navigator.mediaDevices.getUserMedia({ video: constraints });
};

export const useCamera = () => {
  return useUserMedia(getCameraStream, {});
};
