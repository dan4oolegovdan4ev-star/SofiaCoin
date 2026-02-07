importScripts("https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js");

let hashes = 0, last = Date.now(), run = true;

onmessage = e => {
  const { block, diff } = e.data;
  while (run) {
    block.nonce++;
    block.hash = CryptoJS.SHA256(
      block.prev + block.ts + JSON.stringify(block.txs) + block.nonce
    ).toString();
    hashes++;
    if (block.hash.startsWith("0".repeat(diff))) {
      postMessage({ type: "FOUND", block });
      return;
    }
    if (Date.now() - last >= 1000) {
      postMessage({ type: "SPEED", hps: hashes });
      hashes = 0;
      last = Date.now();
    }
  }
};
