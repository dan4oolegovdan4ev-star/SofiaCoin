// miner.js
let mining = false;
const difficulty = 3;

// Зареждане от localStorage или празен масив
let minedSoFar = Number(localStorage.getItem("sofiaMinedSoFar")) || 0;
let blockchain = JSON.parse(localStorage.getItem("sofiaBlockchain") || "[]");
let mempool = [];

// =====================
// Genesis block
// =====================
if (!blockchain || blockchain.length === 0) {
    const genesis = {index:0, transactions:[], previousHash:"0", nonce:0, hash:"0"};
    blockchain.push(genesis);
    localStorage.setItem("sofiaBlockchain", JSON.stringify(blockchain));
}

// =====================
// Mining log helper
// =====================
function logMining(msg) {
    console.log("⛏", msg);
    const el = document.getElementById("miningLog");
    if (el) el.innerText += msg + "\n";
}

// =====================
// Start / Stop Mining
// =====================
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

// =====================
// Main mining loop
// =====================
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

        // Лог за nonce на всеки 500 опита
        if (block.nonce % 500 === 0) logMining("Nonce: " + block.nonce);

        // Проверка дали е намерен блок
        if (block.hash.startsWith("0".repeat(difficulty))) {
            blockchain.push(block);
            minedSoFar += reward;
            mempool = [];

            // Запазваме
            localStorage.setItem("sofiaBlockchain", JSON.stringify(blockchain));
            localStorage.setItem("sofiaMinedSoFar", minedSoFar);
            updateBalance();

            logMining("✅ Block mined: " + block.hash.slice(0, 12));

            // Изпращаме към bridge
            if (window.wsBridge && window.bridgeConnected) {
                wsBridge.send(JSON.stringify({type:"newBlock", block}));
            }

            setTimeout(mineNext, 100);
        } else {
            setTimeout(step, 0);
        }
    }

    step();
}

// =====================
// Свързване към бутона Start/Stop
// =====================
window.addEventListener("load", () => {
    const startBtn = document.getElementById("startMiningBtn");
    if (startBtn) startBtn.onclick = startMining;

    const stopBtn = document.getElementById("stopMiningBtn");
    if (stopBtn) stopBtn.onclick = stopMining;
});
