import * as bip39 from "https://cdn.skypack.dev/bip39";
import { ec as EC } from "https://cdn.skypack.dev/elliptic";
import SHA256 from "https://cdn.skypack.dev/crypto-js/sha256";

const ec = new EC("secp256k1");

export function createWallet() {
  return fromMnemonic(bip39.generateMnemonic(128));
}

export function fromMnemonic(m) {
  if (!bip39.validateMnemonic(m)) throw "Invalid seed";
  const seed = bip39.mnemonicToSeedSync(m).toString("hex");
  const priv = SHA256(seed).toString();
  const key = ec.keyFromPrivate(priv);
  return { mnemonic: m, privateKey: priv, address: key.getPublic("hex") };
}
