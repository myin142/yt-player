import React, { useContext, useState } from "react";
import { PlaylistService } from "./PlaylistService";
import { PlaylistContext } from "./PlaylistContext";

export interface PlaylistSyncButtonsProps {
  playlistService: PlaylistService;
}

export interface CloudSyncBtnsState {
  enterCloudId: boolean;
  uploadAction: boolean;
  cloudId: string;
}

export function PlaylistSyncButtons() {
  const { service } = useContext(PlaylistContext);
  const [enterCloudId, setEnterCloudId] = useState(false);
  const [uploadAction, setUploadAction] = useState(false);
  const [cloudId, setCloudId] = useState('');

  const doCloudUpload = async () => {
    if (service.hasCloudSync()) {
      await service.uploadToCloud();
    } else {
      setEnterCloudId(true);
      setUploadAction(true);
    }
  };


  const doCloudDownload = async () => {
    if (service.hasCloudSync()) {
      await service.syncFromCloud();
    } else {
      setEnterCloudId(true);
      setUploadAction(false);
    }
  }

  const doCloudSync = async () => {
    if (uploadAction) {
      await service.uploadToCloud(cloudId);
    } else {
      await service.syncFromCloud(cloudId);
    }

    setEnterCloudId(false);
    setCloudId('');
  }

  return (
    <>
      {/* <Tooltip title="Download cloud playlists">
        <IconButton size="small"
          aria-label="download"
          onClick={() => doCloudDownload()}>
          <CloudDownload />
        </IconButton>
      </Tooltip>

      <Dialog open={enterCloudId} onClose={() => setEnterCloudId(false)}>
        <DialogTitle>Enter cloud id</DialogTitle>
        <DialogContent>
          <TextField autoFocus value={cloudId} onChange={e => setCloudId(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => doCloudSync()}>Sync</Button>
        </DialogActions>
      </Dialog>

      <Tooltip title="Upload cloud playlists">
        <IconButton size="small"
          aria-label="upload"
          onClick={() => doCloudUpload()}>
          <CloudUpload />
        </IconButton>
      </Tooltip> */}
    </>
  );
}
