import { FaVolumeHigh } from "react-icons/fa6";
import React from "react";
import { PlaylistVideo } from "../types";

interface PlaylistQueueProps {
  playingVideo: PlaylistVideo;
  videos: PlaylistVideo[];
  queue: number[];
}

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     iconItem: {
//       minWidth: 0,
//       position: 'relative',
//       left: '-0.5em',
//     },
//     icon: {
//       color: theme.palette.secondary.main,
//     },
//   })
// );

export default function PlaylistQueue({
  playingVideo,
  queue,
  videos,
}: PlaylistQueueProps) {
  // const styles = useStyles();
  const currentIndex = videos.findIndex((v) => v.id === playingVideo.id);

  const nextQueue = [...queue];
  if (currentIndex !== -1) {
    nextQueue.unshift(currentIndex);
  }

  const queueItems = nextQueue
    .filter((i) => i >= 0 && i < videos.length)
    .map((v, i) => {
      return (
        <>
          <li key={i} className="border-b">
            {i === 0 && <FaVolumeHigh />}
            <span>{videos[v].title}</span>
          </li>
        </>
      );
    });

  return (
    <>
      {queueItems.length > 0 && (
        <div>
          <div className="font-bold border-b">Queue</div>
          <ul>{queueItems}</ul>
        </div>
      )}
    </>
  );
}
