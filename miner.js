let mining = false;
const difficulty = 3;

function log(msg){
  document.getElementById("miningLog").innerText += msg + "\n";
}

function startMining(){
  if (!currentWallet) return alert("Create wallet");
  if (!bridgeConnected) return alert("Bridge not connected");

  if (mining) return;
  mining = true;
  log("⛏ Mining started");
  mine();
}

function stopMining(){
  mining = false;
  log("🛑 Mining stopped");
}

function mine(){
  if (!mining) return;

  const last = blockchain[blockchain.length-1];
  const block = {
    index: blockchain.length,
    previousHash: last.hash,
    nonce: 0,
    transactions: [
      {from:"COINBASE", to:currentWallet.address, amount:1},
      ...mempool
    ],
    hash: ""
  };

  while(true){
    block.nonce++;
    block.hash = CryptoJS.SHA256(
      block.index + block.previousHash + block.nonce + JSON.stringify(block.transactions)
    ).toString();

    if (block.hash.startsWith("0".repeat(difficulty))) break;
  }

  blockchain.push(block);
  minedSoFar++;
  mempool = [];

  document.getElementById("balance").innerText =
    calculateBalance(currentWallet.address);
  document.getElementById("mined").innerText = minedSoFar;

  wsBridge.send(JSON.stringify({type:"newBlock", block}));

  log("✅ Block mined " + block.hash.slice(0,10));

  setTimeout(mine,10);
}
