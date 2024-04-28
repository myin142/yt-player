import { cloneDeep } from "lodash";
import { FaEdit, FaSync } from "react-icons/fa";
import React from "react";
import IconToggle from "../components/IconToggle";
import PlaylistVideos from "./playlists/PlaylistVideos";
import { PlaylistInfo, PlaylistVideo } from "./types";

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
    const { selectedPlaylist, onReload, onPlay } = this.props;
    const { editPlaylist } = this.state;
    const editMode = !!editPlaylist;

    return (
      <>
        <div className="flex px-4 justify-between">
          <div className="flex">
            {selectedPlaylist && (
              <>
                <IconToggle
                  title="Reload playlist videos"
                  onClick={() => onReload()}
                >
                  <FaSync />
                </IconToggle>
                <IconToggle
                  active={editMode}
                  onClick={() => this.toggleEdit()}
                  title="Edit playlist videos"
                >
                  <FaEdit />
                </IconToggle>
              </>
            )}
          </div>
        </div>

        <main className="scroll">
          <div className="px-4 flex flex-col">
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
