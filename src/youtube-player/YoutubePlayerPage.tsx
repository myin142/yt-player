import React from "react";
import PlaylistQueue from "./playlists/PlaylistQueue";
import { Playlists } from "./playlists/Playlists";
import { PlaylistInfo, PlaylistVideo } from "./types";
import LocalYoutubeDlService from "./youtube/LocalYoutubeDlService";
import { MainPanel } from "./MainPanel";
import { QueueItem, Status } from "../services/mpd.service";
import { PlaylistContext } from "./playlists/PlaylistContext";
import { mpdService, videoService } from "./youtube/YoutubeContext";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface YoutubePlayerPageProps {}

export interface YoutubePlayerPageState {
  selectedPlaylist: PlaylistInfo | null;
  playingPlaylist: PlaylistInfo | null;
  playingVideo: PlaylistVideo | null;
  loading: boolean;
  videoChanged: boolean;
  queue: QueueItem[];
  dirtyQueue: boolean;
  status: Status | null;
}

class YoutubePlayerPage extends React.Component<
  YoutubePlayerPageProps,
  YoutubePlayerPageState
> {
  static contextType = PlaylistContext;

  private readonly youtubeService = new LocalYoutubeDlService();

  private readonly videoService = videoService;

  private readonly mpd = mpdService;

  constructor(props: YoutubePlayerPageProps) {
    super(props);
    this.state = {
      selectedPlaylist: null,
      playingPlaylist: null,
      playingVideo: null,
      loading: false,
      videoChanged: false,
      queue: [],
      dirtyQueue: false,
      status: null,
    };
  }

  async componentDidMount() {
    await this.mpd.update();
    await this.updateStatus();
    await this.updateQueue();
    setInterval(() => this.updateStatus(), 5000);
  }

  private async playSelectedPlaylist(video: PlaylistVideo) {
    const { selectedPlaylist } = this.state;

    if (!this.videoService.isVideoDownloaded(video.id)) {
      console.log("Video is not downloaded", video);
      return;
    }

    const videoIds = selectedPlaylist?.videos
      .filter((v) => !v.disabled && this.videoService.isVideoDownloaded(v.id))
      .map((v) => v.id);

    if (videoIds) {
      try {
        await this.mpd.queuePlaylist(videoIds);
        await this.mpd.play(video.id);
        await this.updateStatus();
        await this.updateQueue();
      } catch (e) {
        console.log(e);
      }
    }
  }

  private async setShuffle(shuffle: boolean) {
    await this.mpd.setShuffle(shuffle);
    await this.updateStatus();
  }

  private async playFromQueue(idx: number) {
    await this.mpd.playFromQueue(idx);
    await this.updateStatus();
  }

  private async updateStatus() {
    const status = await this.mpd.getStatus();
    console.log("Updating status", status);
    if (status.state != null) {
      this.setState({ status });
    } else {
      this.setState({ status: null });
    }
  }

  private async updateQueue() {
    const queue = await this.mpd.getQueue();
    this.setState({ queue });
  }

  updatePlaylistVideo(video: PlaylistVideo) {
    const { selectedPlaylist } = this.state;
    const playlist = selectedPlaylist;

    if (playlist == null) return;

    const currentVideos = playlist?.videos || [];
    const index = currentVideos.findIndex((v) => v.id === video.id);

    if (index !== -1) {
      playlist.videos[index] = video;
      this.updatePlaylist(playlist);
    }
  }

  updatePlaylist(playlist: Partial<PlaylistInfo>) {
    const { selectedPlaylist } = this.state;

    if (selectedPlaylist != null) {
      const updated = {
        ...selectedPlaylist,
        ...playlist,
      };

      this.context.service.updatePlaylist(updated);
      this.setState({
        selectedPlaylist: updated,
      });
    }
  }

  private async loadPlaylistVideos(playlist = this.state.selectedPlaylist) {
    const playlistId = playlist?.playlistId;
    const selectedPlaylist = playlist || this.state.selectedPlaylist;
    if (!playlistId) {
      console.log("Cannot load playlist videos without id");
      return;
    }

    const { loading } = this.state;
    if (loading) {
      console.log("Already loading something");
      return;
    }

    this.setState({ loading: true });

    const info = await this.youtubeService.getPlaylistVideoInfos(playlistId);

    // TODO: share with Playlists code
    if (info != null) {
      const existingVideos = selectedPlaylist?.videos || [];
      const mergedVideos: PlaylistVideo[] = [];

      info.entries.forEach((e) => {
        // Load thumbnail to cache earlier
        this.youtubeService.getThumbnail(e.id);

        const entry: PlaylistVideo = {
          id: e.id,
          title: e.title,
        };

        const existing = existingVideos.find((v) => v.id === e.id);
        if (!existing) {
          mergedVideos.push(entry);
        } else {
          mergedVideos.push({
            ...existing,
            ...entry,
          });
        }
      });

      this.updatePlaylist({
        ...selectedPlaylist,
        playlistId,
        videos: mergedVideos,
        title: info.title,
      });
    }

    this.setState({ loading: false });
  }

  render() {
    const { selectedPlaylist, queue, status } = this.state;

    return (
      <>
        <div className="flex grow p-4 gap-2">
          <nav className="flex flex-col justify-between basis-80 gap">
            <div className="panel scroll">
              <Playlists
                selectedPlaylist={selectedPlaylist}
                onPlaylistSelected={(p) =>
                  this.setState({ selectedPlaylist: p })
                }
              />
            </div>
          </nav>
          <div className="main-container">
            {selectedPlaylist && (
              <MainPanel
                selectedPlaylist={selectedPlaylist}
                onPlay={(v) => this.playSelectedPlaylist(v)}
                onReload={(p) => this.loadPlaylistVideos(p)}
                onUpdateFolder={(p) => this.updatePlaylist(p)}
              />
            )}
          </div>
          {status && queue.length > 0 && (
            <aside className="side-panel basis-80">
              <div className="panel flex grow">
                <PlaylistQueue
                  queue={queue}
                  status={status}
                  onShuffle={(x) => this.setShuffle(x)}
                  onPlayQueue={(i) => this.playFromQueue(i)}
                />
              </div>
              <img
                src={this.youtubeService.getThumbnail(status.playing)}
                alt="Playing Video Thumbnail"
                className="thumbnail"
              />
            </aside>
          )}
        </div>
      </>
    );
  }
}

export default YoutubePlayerPage;
