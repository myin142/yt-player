## Youtube Player

Desktop application that uses youtube-dl to download and play playlists/videos.

Using MPD you can also play the music with some basic control. It directly shows your MPD queue inside the application, so it can also be controlled outside of the application using the normal cli commands with `mpc`.

Features:
  - [x] Download playlists from youtube
  - [ ] MPD Controls
    - [x] Play playlists to MPD server
    - [x] Toggle random
    - [x] Show active playing music
    - [ ] Set volume
    - [x] Play next queued music
    - [x] Queue / Play a selected music
    - [x] Play / Pause
    - [ ] Display duration/location of music
    - [ ] Toggle repeat
    - [ ] Seek
    - [ ] Create playlists


### Install

Youtube-dl (now yt-dlp) is required for this application to work. (Might not work inside the EU, cookie required for consent?)


```sh
pip install yt-dlp

or

pacman -S yt-dlp
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

- For the linux users with i3 desktop, you can use this script to display the music in i3blocks
  - https://github.com/myin142/dotfiles/blob/master/i3wm/i3/scripts/mediaplayer

### Preview

![Preview](preview.png)
