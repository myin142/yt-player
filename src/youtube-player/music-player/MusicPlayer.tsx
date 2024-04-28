/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-return-assign */
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaPause, FaPlay, FaArrowRight, FaShuffle } from "react-icons/fa6";
import ReactHowler from "react-howler";
import { clamp } from "lodash";
import FlexBox from "../../components/FlexBox";
import { PlaylistVideo } from "../types";
import { MusicQueue } from "./music-queue";
import { VolumeControls } from "./VolumeControls";
import IconToggle from "../../components/IconToggle";
import { VideoService } from "../youtube/VideoService";
import { YoutubeContext } from "../youtube/YoutubeContext";
import { PlaybackTime } from "./PlaybackTime";
import { Status } from "../../services/mpd.service";

export interface MusicPlayerProps {
  queue: number[];
  videoService: VideoService;
  videoChanged: boolean;
  playingVideos: PlaylistVideo[];
  playingVideo: PlaylistVideo | null;
  onVideoPlay: (v: PlaylistVideo) => void;
  onQueueChanged: (queue: number[]) => void;
  dirtyQueue: boolean;
  status: Status;
  toggleRandom: () => void;
}

export interface MusicPlayerStats {
  isPlaying: boolean;
  songDuration: number;
  volume: number;
  isRandom: boolean;
  wasPlaying: boolean;
}

const VOLUME_STEPS = 0.1;

// We have to use an outer state for the event listeners
// Because they are only registered once, so even if the react state changes
// the value inside the listeners will not be updated
const outerState = {
  isPlaying: false,
};

export function MusicPlayer(props: MusicPlayerProps) {
  const {
    dirtyQueue,
    onQueueChanged,
    onVideoPlay,
    playingVideo,
    playingVideos,
    queue,
    videoChanged,
  } = props;
  const [isPlaying, setIsPlaying] = useState(false);
  const [songDuration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.2);
  // const [isRandom, setIsRandom] = useState(true);
  const [wasPlaying, setWasPlaying] = useState(false);

  outerState.isPlaying = isPlaying;

  const prevProps = useRef(props);
  const player = useRef(null as ReactHowler | null);
  const { videoService } = useContext(YoutubeContext);

  const getCurrentIndex = (): number => {
    return playingVideos.findIndex((v) => v.id === playingVideo?.id);
  };

  const fillQueue = (q: number[] = [], random = false) => {
    const currentQueue = [...q];
    const currentIndex = getCurrentIndex();
    if (currentIndex !== -1) {
      currentQueue.unshift(currentIndex);
    }

    const maxQueue = 10;

    // TODO: use music queue globally
    const mQueue = new MusicQueue(
      {
        // Current workaround to prevent playing same video twice in a row
        max_queue:
          playingVideos.length < maxQueue ? playingVideos.length : maxQueue,
        max_index: playingVideos.length,
        random,
      },
      currentQueue
    );

    const resultQueue = [...mQueue.queue];
    if (currentIndex !== -1) {
      resultQueue.shift();
    }

    onQueueChanged(resultQueue);
  };

  const playNextVideo = () => {
    if (playingVideos.length === 0) return;

    const vid = playingVideos[queue.shift() || 0];
    if (vid) {
      onVideoPlay(vid);
      fillQueue(queue);
    }
  };

  const setVolumeClamp = (vol: number) => {
    setVolume(clamp(vol, 0, 1));
  };

  // const toggleRandom = () => {
  //   setIsRandom(!isRandom);
  //   fillQueue([], !isRandom);
  // }

  const play = (video = playingVideo) => {
    if (video && videoService.isVideoDownloaded(video.id)) {
      player.current?.seek(0);
      setIsPlaying(true);
    } else {
      console.warn("Cannot play not downloaded video");
    }
  };

  const resume = () => {
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  function toggleMusic() {
    if (playingVideo == null) {
      return;
    }

    if (outerState.isPlaying) {
      console.log("Pause");
      pause();
    } else {
      console.log("Resume");
      resume();
    }
  }

  const setSongDuration = () => {
    setDuration(player.current?.duration() || 0);
  };

  const seek = (value: number) => {
    if (isPlaying) {
      pause();
      setWasPlaying(true);
    }
    player.current?.seek(value);
  };

  const onSeekEnd = () => {
    if (wasPlaying) {
      resume();
    }
  };

  useEffect(() => {
    const keybindings: { [k: string]: () => void } = {
      " ": () => toggleMusic(),
      ArrowDown: () => setVolumeClamp(volume - VOLUME_STEPS),
      ArrowUp: () => setVolumeClamp(volume + VOLUME_STEPS),
      ArrowRight: () => playNextVideo(),
    };

    const handleKeyDown = (ev: KeyboardEvent) => {
      const preventEvent = ["INPUT"];
      if (preventEvent.includes(document.activeElement?.tagName || "")) {
        return;
      }

      const fn = keybindings[ev.key];
      if (fn) {
        ev.preventDefault();
        fn();
      }
    };

    document.removeEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleKeyDown);
    play();
    fillQueue([]);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (
      playingVideos.length !== prevProps.current.playingVideos.length ||
      prevProps.current.dirtyQueue !== dirtyQueue
    ) {
      fillQueue([]);
    }

    if (prevProps.current.videoChanged !== videoChanged) {
      play();
    }

    prevProps.current = props;
  });

  // const playingFile = playingVideo ? videoService.videoPath(playingVideo.id) : null;

  // const v = volume * 1.2;

  return (
    <FlexBox classes="!flex-row grow gap-2 px">
      {/* {playingFile && (
        <ReactHowler
          src={playingFile}
          volume={v * v}
          playing={isPlaying}
          onLoad={() => setSongDuration()}
          onEnd={() => playNextVideo()}
          ref={player}
        />
      )} */}
      <div className="controls flex-vertical">
        <FlexBox classes="!flex-row">
          {(isPlaying && (
            <button onClick={() => pause()}>
              <FaPause />
            </button>
          )) || (
            <button onClick={() => resume()}>
              <FaPlay />
            </button>
          )}
          <button onClick={() => playNextVideo()}>
            <FaArrowRight />
          </button>

          <div className="border-l"></div>

          <IconToggle
            active={props.status.random}
            onClick={() => props.toggleRandom()}
            title="Shuffle"
          >
            <FaShuffle />
          </IconToggle>
        </FlexBox>
      </div>
      <div className="playback flex-vertical">
        <PlaybackTime
          isPlaying={isPlaying}
          currentTimeFn={() => player.current?.seek() || 0}
          duration={songDuration}
          onSeek={(v) => seek(v)}
          onSeekEnd={() => onSeekEnd()}
        />
      </div>
      <div className="other-controls flex-vertical">
        <VolumeControls
          volume={volume}
          onVolumeChange={(v) => setVolumeClamp(v)}
        />
      </div>
    </FlexBox>
  );
}
