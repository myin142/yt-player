import React, { useContext, useEffect, useState } from "react";
import PlaylistQueue from "./playlists/PlaylistQueue";
import { Playlists } from "./playlists/Playlists";
import { PlaylistInfo, PlaylistVideo } from "./types";
import LocalYoutubeDlService from "./youtube/LocalYoutubeDlService";
import { MainPanel } from "./MainPanel";
import { QueueItem, Status } from "../services/mpd.service";
import { PlaylistContext } from "./playlists/PlaylistContext";
import { mpdService, videoService } from "./youtube/YoutubeContext";

const youtubeService = new LocalYoutubeDlService();

export default function YoutubePlayerPage() {
  const [selectedPlaylist, setSelectedPlaylist] = useState(
    null as PlaylistInfo | null
  );
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState([] as QueueItem[]);
  const [status, setStatus] = useState(null as Status | null);

  const { service } = useContext(PlaylistContext);

  useEffect(() => {
    mpdService.update();
    updateQueue();
    updateStatus();
    // updateStatus().then(() => updateQueue());
    setInterval(() => updateStatus(), 3000);
  }, [mpdService]);

  const playSelectedPlaylist = async (video: PlaylistVideo) => {
    if (!videoService.isVideoDownloaded(video.id)) {
      console.log("Video is not downloaded", video);
      return;
    }

    const videoIds = selectedPlaylist?.videos
      .filter((v) => !v.disabled && videoService.isVideoDownloaded(v.id))
      .map((v) => v.id);

    if (videoIds) {
      try {
        await mpdService.queuePlaylist(videoIds);
        await mpdService.play(video.id);
        await updateStatus();
        await updateQueue();
      } catch (e) {
        console.log(e);
      }
    }
  };

  const setShuffle = async (shuffle: boolean) => {
    await mpdService.setShuffle(shuffle);
    await updateStatus();
  };

  const playFromQueue = async (idx: number) => {
    await mpdService.playFromQueue(idx);
    await updateStatus();
  };

  const playNext = async () => {
    await mpdService.playNext();
    await updateStatus();
  };

  const playPrev = async () => {
    await mpdService.playPrev();
    await updateStatus();
  };

  const playToggle = async () => {
    await mpdService.playToggle();
    await updateStatus();
  };

  const updateStatus = async () => {
    const status = await mpdService.getStatus();
    console.log("Updating status", status);
    if (status.state != null) {
      setStatus(status);
    } else {
      setStatus(null);
    }
  };

  const updateQueue = async () => {
    const queue = await mpdService.getQueue();
    setQueue(queue);
  };

  // const updatePlaylistVideo = (video: PlaylistVideo) => {
  //   const playlist = selectedPlaylist;
  //   if (playlist == null) return;

  //   const currentVideos = playlist?.videos || [];
  //   const index = currentVideos.findIndex((v) => v.id === video.id);

  //   if (index !== -1) {
  //     playlist.videos[index] = video;
  //     updatePlaylist(playlist);
  //   }
  // };

  const updatePlaylist = (playlist: Partial<PlaylistInfo>) => {
    if (selectedPlaylist != null) {
      const updated = {
        ...selectedPlaylist,
        ...playlist,
      };

      service.updatePlaylist(updated);
      setSelectedPlaylist(updated);
    }
  };

  const loadPlaylistVideos = async (playlist = selectedPlaylist) => {
    const playlistId = playlist?.playlistId;
    const pl = playlist || selectedPlaylist;
    if (!playlistId) {
      console.log("Cannot load playlist videos without id");
      return;
    }

    if (loading) {
      console.log("Already loading something");
      return;
    }

    setLoading(true);
    const info = await youtubeService.getPlaylistVideoInfos(playlistId);

    // TODO: share with Playlists code
    if (info != null) {
      const existingVideos = pl?.videos || [];
      const mergedVideos: PlaylistVideo[] = [];

      info.entries.forEach((e) => {
        // Load thumbnail to cache earlier
        youtubeService.getThumbnail(e.id);

        const entry: PlaylistVideo = {
          id: e.id,
          title: e.title,
        };

        const existing = existingVideos.find((v) => v.id === e.id);
        if (!existing) {
          mergedVideos.push(entry);
        } else {
          mergedVideos.push({
            ...existing,
            ...entry,
          });
        }
      });

      updatePlaylist({
        ...pl,
        playlistId,
        videos: mergedVideos,
        title: info.title,
      });
    }

    setLoading(false);
  };

  return (
    <>
      <div className="flex grow p-4 gap-2">
        <nav className="flex flex-col justify-between basis-80 gap">
          <div className="panel scroll">
            <Playlists
              selectedPlaylist={selectedPlaylist}
              onPlaylistSelected={(p) => setSelectedPlaylist(p)}
            />
          </div>
        </nav>
        <div className="flex flex-col grow gap-2">
          {selectedPlaylist && (
            <MainPanel
              selectedPlaylist={selectedPlaylist}
              onPlay={(v) => playSelectedPlaylist(v)}
              onReload={(p) => loadPlaylistVideos(p)}
              onUpdateFolder={(p) => updatePlaylist(p)}
            />
          )}
        </div>
        {status && queue.length > 0 && (
          <aside className="side-panel basis-84">
            <div className="panel flex grow">
              <PlaylistQueue
                queue={queue}
                status={status}
                onShuffle={(x) => setShuffle(x)}
                onPlayQueue={(i) => playFromQueue(i)}
                onPlayNext={() => playNext()}
                onPlayPrev={() => playPrev()}
                onPlayToggle={() => playToggle()}
              />
            </div>
            <img
              src={youtubeService.getThumbnail(status.playing)}
              alt="Playing Video Thumbnail"
              className="bg-cover rounded max-w-lg"
            />
          </aside>
        )}
      </div>
    </>
  );
}
