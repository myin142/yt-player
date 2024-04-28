import React, { useContext, useEffect, useState } from "react";
import { FaPlus, FaX } from "react-icons/fa6";
import { PlaylistInfo } from "../types";
import { PlaylistContext } from "./PlaylistContext";
import { YoutubeContext } from "../youtube/YoutubeContext";

export interface PlaylistsProps {
  selectedPlaylist: PlaylistInfo | null;
  onPlaylistSelected: (i: PlaylistInfo | null) => void;
}

export interface PlaylistsState {
  playlists: PlaylistInfo[];
  showCreatePlaylist: boolean;
  createPlaylistId: string;
  createPlaylistError: string;
  creating: boolean;
}

export function Playlists({
  selectedPlaylist,
  onPlaylistSelected,
}: PlaylistsProps) {
  const { service: ytService, videoService } = useContext(YoutubeContext);
  const { service } = useContext(PlaylistContext);
  const [playlists, setPlaylists] = useState([] as PlaylistInfo[]);
  const [createPlaylistError, setCreatePlaylistError] = useState("");
  const [createPlaylistId, setCreatePlaylistId] = useState("");
  const [creating, setCreating] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null as NodeJS.Timeout | null);

  useEffect(() => {
    service.loadPlaylists();
    service.addListener("playlistUpdated", (p: PlaylistInfo[]) => {
      setPlaylists(p.sort((a, b) => a.title.localeCompare(b.title)));
      setCreatePlaylistError("");
      setCreatePlaylistId("");
      setCreating(false);
    });

    return () => {
      service.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (createPlaylistError !== "") {
      setTimeoutId(setTimeout(() => setCreatePlaylistError(""), 3000));
    } else if (timeoutId != null) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [createPlaylistError]);

  const createPlaylist = async () => {
    if (playlists.find((p) => p.playlistId === createPlaylistId) != null) {
      setCreatePlaylistError("Playlist Id is already added");
      return;
    }

    setCreating(true);
    const info = await ytService.getPlaylistVideoInfos(createPlaylistId);

    if (info != null) {
      info.entries.forEach((e) => {
        // Load thumbnail to cache earlier
        ytService.getThumbnail(e.id);
      });

      service.updatePlaylist({
        playlistId: createPlaylistId,
        title: info?.title,
        videos: info.entries.map((i) => ({ id: i.id, title: i.title })), // Entries contain more information
      });
    } else {
      setCreating(false);
      setCreatePlaylistError("Failed to get playlist info");
    }
  };

  const playlistsList = playlists.map((p, i) => {
    const downloadedVideos = p.videos.filter((v) =>
      videoService.isVideoDownloaded(v.id)
    );
    const isSelected = selectedPlaylist?.playlistId === p.playlistId;
    const noneDownloaded = downloadedVideos.length === 0;
    return (
      <li key={i}>
        <button
          className={`p-2 rounded w-full flex gap-4 items-center justify-between ${
            isSelected ? "bg-red-400" : ""
          } ${noneDownloaded ? "opacity-50" : ""}`}
          type="button"
          onClick={() => onPlaylistSelected(p)}
          onKeyUp={() => onPlaylistSelected(p)}
        >
          <span>{p.title || "Not a playlist"}</span>
          <span className="text-sm opacity-75">
            {downloadedVideos.length}/{p.videos.length}
          </span>
        </button>
      </li>
    );
  });

  return (
    <div className="flex-vertical" style={{ gap: "1em" }}>
      <div className="font-bold">Playlists</div>
      <div className="flex gap-4">
        <input
          className="px-2 py w-full rounded bg-slate-600"
          style={{ background: "#3f3f3f" }}
          value={createPlaylistId}
          onChange={(e) => setCreatePlaylistId(e.target.value)}
        />
        <button
          title="Add youtube playlist"
          aria-label="add"
          disabled={creating}
          onClick={() => createPlaylist()}
        >
          <FaPlus />
        </button>
      </div>

      {createPlaylistError && (
        <div className="flex gap-2 absolute bottom-4 left-1/2 p-4 bg-red-800 rounded">
          <span>{createPlaylistError}</span>
          <button
            aria-label="close"
            color="inherit"
            onClick={() => setCreatePlaylistError("")}
          >
            <FaX />
          </button>
        </div>
      )}
      <ul>{playlistsList}</ul>
    </div>
  );
}
