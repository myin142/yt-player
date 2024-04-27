import React, { useState } from "react";
import {
  FaVolumeHigh,
  FaVolumeOff,
  FaVolumeXmark,
  FaVolumeLow,
} from "react-icons/fa6";
import FlexBox from "../../components/FlexBox";

export interface VolumeControlsProps {
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export interface VolumeControlsState {
  mutedVolume: number;
  muted: boolean;
}

const MAX_VOLUME = 100;

export function VolumeControls({
  volume,
  onVolumeChange,
}: VolumeControlsProps) {
  const [muted, setMuted] = useState(false);
  const [mutedVolume, setMutedVolume] = useState(0);

  const fromNormalizedVolume = (vol: number) => {
    return vol * MAX_VOLUME;
  };

  const toNormalizedVolume = (vol: number) => {
    return vol / MAX_VOLUME;
  };

  const emitNormalizedVolume = (vol: number) => {
    onVolumeChange(toNormalizedVolume(vol));
  };

  const onVolumeSliderChange = (v: number | number[]) => {
    // const volume = parseInt(newValue, 10);
    if (!Array.isArray(v)) {
      emitNormalizedVolume(v);
    } else {
      console.warn("Volume not a number", v);
    }
  };

  const mute = () => {
    setMuted(true);
    setMutedVolume(volume);
    onVolumeChange(0);
  };

  const unmute = () => {
    onVolumeChange(mutedVolume);
    setMuted(false);
    setMutedVolume(0);
  };

  let volumeIcon = (
    <button onClick={() => mute()}>
      <FaVolumeHigh />
    </button>
  );

  if (muted) {
    volumeIcon = (
      <button onClick={() => unmute()}>
        <FaVolumeXmark />
      </button>
    );
  } else if (volume === 0) {
    volumeIcon = (
      <button onClick={() => emitNormalizedVolume(MAX_VOLUME)}>
        <FaVolumeOff />
      </button>
    );
  } else if (volume < 0.5) {
    volumeIcon = (
      <button onClick={() => mute()}>
        <FaVolumeLow />
      </button>
    );
  }

  return (
    <FlexBox classes="!flex-row">
      {volumeIcon}
      <input type="range"
        value={fromNormalizedVolume(volume)}
        min={0}
        max={100}
        onChange={(e) => onVolumeSliderChange(e.target.valueAsNumber)}
      />
    </FlexBox>
  );
}
