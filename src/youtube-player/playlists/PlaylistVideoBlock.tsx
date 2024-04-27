import React, { MouseEventHandler, useContext } from 'react';
import { PlaylistVideo } from '../types';
import { YoutubeContext } from '../youtube/YoutubeContext';

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
  let classes = 'btn-1 flex-horizontal video-block';
  if (disabled && editing) {
    classes += ' disabled';
  }

  return (
    <button
      className={classes}
      type="button"
      onClick={onClick}
      disabled={disabled && !editing}
    >
      <img
        src={service.getThumbnail(playlistVideo.id)}
        className="thumbnail"
        alt={playlistVideo.title}
      />
      <div>{playlistVideo.title}</div>
    </button>
  );
}
