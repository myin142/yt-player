import { Checkbox, IconButton, Tooltip, Typography } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import React, { useContext, useState } from 'react';
import { PlaylistInfo, PlaylistVideo } from '../types';
import { PlaylistVideoBlock } from './PlaylistVideoBlock';
import FlexBox from '../../components/FlexBox';
import { YoutubeContext } from '../youtube/YoutubeContext';
import { VideoDownloadResult } from '../youtube/YoutubeService';

interface VideoListProps {
  playlist: PlaylistInfo;
  onVideoClick: (x: PlaylistVideo) => void;
  onVideoUpdate: (x: PlaylistVideo) => void;
  editPlaylist: PlaylistInfo | null;
}


export default function PlaylistVideos({ editPlaylist, playlist, onVideoClick, onVideoUpdate }: VideoListProps) {
  const { videoService, mpdService } = useContext(YoutubeContext);
  const [downloading, setDownloading] = useState(false);

  const download = async (ids: string[]) => {
    if (downloading) {
      console.log('Already downloading something');
      return;
    }

    setDownloading(true);
    const result: VideoDownloadResult[] = await Promise.all(
      ids
        .map(async (id) => {
          return videoService.downloadVideo(id);
        })
        .filter((x) => !!x)
        .map((x) => x as Promise<VideoDownloadResult>)
    );

    const failedDownload = ids.filter(
      (id) => result.findIndex((r) => r.id === id) === -1
    );
    if (failedDownload.length > 0) {
      console.log('Failed to download', failedDownload);
    }

    await mpdService.update();
    setDownloading(false);
  }

  const downloadAll = () => {
    const ids = playlist.videos.map((v) => v.id);
    download(ids);
  }

  const toggleAllVideos = () => {
    const disabled = playlist.videos.every((v) => !v.disabled);

    playlist.videos.forEach((v) => {
      v.disabled = disabled;
      onVideoUpdate(v);
    });
  }

  const clickedPlaylistVideo = (video: PlaylistVideo) => {
    if (editPlaylist) {
      video.disabled = !video.disabled;
      onVideoUpdate(video);
    } else {
      onVideoClick(video);
    }
  }

  const editMode = !!editPlaylist;

  const newVideos: React.ReactElement[] = []
  const downloadedVideos: React.ReactElement[] = []

  playlist.videos.forEach(v => {
    if (videoService.isVideoDownloaded(v.id)) {
      downloadedVideos.push(
        <li key={v.id} className="flex-horizontal">
          <PlaylistVideoBlock
            playlistVideo={v}
            disabled={v.disabled}
            editing={editMode}
            onClick={() => clickedPlaylistVideo(v)}
          />
        </li>
      )
    } else {
      newVideos.push(
        <li key={v.id}>
          <PlaylistVideoBlock
            playlistVideo={v}
            onClick={() => download([v.id])}
            disabled={downloading}
          />
        </li>
      );
    }
  });

  const enabled = playlist.videos.every((v) => !v.disabled);

  return (
    <>
      <div className="flex-vertical gap">
        {editPlaylist && (
          <FlexBox style={{ justifyContent: 'flex-start' }}>
            <Checkbox
              checked={enabled}
              onChange={() => toggleAllVideos()}
            />
            {/* <InputField // playlist id cannot be changed anymore
                placeholder="Playlist Id"
                value={editPlaylist.playlistId}
                onChange={(e) => this.onPlaylistIdChange(e)}
              /> */}
          </FlexBox>
        )}
        {downloadedVideos.length > 0 && <ul>{downloadedVideos}</ul>}
      </div>
      {
        newVideos.length > 0 && (
          <div>
            <Typography variant="h5">Not Downloaded Videos</Typography>
            <Tooltip title="Download all">
              <IconButton
                onClick={() => downloadAll()}
                disabled={downloading}
              >
                <GetApp />
              </IconButton>
            </Tooltip>
            <ul>{newVideos}</ul>
          </div>
        )
      }
    </>
  )
}
