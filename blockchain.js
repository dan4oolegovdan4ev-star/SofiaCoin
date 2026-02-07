import { Block } from "./block.js";
import { Transaction } from "./tx.js";

export class Blockchain {
  constructor() {
    this.chain = [new Block(Date.now(), [], "0")];
    this.pending = [];
    this.diff = 4;
    this.reward = 25;
    this.maxSupply = 100_000_000;
    this.totalSupply = 0;
    this.halvingInterval = 5000;
    this.targetTime = 20_000;
  }

  latest() { return this.chain.at(-1); }

  getBalance(addr) {
    let bal = 0;
    for (const b of this.chain)
      for (const tx of b.txs) {
        if (tx.from === addr) bal -= tx.amount;
        if (tx.to === addr) bal += tx.amount;
      }
    return bal;
  }

  currentReward() {
    return this.reward / (2 ** Math.floor(this.chain.length / this.halvingInterval));
  }

  adjustDifficulty() {
    if (this.chain.length < 2) return;
    const dt = this.latest().ts - this.chain.at(-2).ts;
    if (dt < this.targetTime) this.diff++;
    else if (dt > this.targetTime * 2 && this.diff > 1) this.diff--;
  }

  mineBlock(block) {
    while (!block.hash.startsWith("0".repeat(this.diff))) {
      block.nonce++;
      block.hash = block.calc();
    }
    this.chain.push(block);
    this.adjustDifficulty();
  }

  mine(miner) {
    if (this.totalSupply < this.maxSupply) {
      const r = Math.min(this.currentReward(), this.maxSupply - this.totalSupply);
      this.pending.push(new Transaction(null, miner, r));
      this.totalSupply += r;
    }
    const b = new Block(Date.now(), this.pending, this.latest().hash);
    this.mineBlock(b);
    this.pending = [];
  }
}
