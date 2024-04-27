export interface MusicQueueConfig {
  random?: boolean;
  max_queue: number;
  max_index: number;
  exclude?: number[];
}

export class MusicQueue {
  constructor(
    private config: MusicQueueConfig,
    public readonly queue: number[] = []
  ) {
    this.fill();
  }

  updateConfig(config: Partial<MusicQueueConfig>) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  peek(): number {
    return this.queue[0];
  }

  pop(): number {
    const value = this.queue.shift();
    return value == null ? -1 : value;
  }

  popAndFill(): number {
    const value = this.pop();
    this.fill();
    return value;
  }

  private fill() {
    while (this.queue.length < this.config.max_queue) {
      this.queue.push(this.nextQueueIndex());
    }
  }

  private nextQueueIndex() {
    const excludedIdx = this.config.exclude || [];
    const lastIdx =
      this.queue.length === 0 ? -1 : this.queue[this.queue.length - 1];

    const randomVideoIdx = () =>
      Math.floor(Math.random() * this.config.max_index);
    const nextVideoIdx = (idx: number) => {
      let newIdx = idx + 1;
      if (newIdx >= this.config.max_index) {
        newIdx = 0;
      }
      return newIdx;
    };

    const maxLoops = 1000;
    let count = 0;
    let idx = this.config.random ? -1 : lastIdx;
    do {
      count++;
      idx = this.config.random ? randomVideoIdx() : nextVideoIdx(idx);
      if (count >= maxLoops) {
        console.log('Stop continuing getting queue index. Reached max retries');
        break;
      }
    } while (
      (this.queue.includes(idx) &&
        this.config.max_index >= this.config.max_queue) ||
      excludedIdx.includes(idx)
    );

    return idx;
  }
}
