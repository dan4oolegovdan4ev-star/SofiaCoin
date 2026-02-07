import SHA256 from "https://cdn.skypack.dev/crypto-js/sha256";

export class Block {
  constructor(ts, txs, prev) {
    this.ts = ts;
    this.txs = txs;
    this.prev = prev;
    this.nonce = 0;
    this.hash = this.calc();
  }
  calc() {
    return SHA256(this.prev + this.ts + JSON.stringify(this.txs) + this.nonce).toString();
  }
}
