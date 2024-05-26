import { cli } from "@colyseus/loadtest";
import { Room, Client } from "@colyseus/core";
import { PlayerState, VoxelRoomState } from "./schema/VoxelRoomState";
import { ClientPackageType, ServerPackageType } from "../common/packets";
import { WorldManager } from "../game/WorldManager";
import { compressChunk } from "../common/compression";

export class VoxelRoom extends Room<VoxelRoomState> {
  maxClients = 4;

  worldManager = new WorldManager(this);

  onCreate(options: any) {
    this.autoDispose = false;
    this.setState(new VoxelRoomState());

    this.onMessage(ClientPackageType.PlayerMoves, (client, message) => {
      const player = this.state.players.get(client.sessionId);
      player.transform.x = message.x;
      player.transform.y = message.y;
      player.transform.z = message.z;
    });

    this.onMessage(ClientPackageType.RequestLoadChunk, (client, message) => {
      const { x, y, z } = message;
      const chunk = this.worldManager.getChunk(x, y, z);
      client.send(ServerPackageType.ChunkData, {
        x,
        y,
        z,
        chunk: compressChunk(chunk.voxels),
      });
    });

    this.onMessage(ClientPackageType.BreakBlock, (client, message) => {
      const { x, y, z } = message;
      const current = this.worldManager.getBlock(x, y, z);
      if (current === 0) {
        return;
      }
      const player = this.state.players.get(client.sessionId);
      player.inventory.addItem(current, 1);
      this.worldManager.setBlock(x, y, z, 0);
    });

    this.onMessage(ClientPackageType.PlaceBlock, (client, message) => {
      const { x, y, z } = message;
      const player = this.state.players.get(client.sessionId);
      const blockType = player.inventory.getSlot(player.inventory.selectedSlot);
      if (blockType === null) return;
      player.inventory.removeFromSlot(player.inventory.selectedSlot, 1);
      this.worldManager.setBlock(x, y, z, blockType.id);
    });

    this.onMessage(ClientPackageType.RequestSpawn, (client, message) => {
      const spawnPoint = this.worldManager.findSpawnableBlock(0, 0);
      client.send(ServerPackageType.TeleportPlayer, {
        playerId: client.sessionId,
        x: spawnPoint[0] + 0.5,
        y: spawnPoint[1] + 3.5,
        z: spawnPoint[2] + 0.5,
      });
    });

    this.onMessage(ClientPackageType.SelectSlot, (client, message) => {
      const player = this.state.players.get(client.sessionId);
      player.inventory.selectedSlot = message.slot;
    });
  }

  onJoin(client: Client, options: any) {
    const player = new PlayerState();
    player.sessionId = client.sessionId;
    this.state.players.set(client.sessionId, player);
    console.log("client joined", client.sessionId);
  }

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
