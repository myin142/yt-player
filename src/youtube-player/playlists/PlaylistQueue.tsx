import {
  createStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { VolumeUp } from '@material-ui/icons';
import React from 'react';
import { PlaylistVideo } from '../types';

interface PlaylistQueueProps {
  playingVideo: PlaylistVideo;
  videos: PlaylistVideo[];
  queue: number[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    iconItem: {
      minWidth: 0,
      position: 'relative',
      left: '-0.5em',
    },
    icon: {
      color: theme.palette.secondary.main,
    },
  })
);

export default function PlaylistQueue({
  playingVideo,
  queue,
  videos,
}: PlaylistQueueProps) {
  const styles = useStyles();
  const currentIndex = videos.findIndex((v) => v.id === playingVideo.id);

  const nextQueue = [...queue];
  if (currentIndex !== -1) {
    nextQueue.unshift(currentIndex);
  }

  const queueItems = nextQueue
    .filter((i) => i >= 0 && i < videos.length)
    .map((v, i) => {
      return (
        <>
          <ListItem key={i} style={{ borderBottom: '.2em solid #3f3f3f' }}>
            {i === 0 && (
              <ListItemIcon className={styles.iconItem}>
                <VolumeUp className={styles.icon} />
              </ListItemIcon>
            )}
            <ListItemText>{videos[v].title}</ListItemText>
          </ListItem>
        </>
      );
    });

  return (
    <>
      {queueItems.length > 0 && (
        <div>
          <Typography variant="h5" gutterBottom>
            Queue
          </Typography>
          <List dense>{queueItems}</List>
        </div>
      )}
    </>
  );
}
