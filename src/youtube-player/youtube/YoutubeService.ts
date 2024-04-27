export interface YoutubeService {
  getPlaylistVideoInfos(playlist: string): Promise<YoutubePlaylistInfo | null>;
  downloadVideo(opt: VideoDownloadOptions): Promise<VideoDownloadResult | null>;
  stopAction(): boolean;
  getThumbnail(id: string): string;
}

export interface YoutubePlaylistInfo {
  title: string;
  entries: VideoInfo[];
}

export interface VideoInfo {
  id: string;
  title: string;
}

export interface VideoDownloadOptions {
  id: string;
  location: string;
}

export enum VideoFormat {
  AUDIO,
  VIDEO,
}

export interface VideoDownloadResult {
  id: string;
  name: string;
}

// TODO: find better place
export enum Status {
  NONE,
  SEARCHING,
  DOWNLOADING,
}
