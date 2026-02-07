import { broadcast } from "./network.js";

let w = null;

export function startMining(chain, addr, cb) {
  const block = {
    ts: Date.now(),
    txs: chain.pending,
    prev: chain.latest().hash,
    nonce: 0,
    hash: ""
  };
  w = new Worker("js/miner-worker.js");
  w.onmessage = e => {
    if (e.data.type === "SPEED") cb(e.data.hps);
    if (e.data.type === "FOUND") {
      chain.chain.push(e.data.block);
      broadcast("CHAIN", chain.chain);
      w.terminate();
    }
  };
  w.postMessage({ block, diff: chain.diff });
}

export function stopMining() {
  if (w) w.terminate();
}
