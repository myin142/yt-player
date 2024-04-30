import { QueueItem, Status } from "../../services/mpd.service";
import { MdOutlineSkipNext, MdVolumeUp } from "react-icons/md";

interface PlaylistQueueProps {
  status: Status;
  queue: QueueItem[];
  onPlayQueue: (idx: number) => void;
}

export default function PlaylistQueue({
  status,
  queue,
  onPlayQueue,
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
      <div className="font-bold mb-4">Queue</div>
      <div className="scroll">
        <ul className="flex flex-col gap-4 grow">{queueItems}</ul>
      </div>
    </>
  );
}
