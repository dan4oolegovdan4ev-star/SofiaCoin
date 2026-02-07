let mining = false;
const difficulty = 2;

// Зареждане на minedSoFar и blockchain от localStorage
let minedSoFar = Number(localStorage.getItem("sofiaMinedSoFar")) || 0;
let blockchain = JSON.parse(localStorage.getItem("sofiaBlockchain") || "[]");
let mempool = [];

// =========================
// Start / Stop Mining
// =========================
function startMining() {
  if (!currentWallet) return alert("Create wallet first");

  if (!wsBridge || !bridgeConnected) {
    console.log("⏳ Waiting for bridge to connect...");
    alert("Wait until the bridge is connected...");
    return;
  }

  if (mining) return;

  mining = true;
  console.log("🚀 Mining started");
  mineNext();
}

function stopMining() {
  mining = false;
  console.log("🛑 Mining stopped");
}

// =========================
// Main Mining Loop
// =========================
function mineNext() {
  if (!mining) return;

  console.log("⛏ Attempting next block...");

  if (minedSoFar >= totalSupply) {
    alert("🎉 All coins mined!");
    mining = false;
    console.log("🏁 Mining finished, total mined:", minedSoFar);
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

    // Показваме прогрес на всеки 1000 опита
    if (block.nonce % 1000 === 0) console.log("🔹 Nonce:", block.nonce);

    // Проверка дали hash отговаря на трудността
    if (block.hash.substring(0, difficulty) === "0".repeat(difficulty)) {
      console.log("✅ Block mined!", block.hash);
      blockchain.push(block);
      minedSoFar += reward;
      mempool = [];
      updateBalance();

      // Запазване в localStorage
      localStorage.setItem("sofiaMinedSoFar", minedSoFar);
      localStorage.setItem("sofiaBlockchain", JSON.stringify(blockchain));

      // Изпращане на блока към bridge
      if (wsBridge && bridgeConnected) {
        wsBridge.send(JSON.stringify({ type: "newBlock", block }));
      }

      // Следващ блок
      setTimeout(mineNext, 0);
    } else {
      setTimeout(step, 0);
    }
  }

  step();
}

// =========================
// Автоматично стартиране на mining, когато bridge е готов
// =========================
window.addEventListener("load", () => {
  const startBtn = document.getElementById("startMiningBtn");
  if (startBtn) startBtn.onclick = startMining;

  const checkBridge = setInterval(() => {
    if (currentWallet && wsBridge && bridgeConnected) {
      console.log("🌉 Bridge готов, стартирам mining автоматично");
      startMining();
      clearInterval(checkBridge);
    }
  }, 1000);
});
