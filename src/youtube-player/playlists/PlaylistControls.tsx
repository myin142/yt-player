import { useEffect, useState } from "react";
import {
  MdShuffle,
  MdSkipPrevious,
  MdPause,
  MdPlayArrow,
  MdSkipNext,
  MdVolumeMute,
  MdVolumeUp,
} from "react-icons/md";
import { Status } from "../../services/mpd.service";

interface PlaylistControlsProps {
  status: Status;
  onShuffle: (shuffle: boolean) => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onPlayToggle: () => void;
  onSetVolume: (v: number) => void;
}

export default function PlaylistControls({
  status,
  onShuffle,
  onPlayNext,
  onPlayPrev,
  onPlayToggle,
  onSetVolume,
}: PlaylistControlsProps) {
  const [mutedVolume, setMutedVolume] = useState(50);
  const [internalVolume, setInternalVolume] = useState(
    isNaN(status.volume) ? 0 : status.volume
  );

  const isMuted = internalVolume === 0;
  const toggleMute = () => {
    if (isMuted) {
      setInternalVolume(mutedVolume);
    } else {
      setMutedVolume(internalVolume);
      setInternalVolume(0);
    }
  };

  useEffect(() => {
    onSetVolume(internalVolume);
  }, [internalVolume]);

  useEffect(() => {
    if (!isNaN(status.volume)) setInternalVolume(status.volume);
  }, [status]);

  return (
    <>
      <div className="flex gap-8">
        <div className="flex gap-2">
          <button
            onClick={() => onShuffle(!status.shuffle)}
            className={`p-2 text-slate-300 ${
              status.shuffle ? "!text-red-500" : ""
            }`}
          >
            <MdShuffle className="text-xl" />
          </button>
          <button onClick={() => onPlayPrev()} className={`p-2 text-slate-300`}>
            <MdSkipPrevious className="text-xl" />
          </button>
          <button
            onClick={() => onPlayToggle()}
            className={`p-2 text-slate-300`}
          >
            {(status.state === "playing" && (
              <MdPause className="text-xl" />
            )) || <MdPlayArrow className="text-xl" />}
          </button>
          <button onClick={() => onPlayNext()} className={`p-2 text-slate-300`}>
            <MdSkipNext className="text-xl" />
          </button>
        </div>

        <div className="flex grow">
          <button onClick={() => toggleMute()} className={`p-2 text-slate-300`}>
            {(isMuted && <MdVolumeMute className="text-xl" />) || (
              <MdVolumeUp className="text-xl" />
            )}
          </button>
          <input
            className="w-32"
            type="range"
            value={internalVolume}
            onChange={(e) => setInternalVolume(e.target.valueAsNumber)}
            style={{
              background: `linear-gradient(to right, var(--main-color) ${internalVolume}%, var(--light-background) ${internalVolume}%)`,
            }}
            min={0}
            max={100}
          />
        </div>
      </div>
    </>
  );
}
