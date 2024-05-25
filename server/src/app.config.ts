import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import express from "express";
import { join } from "path";
import compression from "compression";
/**
 * Import your Room files
 */
import { VoxelRoom } from "./rooms/VoxelRoom";

export default config({
  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("voxelRoom", VoxelRoom);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get("/hello_world", (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    if (process.env.NODE_ENV !== "production") {
      app.use("/playground", playground);
    } else {
      const clientBuildPath = join(__dirname, "..", "client", "dist");
      console.log("clientBuildPath", clientBuildPath);
      app.use("/", compression(), express.static(clientBuildPath));
      app.get("/auth/callback", (req, res) => {
        res.sendFile(join(clientBuildPath, "index.html"));
      });
    }
    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/colyseus", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
