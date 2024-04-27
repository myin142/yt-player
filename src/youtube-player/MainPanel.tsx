import { Tooltip, IconButton } from '@material-ui/core';
import { Sync, Edit } from '@material-ui/icons';
import { cloneDeep } from 'lodash';
import React from 'react';
import FlexBox from '../components/FlexBox';
import IconToggle from '../components/IconToggle';
import PlaylistVideos from './playlists/PlaylistVideos';
import { Searchbar } from './Searchbar';
import { PlaylistInfo, PlaylistVideo } from './types';

interface MainPanelProps {
  selectedPlaylist: PlaylistInfo;
  onReload: (p?: PlaylistInfo) => void;
  onPlay: (v: PlaylistVideo) => void;
  onUpdateFolder: (f: PlaylistInfo) => void;
}

interface MainPanelState {
  editPlaylist: PlaylistInfo | null;
}

export class MainPanel extends React.Component<MainPanelProps, MainPanelState> {
  constructor(props: MainPanelProps) {
    super(props);

    this.state = {
      editPlaylist: null,
    };
  }

  private onVideoChange(video: PlaylistVideo) {
    const { editPlaylist } = this.state;
    if (editPlaylist) {
      const videoIndex = editPlaylist.videos.findIndex(
        (v) => v.id === video.id
      );
      if (videoIndex !== -1) {
        editPlaylist.videos[videoIndex] = video;
      }
    }
    this.setState({
      editPlaylist,
    });
  }

  private toggleEdit() {
    if (this.state.editPlaylist) {
      this.stopEdit();
    } else {
      this.startEdit();
    }
  }

  private startEdit() {
    const currPlaylist = cloneDeep(this.props.selectedPlaylist);
    this.setState({
      editPlaylist: currPlaylist,
    });
  }

  private stopEdit() {
    if (this.state.editPlaylist) {
      this.props.onUpdateFolder(this.state.editPlaylist);
    }

    this.setState({
      editPlaylist: null,
    });
  }

  render() {
    const {
      selectedPlaylist,
      onReload,
      onPlay,
    } = this.props;
    const { editPlaylist } = this.state;
    const editMode = !!editPlaylist;

    return (
      <>
        <div
          className="flex-horizontal main-padding"
          style={{ justifyContent: 'space-between' }}
        >
          <Searchbar />

          <FlexBox flexShrink={1}>
            {selectedPlaylist && (
              <>
                <Tooltip title="Reload playlist videos">
                  <IconButton onClick={() => onReload()}>
                    <Sync />
                  </IconButton>
                </Tooltip>
                <IconToggle
                  active={editMode}
                  onClick={() => this.toggleEdit()}
                  title="Edit playlist videos"
                >
                  <Edit />
                </IconToggle>
              </>
            )}
          </FlexBox>
        </div>

        <main className="scroll">
          <div className="main-padding">
            <PlaylistVideos
              playlist={selectedPlaylist}
              onVideoClick={(v) => onPlay(v)}
              onVideoUpdate={(v) => this.onVideoChange(v)}
              editPlaylist={editPlaylist}
            />
          </div>
        </main>
      </>
    );
  }
}
