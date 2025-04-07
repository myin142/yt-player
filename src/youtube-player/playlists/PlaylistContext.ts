import React from "react";
import { PlaylistService } from "./PlaylistService";
import { EventService } from "../../services/event.service";

export const PlaylistContext = React.createContext({
  service: new PlaylistService(),
  events: new EventService(),
});
