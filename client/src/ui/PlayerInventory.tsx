import { BlockItemRenderer } from "./BlockRenderer";
import { useColyseusRoom, useColyseusState } from "../networking/colyseus";

export function PlayerInventory() {
  const room = useColyseusRoom();
  const inventory = useColyseusState()?.players.get(
    room?.sessionId ?? ""
  )?.inventory;

  if (!inventory) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {new Array(9).fill(null).map((_, i) => (
          <div
            key={i}
            style={{
              width: 50,
              height: 50,
              border: "4px solid black",
              position: "relative",
              backgroundColor:
                inventory.selectedSlot === i
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(0, 0, 0, 0.2)",
            }}
          >
            {inventory.slotIds[i] > 0 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "black",
                    color: "white",
                    padding: 2,
                    zIndex: 1,
                    fontFamily: "monospace",
                  }}
                >
                  {inventory.slotCounts[i]}
                </div>
                <BlockItemRenderer itemId={inventory.slotIds[i]} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
