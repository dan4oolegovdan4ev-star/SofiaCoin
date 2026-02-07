let mining = false;
const difficulty = 2;

function logMining(msg) {
  console.log("⛏️ " + msg);
  const logDiv = document.getElementById("miningLog");
  if (logDiv) logDiv.innerText += msg + "\n";
}

function startMining() {
  if (!currentWallet) return alert("Create wallet first");
  if (!wsBridge || !bridgeConnected) {
    alert("Wait until bridge is connected...");
    return;
  }
  if (mining) return;
  mining = true;
  logMining("Mining started!");
  mineNext();
}

function stopMining() {
  mining = false;
  logMining("Mining stopped.");
}

function mineNext() {
  if (!mining) return;

  if (minedSoFar >= totalSupply) {
    alert("🎉 All coins mined!");
    mining = false;
    logMining("All coins mined!");
    return;
  }

  const reward = 1;
  const previousHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : "0";

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

  function step() {
    if (!mining) return;

    block.nonce++;
    block.hash = CryptoJS.SHA256(
      block.index + JSON.stringify(block.transactions) + block.previousHash + block.nonce
    ).toString();

    if (block.hash.substring(0, difficulty) === "0".repeat(difficulty)) {
      blockchain.push(block);
      minedSoFar += reward;
      mempool = [];
      updateBalance();

      logMining(`✅ Block #${block.index} mined (nonce=${block.nonce}, hash=${block.hash.substring(0,10)}...)`);

      localStorage.setItem("sofiaMinedSoFar", minedSoFar);
      localStorage.setItem("sofiaBlockchain", JSON.stringify(blockchain));

      if (wsBridge && bridgeConnected) {
        wsBridge.send(JSON.stringify({ type: "newBlock", block }));
        logMining("🔗 Block sent to bridge");
      }

      setTimeout(mineNext, 0);
    } else {
      if (block.nonce % 1000 === 0) logMining(`Mining... nonce=${block.nonce}`);
      setTimeout(step, 0);
    }
  }

  step();
}

// Авто-стартиране ако wallet и bridge са готови
window.addEventListener("load", () => {
  const startBtn = document.getElementById("startMiningBtn");
  if (startBtn) startBtn.onclick = startMining;
});
