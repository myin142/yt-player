import { EventEmitter } from "events";
import * as fs from "fs-extra";
import { PlaylistInfo } from "../types";
import { ipcRenderer } from "electron";

export class PlaylistService extends EventEmitter {
  private static CLOUD_URL =
    "https://kgd07w68ll.execute-api.eu-central-1.amazonaws.com/prod";

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

  public hasCloudSync() {
    return !!this.playlists.id;
  }

  async syncFromCloud(id = this.playlists.id) {
    if (!id) {
      console.log("Id cannot be empty");
      return;
    }

    const data = await fetch(this.buildSyncUrl(id)).then((x) => x.json());
    if (Array.isArray(data)) {
      this.playlists = {
        id,
        playlists: data,
      };
      await this.updatePlaylists();
    } else {
      console.log("Invalid data fetched from cloud", data);
    }
  }

  async uploadToCloud(id = this.playlists.id) {
    if (!id) {
      console.log("Id cannot be empty");
      return;
    }

    await fetch(this.buildSyncUrl(id), {
      method: "POST",
      body: JSON.stringify(this.playlists.playlists),
    });

    this.playlists.id = id;
    await this.updatePlaylists();
  }

  private buildSyncUrl(id: string) {
    return `${PlaylistService.CLOUD_URL}/playlist/${id}`;
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
