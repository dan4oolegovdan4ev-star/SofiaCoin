import SHA256 from "https://cdn.skypack.dev/crypto-js/sha256";
import { ec as EC } from "https://cdn.skypack.dev/elliptic";
const ec = new EC("secp256k1");

export class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.time = Date.now();
  }
  hash() {
    return SHA256(this.from + this.to + this.amount + this.time).toString();
  }
  sign(priv) {
    this.signature = ec.keyFromPrivate(priv).sign(this.hash()).toDER("hex");
  }
  isValid() {
    if (this.from === null) return true;
    return ec.keyFromPublic(this.from, "hex")
      .verify(this.hash(), this.signature);
  }
}
