import React from "react";
import { PlaylistService } from "./PlaylistService";

export const PlaylistContext = React.createContext({
  service: new PlaylistService()
});
