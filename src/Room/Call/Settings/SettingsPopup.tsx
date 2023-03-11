import React, { useEffect, useState } from "react";

import { useStreams } from "../MediaStreams/StreamProvider";

import styles from "./SettingsPopup.module.scss";

export const SettingsPopup = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const { updateCameraConstraints, toggleCam } = useStreams();

  const setCameraDeviceId = (deviceId: string) => {
    console.log(`Setting camera device id: ${deviceId}`);
    updateCameraConstraints({ deviceId });
    toggleCam();
    toggleCam();
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((x) => setDevices(x));
  });

  const cameras = devices.filter((device) => device.kind === "videoinput");
  const microphones = devices.filter((device) => device.kind === "audioinput");
  const speakers = devices.filter((device) => device.kind === "audiooutput");

  return (
    <div className={styles.container}>
      <div className={styles.centerContainer}>
        <div className={styles.header}>Settings</div>
        <div className={styles.contentContainer}>
          <div className={styles.devicesContainer}>
            <CameraSelector devices={cameras} setDeviceId={setCameraDeviceId} />
            <MicrophoneSelector devices={microphones} setDeviceId={() => {}} />
            <SpeakersSelector devices={speakers} setDeviceId={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};

type DevicesProps = {
  devices: MediaDeviceInfo[];
  setDeviceId: (deviceId: string) => void;
};

const CameraSelector = ({ devices, setDeviceId }: DevicesProps) => {
  return (
    <div className={styles.cameraSelectorContainer}>
      <span>Camera</span>
      <select
        className={styles.cameraSelectorDropdown}
        onChange={(e) => setDeviceId(e.target.value)}
      >
        {devices.map((device) => {
          return (
            <option key={device.label} value={device.deviceId}>
              {device.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

const MicrophoneSelector = ({ devices }: DevicesProps) => {
  return (
    <div className={styles.cameraSelectorContainer}>
      <span>Microphone</span>
      <select className={styles.cameraSelectorDropdown}>
        {devices.map((device) => {
          return <option key={device.label}>{device.label}</option>;
        })}
      </select>
    </div>
  );
};

const SpeakersSelector = ({ devices }: DevicesProps) => {
  return (
    <div className={styles.cameraSelectorContainer}>
      <span>Ouput</span>
      <select className={styles.cameraSelectorDropdown}>
        {devices.map((device) => {
          return <option key={device.label}>{device.label}</option>;
        })}
      </select>
    </div>
  );
};
