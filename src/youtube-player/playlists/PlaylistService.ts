import { EventEmitter } from "events";
import * as fs from "fs-extra";
import { PlaylistInfo } from "../types";
import { ipcRenderer } from "electron";

export class PlaylistService extends EventEmitter {
  private static PLAYLIST_FILE = "playlists.json";

  playlists: PlaylistCloud = {
    id: "",
    playlists: [],
  };

  private appPath = "";

  constructor(private filesystem = fs) {
    super();
    ipcRenderer.invoke("getAppPath").then((x) => (this.appPath = x));
  }

  private get playlistPath(): string {
    return `${this.appPath}/${PlaylistService.PLAYLIST_FILE}`;
  }

  findPlaylistForVideo(id: string) {
    return this.playlists.playlists.find((pl) =>
      pl.videos.some((v) => v.id === id)
    );
  }

  async loadPlaylists(): Promise<boolean> {
    if (this.filesystem.existsSync(this.playlistPath)) {
      return this.filesystem
        .readFile(this.playlistPath)
        .then((x) => JSON.parse(x.toString()))
        .then((p) => {
          this.playlists = p;
          this.emitPlaylistUpdate();
          return true;
        });
    }

    return false;
  }

  async updatePlaylist(playlist: PlaylistInfo) {
    const idx = this.playlists.playlists.findIndex(
      (p) => p.playlistId === playlist.playlistId
    );
    if (idx !== -1) {
      this.playlists.playlists[idx] = playlist;
    } else {
      this.playlists.playlists.push(playlist);
    }
    await this.updatePlaylists();
  }

  private async updatePlaylists() {
    await this.filesystem.outputJSON(this.playlistPath, this.playlists);
    this.emitPlaylistUpdate();
  }

  private emitPlaylistUpdate() {
    this.emit("playlistUpdated", [...this.playlists.playlists]);
  }
}

export interface PlaylistCloud {
  id: string;
  playlists: PlaylistInfo[];
}
