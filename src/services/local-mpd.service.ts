import { spawn } from "child_process";
import { VideoService } from "../youtube-player/youtube/VideoService";
import { MpdService, Status } from "./mpd.service";

export class LocalMpdService implements MpdService {
  constructor(private readonly videoService: VideoService) {}

  async update() {
    await this.mpc(["update"]);
  }

  private resolve(id: string): string {
    return this.videoService.videoPath(id, true);
  }

  private parseId(file: string): string {
    return file.split(".")[0];
  }

  async next() {
    this.mpc(["next"]);
  }

  async play(id: string) {
    const queue = await this.getQueue();
    const idx = queue.findIndex((q) => q.id === id);
    if (idx !== -1) {
      await this.mpc([`del`, `${idx + 1}`]);
    }

    await this.mpc(["insert", "--", this.resolve(id)]);

    const status = await this.getStatus();
    if (status.state === "playing") {
      await this.next();
    } else {
      await this.mpc(["play"]);
    }
  }

  async getStatus(): Promise<Status> {
    const lines = await this.mpc(["status", "-f", "%file%"]);
    const queued = await this.mpc(["queued", "-f", "%file%"]);

    let state = null;
    let random = false;
    let repeat = false;
    let playing = "";
    const nextPlaying = queued.length > 0 ? this.parseId(queued[0]) : '';

    lines.forEach((line, i) => {
      if (i === 0 && line.includes(".")) {
        playing = this.parseId(line);
      } else if (line.startsWith("[")) {
        state = line.startsWith("[playing]") ? "playing" : "paused";
      } else if (line.startsWith("volume:")) {
        random = line.includes("random: on");
        repeat = line.includes("repeat: on");
      }
    });

    return {
      state,
      random,
      repeat,
      playing,
      nextPlaying,
    };
  }

  async toggleRandom() {
    const status = await this.getStatus();
    const newState = status.random ? "off" : "on";
    await this.mpc(["random", newState]);
  }

  async queuePlaylist(ids: string[]): Promise<void> {
    await this.mpc(["clear"]);
    await Promise.all(
      ids.map(async (id) => {
        await this.mpc(["add", "--", this.resolve(id)]);
      })
    );
    await this.mpc(["repeat", "on"]); // currently don't have a repeat button
  }

  async getQueue() {
    const list = await this.mpc(["playlist", "-f", "%title%;;;%file%"]);
    return list
      .filter((l) => l != "")
      .map((l) => {
        const parts = l.split(";;;");
        const id = this.parseId(parts[1]);
        const title = parts[0].trim();

        return { id, title };
      });
  }

  private async mpc(args: string[]): Promise<string[]> {
    const cmd = spawn("mpc", [...args]);

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
          let result = "";
          outputs.forEach((x) => {
            result += x;
          });
          resolve(result.split("\n"));
        } else {
          reject(new Error(`${code}`));
        }
        // this.cmd = null;
      });
    });
  }
}
