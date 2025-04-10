import React, { useContext, useEffect, useState } from "react";
import PlaylistQueue from "./playlists/PlaylistQueue";
import { Playlists } from "./playlists/Playlists";
import { PlaylistInfo, PlaylistVideo } from "./types";
import LocalYoutubeDlService from "./youtube/LocalYoutubeDlService";
import { MainPanel } from "./MainPanel";
import { QueueItem, Status } from "../services/mpd.service";
import { PlaylistContext } from "./playlists/PlaylistContext";
import { mpdService, videoService } from "./youtube/YoutubeContext";
import PlaylistControls from "./playlists/PlaylistControls";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { spawn } from "child_process";
import _ from "lodash";
import fs from "fs";
import path from "path";
import os from "os";

const youtubeService = new LocalYoutubeDlService();

export default function YoutubePlayerPage() {
  const [selectedPlaylist, setSelectedPlaylist] = useState(
    null as PlaylistInfo | null
  );
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState([] as QueueItem[]);
  const [status, setStatus] = useState(null as Status | null);

  const [queueCollapsed, setQueueCollapsed] = useState(false);
  const [playlistCollapsed, setPlaylistCollapsed] = useState(false);

  const [currentMessage, setCurrentMessage] = useState("");
  const [timer, setTimer] = useState(null as NodeJS.Timeout | null);

  const { service, events } = useContext(PlaylistContext);

  useEffect(() => {
    events.notification = (msg) => {
      setCurrentMessage(msg);
      setTimer(setTimeout(() => setCurrentMessage(""), 3000));
    };
  }, []);

  useEffect(() => {
    if (currentMessage == "") {
      setTimer(null);
    }
  }, [currentMessage]);

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

  const throttleSetVolume = _.throttle((v) => mpdService.setVolume(v), 100);
  const debounceUpdateStatus = _.debounce(() => updateStatus(), 300);
  const setVolume = async (v: number) => {
    throttleSetVolume(v);
    debounceUpdateStatus();
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

  const downloadPlaylistVideos = async (playlist: PlaylistInfo) => {
    // Currently just download from temp folder
    // Zip could be a bit complicated
    const tmpPath = path.join(os.tmpdir(), "yt-player-videos");
    if (fs.existsSync(tmpPath)) {
      fs.rmdirSync(tmpPath, { recursive: true });
    }
    fs.mkdirSync(tmpPath);

    playlist.videos
      .filter((v) => !v.disabled)
      .forEach(async (v) => {
        const videoPath = videoService.videoPath(v.id);
        const dest = path.join(tmpPath, `${v.title.replace("/", "-")}.mp3`);

        console.log("Copying", videoPath, dest);
        const cmd = spawn("ffmpeg", ["-i", videoPath, dest]);
        // cmd.stderr.on("data", (data) => {
        //   console.log(data.toString());
        // });
      });
  };

  return (
    <>
      <div className="flex grow p-4 gap-2">
        {(!playlistCollapsed && (
          <nav className="flex flex-col justify-between basis-80 gap">
            <div className="panel flex grow items-stretch">
              <Playlists
                selectedPlaylist={selectedPlaylist}
                playingVideo={queue.find((q) => q.id === status?.playing)?.id}
                onPlaylistSelected={(p) => setSelectedPlaylist(p)}
                onCollapseToggle={() =>
                  setPlaylistCollapsed(!playlistCollapsed)
                }
              />
            </div>
          </nav>
        )) || (
          <nav className="panel">
            <button onClick={() => setPlaylistCollapsed(!playlistCollapsed)}>
              <MdArrowForwardIos />
            </button>
          </nav>
        )}
        <div className="flex flex-col grow gap-2">
          {selectedPlaylist && (
            <MainPanel
              selectedPlaylist={selectedPlaylist}
              onPlay={(v) => playSelectedPlaylist(v)}
              onReload={(p) => loadPlaylistVideos(p)}
              onUpdateFolder={(p) => updatePlaylist(p)}
              onDownload={(p) => downloadPlaylistVideos(p)}
            />
          )}
        </div>
        {status &&
          queue.length > 0 &&
          ((!queueCollapsed && (
            <aside className="side-panel basis-[36rem]">
              <div className="panel flex flex-col gap-4 grow">
                <div className="flex flex-col grow">
                  <PlaylistQueue
                    queue={queue}
                    status={status}
                    onPlayQueue={(i) => playFromQueue(i)}
                    onCollapseToggle={() => setQueueCollapsed(!queueCollapsed)}
                  />
                </div>

                <PlaylistControls
                  status={status}
                  onShuffle={(x) => setShuffle(x)}
                  onPlayNext={() => playNext()}
                  onPlayPrev={() => playPrev()}
                  onPlayToggle={() => playToggle()}
                  onSetVolume={(v) => setVolume(v)}
                />
              </div>
              <div
                className="rounded w-full h-96 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${youtubeService.getThumbnail(
                    status.playing
                  )})`,
                }}
              ></div>
            </aside>
          )) || (
            <aside className="side-panel panel">
              <button onClick={() => setQueueCollapsed(!queueCollapsed)}>
                <MdArrowBackIos />
              </button>
            </aside>
          ))}
      </div>

      {currentMessage && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-blue-500 text-white p-2 rounded mb-2">
          {currentMessage}
        </div>
      )}
    </>
  );
}
