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
  }, 2000);

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

    // Don't use high resolution image for thumbnails
    const resolutionList = ["480", "360", "180"];
    const notFound = "assets/not_found.png";

    this.executeYoutubeDL(
      ["--get-thumbnail", "--list-thumbnails", "--", id],
      (cmd) => {
        this.thumbnailCmd[id] = cmd;
      }
    )
      .then((urls) => {
        // Fallback highres if no other resolution found
        let thumbnail = urls.length > 1 ? urls[1] : notFound;

        // "26 320     180     https://i.ytimg.com/vi/WtoTuv1HNHQ/mqdefault.jpg"
        // "27 unknown unknown https://i.ytimg.com/vi_webp/WtoTuv1HNHQ/mqdefault.webp"
        const list = urls[0].split("\n");
        const items = list
          .map((x) => x.split(" ").filter((x) => !!x))
          .filter((x) => x.length >= 4)
          .map((x) => {
            const resolution = x[2].trim();
            const url = x[3].trim();
            return { resolution, url };
          })
          .filter((x) => resolutionList.includes(x.resolution))
          .sort(
            (a, b) =>
              resolutionList.indexOf(a.resolution) -
              resolutionList.indexOf(b.resolution)
          );

        if (items.length > 0) {
          thumbnail = items[0].url;
        }

        if (thumbnail) {
          this.thumbnailCache[id] = thumbnail;
        }

        this.finishThumbnailDownload(id);
        return thumbnail;
      })
      .catch((err) => {
        console.log(err);
        this.thumbnailCache[id] = notFound;
        this.finishThumbnailDownload(id);
      });
    return "";
  }

  private finishThumbnailDownload(id: string) {
    delete this.thumbnailCmd[id];
    if (Object.keys(this.thumbnailCmd).length === 0) {
      this.cacheThumbnail();
    }
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
            return line.substring(line.indexOf(location)).trim();
          }

          if (line.includes("has already been downloaded")) {
            return line
              .substring(line.indexOf(location))
              .split("has")[0]
              .trim();
          }
          return null;
        })
        .filter((x) => x)
        .map((fullPath) => {
          if (fullPath == null) return null;
          const parts = fullPath.split("/");
          return parts[parts.length - 1];
        });

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
        // console.log(output);
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
