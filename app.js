import { createWallet, fromMnemonic } from "./wallet.js";
import { Blockchain } from "./blockchain.js";
import { startMining, stopMining } from "./miner.js";

window.chain = new Blockchain();
let wallet;
const out = document.getElementById("out");
const speed = document.getElementById("speed");

create.onclick = () => {
  wallet = createWallet();
  out.textContent = wallet.address + "\n\n" + wallet.mnemonic;
};

import.onclick = () => {
  wallet = fromMnemonic(prompt("Seed:"));
  out.textContent = wallet.address;
};

mine.onclick = () =>
  startMining(chain, wallet.address, h => speed.textContent = h);

stop.onclick = stopMining;
