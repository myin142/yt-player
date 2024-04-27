import React from 'react';
import { RouteProps } from 'react-router-dom';
import { MusicPlayer } from './music-player/MusicPlayer';
import PlaylistQueue from './playlists/PlaylistQueue';
import { Playlists } from './playlists/Playlists';
import { PlaylistInfo, PlaylistVideo } from './types';
import LocalYoutubeDlService from './youtube/LocalYoutubeDlService';
import { MainPanel } from './MainPanel';
import { Status } from '../services/mpd.service';
import { PlaylistContext } from './playlists/PlaylistContext';
import {mpdService, videoService} from './youtube/YoutubeContext';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface YoutubePlayerPageProps { }

export interface YoutubePlayerPageState {
  selectedPlaylist: PlaylistInfo | null;
  playingPlaylist: PlaylistInfo | null;
  playingVideo: PlaylistVideo | null;
  loading: boolean;
  videoChanged: boolean;
  queue: number[];
  dirtyQueue: boolean;
  status: Status | null;
}

class YoutubePlayerPage extends React.Component<
  YoutubePlayerPageProps,
  YoutubePlayerPageState
  > {

  // eslint-disable-next-line react/static-property-placement
  static contextType = PlaylistContext;

  private readonly youtubeService = new LocalYoutubeDlService();

  private readonly videoService = videoService;

  private readonly mpd = mpdService

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
    await this.updateStatus();
  }

  private async playSelectedPlaylist(video: PlaylistVideo) {
    const { selectedPlaylist } = this.state;

    if (!this.videoService.isVideoDownloaded(video.id)) {
      console.log('Video is not downloaded', video);
      return;
    }

    const videoIds = selectedPlaylist?.videos
      .filter(v => !v.disabled && this.videoService.isVideoDownloaded(v.id))
      .map(v => v.id);

    if (videoIds) {
      try {
        await this.mpd.queuePlaylist(videoIds);
        await this.mpd.play(video.id);
        await this.updateStatus();
      } catch (e) {
        console.log(e);
      }
    }
  }

  private async toggleRandom() {
    await this.mpd.toggleRandom();
    await this.updateStatus();
  }

  private async updateStatus() {
    const status = await this.mpd.getStatus();
    if (status.state != null) {
      this.setState({ status });
    } else {
      this.setState({ status: null });
    }
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

      // this.context.service.updatePlaylist(updated)
      this.setState({
        selectedPlaylist: updated,
      });
    }
  }

  private async loadPlaylistVideos(playlist = this.state.selectedPlaylist) {
    const playlistId = playlist?.playlistId;
    const selectedPlaylist = playlist || this.state.selectedPlaylist;
    if (!playlistId) {
      console.log('Cannot load playlist videos without id');
      return;
    }

    const { loading } = this.state;
    if (loading) {
      console.log('Already loading something');
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

  private playableVideos(): PlaylistVideo[] {
    return (
      this.state.playingPlaylist?.videos.filter((v) => !v.disabled) ||
      []
    );
  }

  render() {
    const {
      selectedPlaylist,
      playingVideo,
      videoChanged,
      queue,
      dirtyQueue,
      status,
    } = this.state;

    return (
      <>
        {/* <div className="container">
          <nav className="side-panel">
            <div className="panel scroll">
              <Playlists
                selectedPlaylist={selectedPlaylist}
                onPlaylistSelected={(p) => this.setState({selectedPlaylist: p})}
              />
            </div>
            {playingVideo && (
              <img
                src={this.youtubeService.getThumbnail(playingVideo.id)}
                alt="Playing Video Thumbnail"
                className="thumbnail"
              />
            )}
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
          {playingVideo && (
            <aside className="side-panel">
              <div className="panel scroll">
                <PlaylistQueue
                  playingVideo={playingVideo}
                  queue={queue}
                  videos={this.playableVideos()}
                />
              </div>
            </aside>
          )}
        </div> */}
        {/* {status && (
          <footer className="panel">
            <MusicPlayer
              status={status}
              toggleRandom={() => this.toggleRandom()}

              videoService={this.videoService}
              videoChanged={videoChanged}
              dirtyQueue={dirtyQueue}
              playingVideos={this.playableVideos()}
              playingVideo={playingVideo}
              queue={queue}
              onVideoPlay={(v) =>
                this.setState({ playingVideo: v, videoChanged: !videoChanged })
              }
              onQueueChanged={(q) => this.setState({ queue: q })}
            />
          </footer>
        )} */}
      </>
    );
  }
}

export default YoutubePlayerPage;
