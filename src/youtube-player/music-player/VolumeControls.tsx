import React, { useState } from 'react';
import {
  VolumeDown,
  VolumeMute,
  VolumeOff,
  VolumeUp,
} from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import FlexBox from '../../components/FlexBox';
import YtSlider from '../../components/YtSlider';

export interface VolumeControlsProps {
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export interface VolumeControlsState {
  mutedVolume: number;
  muted: boolean;
}

const MAX_VOLUME = 100;

export function VolumeControls({ volume, onVolumeChange }: VolumeControlsProps) {
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
      console.warn('Volume not a number', v);
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
    <IconButton onClick={() => mute()}>
      <VolumeUp />
    </IconButton>
  );

  if (muted) {
    volumeIcon = (
      <IconButton onClick={() => unmute()}>
        <VolumeMute />
      </IconButton>
    );
  } else if (volume === 0) {
    volumeIcon = (
      <IconButton
        onClick={() => emitNormalizedVolume(MAX_VOLUME)}
      >
        <VolumeOff />
      </IconButton>
    );
  } else if (volume < 0.5) {
    volumeIcon = (
      <IconButton onClick={() => mute()}>
        <VolumeDown />
      </IconButton>
    );
  }

  return (
    <FlexBox flexDirection="row">
      {volumeIcon}
      <YtSlider
        value={fromNormalizedVolume(volume)}
        min={0}
        max={100}
        onChange={(e, v) => onVolumeSliderChange(v)}
      />
    </FlexBox>
  );
}
