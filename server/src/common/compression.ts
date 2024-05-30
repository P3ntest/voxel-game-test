import { CELL_SIZE } from "./world";
import { generateChunkData } from "./worldGenerator";

export function compressChunk(chunk: Uint8Array) {
  // strategy: first is always two control bites. the first bit is 0 if the following is a run of the same block, 1 if it's a list of different blocks
  // the other 7 + 8 bits are the length of the run or the number of blocks in the list
  // if it's a run, the next byte is the block id to run
  // if it's a list, the next n bytes are the block ids

  const compressed: number[] = [];
  let pos = 0;
  while (pos < chunk.length) {
    const currentBlock = chunk[pos];
    let runLength = 1;
    let listLength = 1;
    let isRun = true;
    while (
      pos + runLength < chunk.length &&
      chunk[pos + runLength] === currentBlock &&
      runLength < 0b01111111 // so we can use the 8th bit as a flag
    ) {
      runLength++;
    }
    while (
      pos + listLength < chunk.length &&
      chunk[pos + listLength] !== chunk[pos] &&
      listLength < 0b01111111 // so we can use the 8th bit as a flag
    ) {
      listLength++;
    }
    if (listLength > runLength) {
      isRun = false;
    }
    if (isRun) {
      const control = 0b10000000 | runLength;
      compressed.push(control);
      compressed.push(currentBlock);
      pos += runLength;
    } else {
      const control = listLength;
      compressed.push(control);
      for (let i = 0; i < listLength; i++) {
        compressed.push(chunk[pos + i]);
      }
      pos += listLength;
    }
  }

  return new Uint8Array(compressed);
}

export function decompressChunk(chunk: Uint8Array) {
  const decompressed = new Uint8Array(CELL_SIZE * CELL_SIZE * CELL_SIZE);
  let pos = 0;
  let decompressedPos = 0;
  while (pos < chunk.length) {
    const control = chunk[pos] & 0b10000000 ? 1 : 0;
    const length = chunk[pos] & 0b01111111;
    pos++;

    if (control === 1) {
      const block = chunk[pos];
      pos++;
      for (let i = 0; i < length; i++) {
        decompressed[decompressedPos] = block;
        decompressedPos++;
      }
    } else {
      for (let i = 0; i < length; i++) {
        decompressed[decompressedPos] = chunk[pos];
        pos++;
        decompressedPos++;
      }
    }
  }

  return decompressed;
}

// console.log("compression.ts loaded");
// // testing
// const testInput = generateChunkData(0, 0, 0).chunk;
// const compressed = compressChunk(testInput);
// const decompressed = decompressChunk(compressed);
// for (let i = 0; i < testInput.length; i++) {
//   if (testInput[i] !== decompressed[i]) {
//     console.count("decompression failed");
//   } else {
//     console.count("decompression successful");
//   }
// }

// console.log("compression.ts test done");
