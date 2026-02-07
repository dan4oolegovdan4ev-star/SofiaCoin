let blockchain=[];
let mempool=[];

function genesis(){
  return {index:0,transactions:[],previousHash:"0",nonce:0,hash:"0"};
}

blockchain.push(genesis());

function calculateBalance(addr){
  let bal=0;
  for(const b of blockchain){
    for(const tx of b.transactions){
      if(tx.to===addr) bal+=tx.amount;
      if(tx.from===addr) bal-=tx.amount;
    }
  }
  return bal;
}
