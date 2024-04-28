import React, { useContext, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { PlaylistInfo, PlaylistVideo } from "../types";
import { PlaylistVideoBlock } from "./PlaylistVideoBlock";
import FlexBox from "../../components/FlexBox";
import { YoutubeContext } from "../youtube/YoutubeContext";
import { VideoDownloadResult } from "../youtube/YoutubeService";

interface VideoListProps {
  playlist: PlaylistInfo;
  onVideoClick: (x: PlaylistVideo) => void;
  onVideoUpdate: (x: PlaylistVideo) => void;
  editPlaylist: PlaylistInfo | null;
}

export default function PlaylistVideos({
  editPlaylist,
  playlist,
  onVideoClick,
  onVideoUpdate,
}: VideoListProps) {
  const { videoService, mpdService } = useContext(YoutubeContext);
  const [downloading, setDownloading] = useState(false);

  const download = async (ids: string[]) => {
    if (downloading) {
      console.log("Already downloading something");
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
      console.log("Failed to download", failedDownload);
    }

    await mpdService.update();
    setDownloading(false);
  };

  const downloadAll = () => {
    const ids = playlist.videos.map((v) => v.id);
    download(ids);
  };

  const toggleAllVideos = () => {
    const disabled = playlist.videos.every((v) => !v.disabled);

    playlist.videos.forEach((v) => {
      v.disabled = disabled;
      onVideoUpdate(v);
    });
  };

  const clickedPlaylistVideo = (video: PlaylistVideo) => {
    if (editPlaylist) {
      video.disabled = !video.disabled;
      onVideoUpdate(video);
    } else {
      onVideoClick(video);
    }
  };

  const editMode = !!editPlaylist;

  const newVideos: React.ReactElement[] = [];
  const downloadedVideos: React.ReactElement[] = [];

  playlist.videos.forEach((v) => {
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
      );
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
          <FlexBox classes="justify-start">
            <input
              type="checkbox"
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
      {newVideos.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="font-bold">Not Downloaded Videos</div>
            <button
              title="Download all"
              onClick={() => downloadAll()}
              disabled={downloading}
            >
              <FaDownload />
            </button>
          </div>
          <ul>{newVideos}</ul>
        </div>
      )}
    </>
  );
}
