import * as fs from "fs-extra";
import * as _ from "lodash";
import { ipcRenderer } from "electron";
import { VideoDownloadResult, YoutubeService } from "./YoutubeService";

export class VideoService {
  private static DOWNLOAD_VIDEO_FOLDER = "yt-player-videos";

  private static DOWNLOAD_CACHE = ".downloaded.json";

  private videoMap: { [s: string]: string } = {};

  private appPath = "";

  constructor(public youtubeService: YoutubeService, private filesystem = fs) {
    ipcRenderer.invoke("getAppPath").then((x) => (this.appPath = x));
    this.loadDownloadedCache();
  }

  // TODO: create cache service?
  private async loadDownloadedCache() {
    const exists = await this.filesystem.pathExists(this.downloadCacheFile);
    if (exists) {
      this.videoMap = await this.filesystem.readJSON(this.downloadCacheFile);
    }
  }

  private cacheVideos = _.debounce(
    () => this.filesystem.outputJson(this.downloadCacheFile, this.videoMap),
    5000
  );
  private get downloadCacheFile(): string {
    return `${this.downloadFolder}/${VideoService.DOWNLOAD_CACHE}`;
  }

  private get downloadFolder(): string {
    return `${this.appPath}/${VideoService.DOWNLOAD_VIDEO_FOLDER}`;
  }

  downloadVideo(id: string): Promise<VideoDownloadResult | null> {
    return this.youtubeService
      .downloadVideo({
        id,
        location: this.downloadFolder,
      })
      .then((r) => {
        if (r) {
          this.videoMap[r.id] = r.name;
          this.cacheVideos();
        }
        return r;
      });
  }

  videoPath(id: string, relative = false): string {
    let result = "";
    if (!relative) {
      result += `${this.downloadFolder}/`;
    }
    result += this.videoMap[id];
    return result;
  }

  isVideoDownloaded(id: string): boolean {
    return this.videoMap[id] != null;
  }
}
