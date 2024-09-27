import { QueueItem, Status } from "../../services/mpd.service";
import {
  MdOutlineSkipNext,
  MdVolumeUp,
  MdArrowForwardIos,
} from "react-icons/md";

interface PlaylistQueueProps {
  status: Status;
  queue: QueueItem[];
  onPlayQueue: (idx: number) => void;
  onCollapseToggle: () => void;
}

export default function PlaylistQueue({
  status,
  queue,
  onPlayQueue,
  onCollapseToggle,
}: PlaylistQueueProps) {
  const queueItems = queue.map((v, i) => {
    const isPlaying = v.id === status.playing;
    const isNext = v.id === status.nextPlaying;
    return (
      <li key={v.id}>
        <button
          onClick={() => onPlayQueue(i + 1)}
          className={`${isPlaying ? "text-red-500" : ""}
          ${
            isNext ? "text-red-400" : ""
          } p-2 rounded w-full flex gap-2 justify-start text-left`}
        >
          <span>{v.title}</span>
          {isPlaying && <MdVolumeUp className="text-xl" />}
          {isNext && <MdOutlineSkipNext className="text-xl" />}
        </button>
      </li>
    );
  });

  return (
    <>
      <button
        className="font-bold mb-4 flex gap-2 items-center"
        onClick={() => onCollapseToggle()}
      >
        <MdArrowForwardIos />
        <span>Queue</span>
      </button>
      <div className="scroll">
        <ul className="flex flex-col gap-4 grow">{queueItems}</ul>
      </div>
    </>
  );
}
