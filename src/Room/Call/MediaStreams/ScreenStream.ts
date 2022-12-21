import { useGenericTrack } from "./GenericStream";

const getScreenVideoStream = () => {
  return navigator.mediaDevices.getDisplayMedia({
    video: true,
  });
};

export const useScreenVideo = () => {
  return useGenericTrack(getScreenVideoStream, "video");

  //   const track = stream?.getVideoTracks()[0] ?? null;

  //   return {
  //     track,
  //     toggle: toggleStream,
  //     stop: stopStream,
  //   };
};
