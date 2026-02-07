// =========================
// SofiaCoin Miner (DEBUG)
// =========================

let mining = false;
const difficulty = 2;

// shared state (идват от wallet / bridge)
let minedSoFar = Number(localStorage.getItem("sofiaMinedSoFar")) || 0;

// =========================
// UI LOG
// =========================
function logMining(msg) {
  console.log("[MINER]", msg);
  const el = document.getElementById("miningLog");
  if (el) {
    el.textContent += msg + "\n";
    el.scrollTop = el.scrollHeight;
  }
}

// =========================
// START / STOP
// =========================
function startMining() {
  logMining("▶ Start Mining clicked");

  if (!currentWallet) {
    logMining("❌ No wallet loaded");
    alert("Create or import wallet first");
    return;
  }

  if (!wsBridge || !bridgeConnected) {
    logMining("❌ Bridge NOT connected");
    alert("Bridge not connected yet");
    return;
  }

  if (mining) {
    logMining("⚠ Already mining");
    return;
  }

  mining = true;
  logMining("✅ Mining started");
  mineNext();
}

function stopMining() {
  mining = false;
  logMining("🛑 Mining stopped");
}

// =========================
// MAIN MINING LOOP
// =========================
function mineNext() {
  if (!mining) {
    logMining("⏸ Mining paused");
    return;
  }

  if (minedSoFar >= totalSupply) {
    logMining("🎉 Total supply mined");
    mining = false;
    return;
  }

  const reward = 1;
  const previousHash =
    blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : "0";

  const block = {
    index: blockchain.length,
    transactions: [
      { from: "COINBASE", to: currentWallet.address, amount: reward },
      ...mempool
    ],
    previousHash,
    nonce: 0,
    hash: ""
  };

  logMining(`⛏ Mining block #${block.index}`);

  function step() {
    if (!mining) return;

    block.nonce++;
    block.hash = CryptoJS.SHA256(
      block.index +
      JSON.stringify(block.transactions) +
      block.previousHash +
      block.nonce
    ).toString();

    // показваме прогрес от време на време
    if (block.nonce % 500 === 0) {
      logMining(`… nonce ${block.nonce}`);
    }

    if (block.hash.startsWith("0".repeat(difficulty))) {
      blockchain.push(block);
      minedSoFar += reward;
      mempool = [];

      localStorage.setItem("sofiaMinedSoFar", minedSoFar);
      localStorage.setItem("sofiaBlockchain", JSON.stringify(blockchain));

      updateBalance();

      logMining(`✅ BLOCK FOUND!`);
      logMining(`hash: ${block.hash}`);
      logMining(`reward: +${reward} SFC`);

      // изпращаме към bridge
      if (wsBridge && bridgeConnected) {
        wsBridge.send(JSON.stringify({ type: "newBlock", block }));
        logMining("🌐 Block sent to bridge");
      }

      setTimeout(mineNext, 50);
    } else {
      setTimeout(step, 0);
    }
  }

  step();
}

// =========================
// AUTO INIT
// =========================
window.addEventListener("load", () => {
  logMining("🧠 Miner loaded");

  if (bridgeConnected) {
    logMining("🌉 Bridge already connected");
  } else {
    logMining("⏳ Waiting for bridge...");
  }
});
