import React, { useContext, useEffect, useState } from 'react';
import { Add, Close } from '@material-ui/icons';
import { Snackbar, IconButton, Tooltip } from '@material-ui/core';
import { PlaylistInfo } from '../types';
import InputField from '../../components/InputField';
import { PlaylistSyncButtons } from './PlaylistSyncButtons';
import { PlaylistContext } from './PlaylistContext';
import { YoutubeContext } from '../youtube/YoutubeContext';

export interface PlaylistsProps {
  selectedPlaylist: PlaylistInfo | null;
  onPlaylistSelected: (i: PlaylistInfo | null) => void;
}

export interface PlaylistsState {
  playlists: PlaylistInfo[];
  showCreatePlaylist: boolean;
  createPlaylistId: string;
  createPlaylistError: string;
  creating: boolean;
}

export function Playlists({ selectedPlaylist, onPlaylistSelected }: PlaylistsProps) {
  const { service: ytService } = useContext(YoutubeContext);
  const { service } = useContext(PlaylistContext);
  const [playlists, setPlaylists] = useState([] as PlaylistInfo[]);
  const [createPlaylistError, setCreatePlaylistError] = useState('');
  const [createPlaylistId, setCreatePlaylistId] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    service.loadPlaylists();
    service.addListener('playlistUpdated', p => {
      setPlaylists(p);
      setCreatePlaylistError('');
      setCreatePlaylistId('');
      setShowCreatePlaylist(false);
      setCreating(false);
    });

    return () => {
      service.removeAllListeners();
    };
  }, []);


  const createPlaylist = async () => {
    if (
      playlists.find((p) => p.playlistId === createPlaylistId) != null
    ) {
      setCreatePlaylistError('Playlist Id is already added')
      return;
    }

    setCreating(true);
    const info = await ytService.getPlaylistVideoInfos(createPlaylistId);

    if (info != null) {
      info.entries.forEach((e) => {
        // Load thumbnail to cache earlier
        ytService.getThumbnail(e.id);
      });

      service.updatePlaylist({
        playlistId: createPlaylistId,
        title: info?.title,
        videos: info.entries.map(i => ({ id: i.id, title: i.title })) // Entries contain more information
      });
    } else {
      setCreating(false);
      setCreatePlaylistError('Failed to get playlist info')
    }
  }

  const playlistsList = playlists.map((p, i) => {
    return (
      <li key={i}>
        <button
          className="btn-2"
          type="button"
          onClick={() => onPlaylistSelected(p)}
          onKeyPress={() => onPlaylistSelected(p)}
          style={
            selectedPlaylist?.playlistId === p.playlistId
              ? { fontWeight: 'bold' }
              : {}
          }
        >
          {p.title || 'Not a playlist'}
        </button>
      </li>
    );
  });


  return (
    <div className="flex-vertical" style={{ gap: '1em' }}>
      <div className="flex-horizontal">
        <Tooltip title="Add youtube playlist">
          <IconButton size="small"
            aria-label="add"
            onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}>
            <Add />
          </IconButton>
        </Tooltip>
        <PlaylistSyncButtons />
      </div>

      <Snackbar
        open={!!createPlaylistError}
        autoHideDuration={3000}
        onClose={() => setCreatePlaylistError('')}
        message={createPlaylistError}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setCreatePlaylistError('')}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
      {showCreatePlaylist && (
        <div className="flex-horizontal" style={{ gap: '0.5em' }}>
          <InputField
            style={{ background: '#3f3f3f' }}
            value={createPlaylistId}
            onChange={(e) => setCreatePlaylistId(e.target.value)}
          />
          <button
            className="btn-2"
            style={{ flexShrink: 1, width: 'unset' }}
            type="button"
            disabled={creating}
            onClick={() => createPlaylist()}
          >
            Create
            </button>
        </div>
      )}
      <ul>{playlistsList}</ul>
    </div>
  );
}
