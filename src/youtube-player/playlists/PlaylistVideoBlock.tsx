import React, { MouseEventHandler, useContext } from "react";
import { PlaylistVideo } from "../types";
import { YoutubeContext } from "../youtube/YoutubeContext";
import { PlaylistContext } from "./PlaylistContext";

export interface PlaylistVideoBlockProps {
  playlistVideo: PlaylistVideo;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  editing?: boolean;
}

export function PlaylistVideoBlock({
  playlistVideo,
  onClick,
  disabled,
  editing,
}: PlaylistVideoBlockProps) {
  const { service } = useContext(YoutubeContext);
  const { events } = useContext(PlaylistContext);

  let classes = "btn-1 flex video-block";
  if (disabled && editing) {
    classes += " disabled";
  }

  const copyLink = () => {
    const link = `https://youtu.be/${playlistVideo.id}`;
    navigator.clipboard.writeText(link);
    events.notify(`Link copied: ${link}`);
  }

  return (
    <button
      className={classes}
      type="button"
      onClick={onClick}
      onContextMenu={e => copyLink()}
      disabled={disabled && !editing}
    >
      <div
        className="rounded w-32 h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${service.getThumbnail(playlistVideo.id)})`,
        }}
      />
      <div>{playlistVideo.title}</div>
    </button>
  );
}
