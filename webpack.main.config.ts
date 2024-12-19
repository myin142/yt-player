import type { Configuration } from "webpack";
import CopyPlugin from "copy-webpack-plugin";
import path from 'path';

import { rules } from "./webpack.rules";

const assets = ["assets"];
export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/index.ts",
  // Put your normal webpack config below here
  module: {
    rules,
  },
  target: "electron-main",
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  plugins: [
    ...assets.map((asset) => {
      return new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "src", asset),
            to: path.resolve(__dirname, ".webpack/renderer", asset),
          },
        ],
      });
    }),
  ],
};
