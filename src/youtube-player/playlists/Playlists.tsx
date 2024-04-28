import React, { useContext, useEffect, useState } from "react";
import { FaPlus, FaX } from "react-icons/fa6";
import { PlaylistInfo } from "../types";
import { PlaylistSyncButtons } from "./PlaylistSyncButtons";
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
  const { service: ytService } = useContext(YoutubeContext);
  const { service } = useContext(PlaylistContext);
  const [playlists, setPlaylists] = useState([] as PlaylistInfo[]);
  const [createPlaylistError, setCreatePlaylistError] = useState("");
  const [createPlaylistId, setCreatePlaylistId] = useState("");
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [creating, setCreating] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null as NodeJS.Timeout | null);

  useEffect(() => {
    service.loadPlaylists();
    service.addListener("playlistUpdated", (p) => {
      setPlaylists(p);
      setCreatePlaylistError("");
      setCreatePlaylistId("");
      setShowCreatePlaylist(false);
      setCreating(false);
    });

    return () => {
      service.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (createPlaylistError !== "") {
      setTimeoutId(setTimeout(() => setCreatePlaylistError(""), 3000));
    } else if(timeoutId != null) {
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
    return (
      <li key={i}>
        <button
          className="btn-2"
          type="button"
          onClick={() => onPlaylistSelected(p)}
          onKeyUp={() => onPlaylistSelected(p)}
          style={
            selectedPlaylist?.playlistId === p.playlistId
              ? { fontWeight: "bold" }
              : {}
          }
        >
          {p.title || "Not a playlist"}
        </button>
      </li>
    );
  });

  return (
    <div className="flex-vertical" style={{ gap: "1em" }}>
      <div className="flex-horizontal">
        <button
          title="Add youtube playlist"
          aria-label="add"
          onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
        >
          <FaPlus />
        </button>
        {/* <PlaylistSyncButtons /> */}
      </div>

      {createPlaylistError && (
        <div className="flex gap-2 absolute bottom-4 left-1/2 p-2 bg-red-800 rounded">
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
      {showCreatePlaylist && (
        <div className="flex-horizontal" style={{ gap: "0.5em" }}>
          <input
            className="px py-2 w-full rounded bg-slate-600"
            style={{ background: "#3f3f3f" }}
            value={createPlaylistId}
            onChange={(e) => setCreatePlaylistId(e.target.value)}
          />
          <button
            className="btn-2"
            style={{ flexShrink: 1, width: "unset" }}
            type="button"
            disabled={creating}
            onClick={() => createPlaylist()}
          >
            Create
          </button>
        </div>
      )}
      <ul>{playlistsList}</ul>
    </div>
  );
}
