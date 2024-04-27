export interface PlaylistFolderInfo {
  playlist: PlaylistInfo;
  fullPath: string;
  name: string;
}

export interface PlaylistInfo {
  playlistId: string;
  title: string;
  videos: PlaylistVideo[];
}

export interface PlaylistVideo {
  id: string;
  title: string;
  disabled?: boolean;
}

export interface PlaylistState {
  playingVideo: PlaylistVideo | null;
}

export const PLAY_VIDEO = 'PLAY_VIDEO';

interface PlayVideoAction {
  type: typeof PLAY_VIDEO;
  payload: PlaylistVideo;
}

export type PlaylistActionTypes = PlayVideoAction;
