let mining = false;
const difficulty = 2;
let minedSoFar = Number(localStorage.getItem("sofiaMinedSoFar")) || 0;
let mempool = [];

// =========================
// Start / Stop Mining
// =========================
function startMining() {
  if (!currentWallet) return alert("Create wallet first");
  if (!wsBridge || !bridgeConnected) {
    alert("Wait until bridge is connected...");
    return;
  }
  if (mining) return;
  mining = true;
  mineNext();
}

function stopMining() {
  mining = false;
}

// =========================
// Main Mining Loop
// =========================
function mineNext() {
  if (!mining) return;

  if (minedSoFar >= totalSupply) {
    alert("🎉 All coins mined!");
    mining = false;
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

    if(block.hash.substring(0,difficulty) === "0".repeat(difficulty)){
      blockchain.push(block);
      minedSoFar += reward;
      mempool = [];
      updateBalance();

      // Запазваме minedSoFar и blockchain в localStorage
      localStorage.setItem("sofiaMinedSoFar", minedSoFar);
      localStorage.setItem("sofiaBlockchain", JSON.stringify(blockchain));

      // Изпращаме блока към другите през bridge
      if(wsBridge && bridgeConnected){
        wsBridge.send(JSON.stringify({type:"newBlock", block}));
      }

      setTimeout(mineNext,0);
    } else {
      setTimeout(step,0);
    }
  }

  step();
}

// Автоматично стартиране на mining ако wallet и bridge са готови
window.addEventListener("load", () => {
  if(currentWallet && wsBridge && bridgeConnected) startMining();
});
