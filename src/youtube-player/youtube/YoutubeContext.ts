import React from "react";
import { LocalMpdService } from "../../services/local-mpd.service";
import LocalYoutubeDlService from "./LocalYoutubeDlService";
import { VideoService } from "./VideoService";

export const ytService = new LocalYoutubeDlService();
export const videoService = new VideoService(ytService);
export const mpdService = new LocalMpdService(videoService);

export const YoutubeContext = React.createContext({
  service: ytService,
  videoService,
  mpdService,
})
