import { FaVolumeHigh } from "react-icons/fa6";
import { QueueItem, Status } from "../../services/mpd.service";
import { MdShuffle, MdOutlineSkipNext } from "react-icons/md";

interface PlaylistQueueProps {
  status: Status;
  queue: QueueItem[];
  onShuffle: (shuffle: boolean) => void;
  onPlayQueue: (idx: number) => void;
}

export default function PlaylistQueue({
  status,
  queue,
  onShuffle,
  onPlayQueue,
}: PlaylistQueueProps) {
  const queueItems = queue.map((v, i) => {
    const isPlaying = v.id === status.playing;
    const isNext = v.id === status.nextPlaying;
    return (
      <>
        <li key={i}>
          <button
            onClick={() => onPlayQueue(i + 1)}
            className={`${isPlaying ? "text-red-500" : ""}
          ${
            isNext ? "text-red-400" : ""
          } p-2 rounded w-full flex gap-2 justify-start text-left`}
          >
            <span>{v.title}</span>
            {isPlaying && <FaVolumeHigh />}
            {isNext && <MdOutlineSkipNext />}
          </button>
        </li>
      </>
    );
  });

  return (
    <>
      {queueItems.length > 0 && (
        <div className="flex flex-col grow">
          <div className="font-bold mb-4">Queue</div>
          <div className="scroll">
            <ul className="flex flex-col gap-4 grow">{queueItems}</ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onShuffle(!status.shuffle)}
              className={`p-2 hover:text-white text-slate-300 ${
                status.shuffle ? "!text-red-500" : ""
              }`}
            >
              <MdShuffle className="text-xl" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
