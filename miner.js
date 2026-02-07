let mining = false;
const difficulty = 3;

function logMining(msg) {
  console.log("⛏", msg);
  const el = document.getElementById("miningLog");
  if (el) el.innerText += msg + "\n";
}

function startMining() {
  if (!currentWallet) return alert("Create wallet first");
  if (!window.bridgeConnected) {
    alert("Bridge not connected yet");
    return;
  }
  if (mining) return;

  mining = true;
  logMining("Mining started");
  mineNext();
}

function stopMining() {
  mining = false;
  logMining("Mining stopped");
}

function mineNext() {
  if (!mining) return;

  const reward = 1;
  const lastBlock = blockchain[blockchain.length - 1];

  const block = {
    index: blockchain.length,
    transactions: [
      { from: "COINBASE", to: currentWallet.address, amount: reward },
      ...mempool
    ],
    previousHash: lastBlock.hash,
    nonce: 0,
    hash: ""
  };

  function step() {
    if (!mining) return;

    block.nonce++;
    block.hash = CryptoJS.SHA256(
      block.index +
      JSON.stringify(block.transactions) +
      block.previousHash +
      block.nonce
    ).toString();

    if (block.hash.startsWith("0".repeat(difficulty))) {
      blockchain.push(block);
      minedSoFar += reward;
      mempool = [];

      localStorage.setItem("sofiaBlockchain", JSON.stringify(blockchain));
      localStorage.setItem("sofiaMinedSoFar", minedSoFar);

      updateBalance();
      logMining("✅ Block mined: " + block.hash.slice(0, 12));

      if (window.wsBridge && bridgeConnected) {
        wsBridge.send(JSON.stringify({ type: "newBlock", block }));
      }

      setTimeout(mineNext, 100);
    } else {
      if (block.nonce % 500 === 0) {
        logMining("nonce " + block.nonce);
      }
      setTimeout(step, 0);
    }
  }

  step();
}
