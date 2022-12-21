import { useGenericTrack } from "./GenericStream";

const getCameraStream = () => {
  return navigator.mediaDevices.getUserMedia({
    video: true,
  });
};

export const useCamera = () => {
  return useGenericTrack(getCameraStream, "video");

  //   const track = stream?.getVideoTracks()[0] ?? null;

  //   return {
  //     track,
  //     toggle: toggleStream,
  //     stop: stopStream,
  //   };
};
