window.blockchain = JSON.parse(localStorage.getItem("sofiaBlockchain") || "[]");
window.mempool = [];
window.minedSoFar = Number(localStorage.getItem("sofiaMinedSoFar")) || 0;

function genesis() {
  return {
    index: 0,
    transactions: [],
    previousHash: "0",
    nonce: 0,
    hash: "GENESIS"
  };
}

if (blockchain.length === 0) {
  blockchain.push(genesis());
  localStorage.setItem("sofiaBlockchain", JSON.stringify(blockchain));
}

function calculateBalance(addr) {
  let bal = 0;
  for (const b of blockchain) {
    for (const tx of b.transactions) {
      if (tx.to === addr) bal += tx.amount;
      if (tx.from === addr) bal -= tx.amount;
    }
  }
  return bal;
}
