import { Schema, Context, type, MapSchema } from "@colyseus/schema";

export class Transform extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;

  @type("number") yaw: number = 0;
  @type("number") pitch: number = 0;
}

const MAX_STACK_SIZE = 100;
export class Inventory extends Schema {
  @type("number") selectedSlot: number = 0;
  @type({
    array: "number",
  })
  slotIds: number[] = [];
  @type({
    array: "number",
  })
  slotCounts: number[] = [];
  maxSlots = 9;

  constructor() {
    super();
    for (let i = 0; i < this.maxSlots; i++) {
      this.slotIds.push(0);
      this.slotCounts.push(0);
    }
  }

  addItem(itemId: number, count: number) {
    // iterate over all slots
    for (let i = 0; i < this.maxSlots; i++) {
      // if the slot has the same item, add the count
      if (this.slotIds[i] === itemId) {
        // if the stack is full, continue to the next slot
        if (this.slotCounts[i] >= MAX_STACK_SIZE) {
          continue;
        }
        const remainingSpace = MAX_STACK_SIZE - this.slotCounts[i];
        if (count <= remainingSpace) {
          this.slotCounts[i] += count;
          return 0;
        } else {
          this.slotCounts[i] = MAX_STACK_SIZE;
          count -= remainingSpace;
        }
      }
    }
    // if we have any remaining items, add them to empty slots
    if (count > 0) {
      for (let i = 0; i < this.maxSlots; i++) {
        if (this.slotIds[i] === 0) {
          this.slotIds[i] = itemId;
          this.slotCounts[i] = count;
          return 0;
        }
      }
    }
  }
}

export class PlayerState extends Schema {
  @type("string") sessionId: string = "";
  @type(Transform) transform: Transform = new Transform();

  @type(Inventory) inventory = new Inventory();
}

export class VoxelRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}
