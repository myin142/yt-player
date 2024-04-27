import React, { useEffect, useState } from 'react';
import FlexBox from '../../components/FlexBox';
import YtSlider from '../../components/YtSlider';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTimeFn: () => number;
  duration: number;
  onSeek: (v: number) => void;
  onSeekEnd: () => void;
}

export interface PlaybackControlsState {
  interval: NodeJS.Timeout | null;
  update: boolean;
  seeking: boolean;
}

export function PlaybackTime({ isPlaying, currentTimeFn, duration, onSeek, onSeekEnd }: PlaybackControlsProps) {
  const [, setUpdate] = useState(false);

  const withPrefixedZero = (num: number): string => {
    return (num < 10 ? `0` : '') + num;
  };

  const playbackToMinuteString = (playback: number): string => {
    const minutes = Math.max(0, playback / 60);
    const fullMinute = Math.floor(minutes);
    const remainderMinute = minutes - fullMinute;
    const seconds = Math.trunc(remainderMinute * 60);
    return `${withPrefixedZero(fullMinute)}:${withPrefixedZero(
      seconds
    )}`;
  };

  const seek = (value: number | number[]) => {
    if (Array.isArray(value)) {
      console.log('Cannot seek an array');
    } else {
      setUpdate(x => !x);
      onSeek(value);
    }
  };

  const seekEnd = () => {
    onSeekEnd();
  }

  const time = currentTimeFn();

  useEffect(() => {
    // TODO: find better way, currently it updates everytime?
    const interval = setInterval(() => setUpdate(x => !x), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FlexBox flexDirection="row">
      <span>
        {playbackToMinuteString(time > duration ? duration : time)}
      </span>
      <YtSlider
        min={0}
        max={duration}
        value={time}
        onChange={(e, v) => seek(v)}
        onMouseUp={() => seekEnd()}
      />
      <span>{playbackToMinuteString(duration)}</span>
    </FlexBox>
  );
}
