import { useGenericTrack } from "./GenericStream";

const getMicrophoneStream = () => {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
  });
};

export const useMicrophone = () => {
  return useGenericTrack(getMicrophoneStream, "audio");

  // const track = stream?.getAudioTracks()[0] ?? null;

  // return {
  //   track,
  //   toggle: toggleStream,
  //   stop: stopStream,
  // };
};
