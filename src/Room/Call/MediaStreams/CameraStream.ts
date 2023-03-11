import { useGenericTrack } from "./GenericStream";

type Constraints = Exclude<MediaStreamConstraints["video"], true>;

export const useCamera = (constraints: Constraints) => {
  return useGenericTrack(
    () => navigator.mediaDevices.getUserMedia({ video: constraints }),
    "video"
  );
};
