import { spawn } from 'child_process';
import { VideoService } from '../youtube-player/youtube/VideoService';
import { MpdService, Status } from "./mpd.service";

export class LocalMpdService implements MpdService {

  constructor(private readonly videoService: VideoService) {
  }

  async update() {
    await this.mpc(['update']);
  }

  private resolve(id: string): string {
    return this.videoService.videoPath(id, true);
  }

  private parseId(file: string): string {
    return file.split('.')[0];
  }

  async next() {
    this.mpc(['next']);
  }

  async play(id: string) {
    const queue = await this.getQueue();
    const idx = queue.indexOf(id);
    if (idx !== -1) {
      await this.mpc([`del`, `${idx+1}`]);
    }

    await this.mpc(['insert', '--', this.resolve(id)]);

    const status = await this.getStatus();
    if (status.state === "playing") {
      await this.next();
    } else {
      await this.mpc(['play']);
    }
  }

  async getStatus(): Promise<Status> {
    const lines = await this.mpc(['status']);

    let state = null;
    let random = false;
    let repeat = false;

    lines.forEach(line => {
      if (line.startsWith('[')) {
        state = line.startsWith('[playing]') ? 'playing' : 'paused';
      } else if (line.startsWith('volume:')) {
        random = line.includes('random: on');
        repeat = line.includes('repeat: on');
      }
    });

    return {
      state,
      random,
      repeat,
    };
  }

  async toggleRandom() {
    const status = await this.getStatus();
    const newState = status.random ? 'off' : 'on';
    await this.mpc(['random', newState]);
  }

  async queuePlaylist(ids: string[]): Promise<void> {
    await this.mpc(['clear']);
    await Promise.all(ids.map(async id => {
      await this.mpc(['add', '--', this.resolve(id)]);
    }));
    await this.mpc(['repeat', 'on']); // currently don't have a repeat button
  }

  async getQueue() {
    const list = await this.mpc(['playlist', '-f', '%file%']); // Will not be correct for random queues
    return list.map(l => this.parseId(l));
  }

  private async mpc(args: string[]): Promise<string[]> {
    const cmd = spawn('mpc', [...args]);

    return new Promise((resolve, reject) => {
      const outputs: string[] = [];

      cmd.stdout.on('data', (data: Buffer) => {
        const output = data.toString('utf-8');
        outputs.push(output);
        console.log(output);
      });

      cmd.stderr.on('data', (err: Buffer) => {
        console.log('Error', err.toString('utf-8'));
      });

      cmd.on('exit', (code) => {
        if (code === 0) {
          let result = '';
          outputs.forEach(x => { result += x });
          resolve(result.split('\n'));
        } else {
          reject(new Error(`${code}`));
        }
        // this.cmd = null;
      });
    });
  }

}
