import { useEffect, useRef } from "react";
import { PlayerState } from "../../../server/src/rooms/schema/VoxelRoomState";
import { useColyseusRoom, useColyseusState } from "./colyseus";

const roomMessageHandlers = new Map<
  string | number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Set<(message: any) => void>
>();

/**
 * This hook should only be mounted once.
 */
let currentListenerId = 0;
export function useBroadcastRoomMessages() {
  const room = useColyseusRoom();

  useEffect(() => {
    const listenerId = ++currentListenerId;
    room?.onMessage("*", (type, message) => {
      if (listenerId !== currentListenerId) {
        return;
      }
      const handlers = roomMessageHandlers.get(type as string) ?? new Set();
      handlers.forEach((handler) => handler(message));
    });
  }, [room]);
}

export function useRoomMessageHandler(
  type: string | number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (message: any) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const existingHandlers = roomMessageHandlers.get(type) ?? new Set();
    const callback = (message: unknown) => {
      callbackRef.current(message);
    };
    existingHandlers.add(callback);
    roomMessageHandlers.set(type, existingHandlers);

    return () => {
      const existingHandlers = roomMessageHandlers.get(type) ?? new Set();
      existingHandlers.delete(callback);
      roomMessageHandlers.set(type, existingHandlers);
    };
  }, [type]);
}

export function useSelf(): PlayerState | null {
  const sessionId = useColyseusRoom()?.sessionId;
  const players = useColyseusState((s) => s.players);
  if (!sessionId) {
    return null;
  }
  return players?.get(sessionId) ?? null;
}
