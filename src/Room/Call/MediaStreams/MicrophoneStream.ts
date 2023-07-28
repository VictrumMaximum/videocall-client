import { useGenericTrack } from "./GenericStream";
import { useUserMedia } from "./UserMediaStream";

const getMicrophoneStream = (constraints: MediaTrackConstraints) => {
  return navigator.mediaDevices.getUserMedia({ audio: constraints });
};

export const useMicrophone = () => {
  return useUserMedia(getMicrophoneStream, {});
};
