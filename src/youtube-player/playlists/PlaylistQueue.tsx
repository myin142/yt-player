import { FaVolumeHigh } from "react-icons/fa6";
import { QueueItem, Status } from "../../services/mpd.service";
import { MdOutlineSkipNext } from "react-icons/md";

interface PlaylistQueueProps {
  status: Status;
  queue: QueueItem[];
}

export default function PlaylistQueue({ status, queue }: PlaylistQueueProps) {
  const queueItems = queue.map((v, i) => {
    const isPlaying = v.id === status.playing;
    const isNext = v.id === status.nextPlaying;
    return (
      <>
        <li
          key={i}
          className={`${isPlaying ? "text-red-500" : ""}
          ${isNext ? "text-red-400" : ""}
          
          flex gap-2 items-center`}
        >
          <span>{v.title}</span>
          {isPlaying && <FaVolumeHigh />}
          {isNext && <MdOutlineSkipNext />}
        </li>
      </>
    );
  });

  return (
    <>
      {queueItems.length > 0 && (
        <div className="flex flex-col grow">
          <div className="font-bold mb-4">Queue</div>
          <ul className="flex flex-col gap-4 grow">{queueItems}</ul>
        </div>
      )}
    </>
  );
}
