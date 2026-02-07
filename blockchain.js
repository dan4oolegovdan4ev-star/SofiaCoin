let blockchain = [];
let mempool = [];

function genesisBlock() {
  return {
    index: 0,
    previousHash: "0",
    nonce: 0,
    transactions: [],
    hash: "GENESIS"
  };
}

if (blockchain.length === 0) {
  blockchain.push(genesisBlock());
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
