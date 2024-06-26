export interface MpdService {
  getStatus(): Promise<Status>;
  getQueue(): Promise<QueueItem[]>;

  update(): Promise<void>;
  next(): Promise<void>;
  play(id: string): Promise<void>;
  queuePlaylist(ids: string[]): Promise<void>;

  setShuffle(shuffle: boolean): Promise<void>;
  playFromQueue(idx: number): Promise<void>;
  playNext(): Promise<void>;
  playPrev(): Promise<void>;
  playToggle(): Promise<void>;
  setVolume(v: number): Promise<void>;
}

export interface Status {
  state: "playing" | "paused" | null;
  shuffle: boolean;
  repeat: boolean;
  playing: string;
  nextPlaying: string;
  volume: number;
}

export interface QueueItem {
  title: string;
  id: string;
}
