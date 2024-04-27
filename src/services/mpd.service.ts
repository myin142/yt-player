export interface MpdService {
  getStatus(): Promise<Status>;
  getQueue(): Promise<string[]>;

  update(): Promise<void>;
  next(): Promise<void>;
  play(id: string): Promise<void>;
  queuePlaylist(ids: string[]): Promise<void>;

  toggleRandom(): Promise<void>;
}

export interface Status {
  state: 'playing' | 'paused' | null;
  random: boolean;
  repeat: boolean;
}
