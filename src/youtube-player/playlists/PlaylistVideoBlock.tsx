import React, { MouseEventHandler, useContext } from "react";
import { PlaylistVideo } from "../types";
import { YoutubeContext } from "../youtube/YoutubeContext";

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
  let classes = "btn-1 flex video-block";
  if (disabled && editing) {
    classes += " disabled";
  }

  return (
    <button
      className={classes}
      type="button"
      onClick={onClick}
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
