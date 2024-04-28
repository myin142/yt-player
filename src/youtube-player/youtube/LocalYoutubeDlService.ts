import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ipcRenderer } from "electron";
import * as _ from "lodash";
import * as fs from "fs-extra";
import {
  VideoDownloadOptions,
  VideoDownloadResult,
  YoutubePlaylistInfo,
  YoutubeService,
} from "./YoutubeService";

export default class LocalYoutubeDlService implements YoutubeService {
  private THUMBNAIL_CACHE_FILE = "ytdl-thumbnails.json";

  private cmd: ChildProcessWithoutNullStreams | null = null;

  // TODO: save in cache folder
  private thumbnailCache: { [id: string]: string } = {};

  private thumbnailCmd: { [id: string]: ChildProcessWithoutNullStreams } = {};

  private cacheThumbnail = _.debounce(() => {
    fs.outputJson(this.thumbnailCachePath, this.thumbnailCache);
  }, 5000);

  private cachePath = "";
  private loaded = false;

  constructor() {
    ipcRenderer.invoke("getAppPath").then((x) => {
      this.cachePath = x;
      this.loadThumbnailCache();
      this.loaded = true;
    });
  }

  private async loadThumbnailCache() {
    const exists = await fs.pathExists(this.thumbnailCachePath);
    if (exists) {
      this.thumbnailCache = await fs.readJSON(this.thumbnailCachePath);
    }
  }

  private get thumbnailCachePath() {
    return `${this.cachePath}/${this.THUMBNAIL_CACHE_FILE}`;
  }

  async getPlaylistVideoInfos(
    playlist: string
  ): Promise<YoutubePlaylistInfo | null> {
    let outputs: string[] = [];
    try {
      outputs = await this.executeYoutubeDL([
        "--skip-download",
        "--flat-playlist",
        "-J",
        "--",
        playlist,
      ]);
    } catch (err) {
      console.log(err);
    }

    if (outputs.length === 0) {
      return null;
    }

    const data = JSON.parse(outputs[0]);
    // eslint-disable-next-line no-underscore-dangle
    if (data._type !== "playlist") {
      return null;
    }

    return data;
  }

  public getThumbnail(id: string): string {
    if (this.thumbnailCache[id]) {
      return this.thumbnailCache[id];
    }

    if (this.thumbnailCmd[id]) {
      return "";
    }

    // Thumbnail cache not loaded yet, download might not be required
    if (!this.loaded) return;

    this.executeYoutubeDL(["--get-thumbnail", "--", id], (cmd) => {
      this.thumbnailCmd[id] = cmd;
    })
      .then((urls) => {
        const thumbnail = urls.length > 0 ? urls[0] : "";
        if (thumbnail) {
          this.thumbnailCache[id] = thumbnail;
        }

        this.cacheThumbnail();
        return thumbnail;
      })
      .catch((err) => {
        console.log(err);
      });
    return "";
  }

  async downloadVideo({
    id,
    location,
  }: VideoDownloadOptions): Promise<VideoDownloadResult | null> {
    try {
      const outputs = await this.executeYoutubeDL([
        "--output",
        `${location}/${id}.%(ext)s`,
        "--format",
        "bestaudio/best",
        "--add-metadata",
        "--",
        id,
      ]);

      const lines = outputs.join("\n").split("\n");
      const names = lines
        .map((line) => {
          if (line.includes("Destination: ")) {
            return line.substr(line.indexOf(location)).trim();
          }

          if (line.includes("has already been downloaded")) {
            return line.substr(line.indexOf(location)).split("has")[0].trim();
          }
          return null;
        })
        .filter((x) => x)
        .map((fullPath) => {
          if (fullPath == null) return null;
          const parts = fullPath.split("/");
          return parts[parts.length - 1];
        }) as string[];

      return { id, name: names[0] };
    } catch (err) {
      console.log("Download failed");
    }

    return null;
  }

  stopAction(): boolean {
    if (this.cmd != null) {
      return this.cmd.kill();
    }

    return false;
  }

  private async executeYoutubeDL(
    args: string[],
    saveCmd = (cmd: ChildProcessWithoutNullStreams) => {
      this.cmd = cmd;
    }
  ): Promise<string[]> {
    const cmd = spawn("yt-dlp", ["--skip-unavailable-fragments", ...args]);
    saveCmd(cmd);

    return new Promise((resolve, reject) => {
      const outputs: string[] = [];

      cmd.stdout.on("data", (data: Buffer) => {
        const output = data.toString("utf-8");
        outputs.push(output);
        console.log(output);
      });

      cmd.stderr.on("data", (err: Buffer) => {
        console.log("Error", err.toString("utf-8"));
      });

      cmd.on("exit", (code) => {
        if (code === 0) {
          resolve(outputs);
        } else {
          reject(new Error(`${code}`));
        }
        this.cmd = null;
      });
    });
  }
}
