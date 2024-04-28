## Youtube Player

Desktop application that uses youtube-dl to download and play playlists/videos.

Note: code currently still contains old music player code that will be replaced to MPD controls in the future.
Some buttons might not work

Features:
  - [x] Download playlists from youtube
  - [ ] MPD Controls
    - [x] Play playlists to MPD server
    - [x] Toggle random
    - [x] Show active playing music
    - [ ] Toggle repeat
    - [ ] Create playlists
    - [ ] Display duration/location of music
    - [ ] Seek
    - [x] Play next queued music
    - [x] Queue / Play a selected music
    - [x] Play / Pause
    - [ ] Set volume


### Install

Youtube-dl is required for this application to work. (Might not work inside the EU, cookie required for consent?)

```sh
pip install youtube-dl
```

MPD server and MPC command is required to play the music.
- MPD needs to be started as user: `systemctl --user start mpd`
- Create a config in `~/.config/mpd/mpd.conf` with the following setting.

```sh
music_directory		"~/.config/yt-player-videos"
```

- Might have to add this to the config to make volume change work

```sh
audio_output {
    type        "pulse"
    name        "My Pulse Output"
#   server      "remote_server"     # optional
#   sink        "remote_server_sink"    # optional
}
```

Download latest [release](https://github.com/myin142/yt-player/releases)

![Preview](preview.png)
