import { useGenericTrack } from "./GenericStream";

const getMicrophoneStream = () => {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
  });
};

export const useMicrophone = () => {
  return useGenericTrack(getMicrophoneStream);
};
