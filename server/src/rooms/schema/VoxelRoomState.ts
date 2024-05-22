import { Schema, Context, type, MapSchema } from "@colyseus/schema";

export class Transform extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;

  @type("number") yaw: number = 0;
  @type("number") pitch: number = 0;
}

export class PlayerState extends Schema {
  @type("string") sessionId: string = "";
  @type(Transform) transform: Transform = new Transform();
}

export class VoxelRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}
