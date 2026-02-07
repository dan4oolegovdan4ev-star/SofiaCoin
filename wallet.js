let currentWallet = null;
const totalSupply = 100_000_000;
let minedSoFar = Number(localStorage.getItem("sofiaMinedSoFar")) || 0;
let mempool = [];
let blockchain = JSON.parse(localStorage.getItem("sofiaBlockchain") || "[]");

// ===== SEED =====
function generateSeed(){
  let words=[];
  for(let i=0;i<12;i++){
    words.push(WORDLIST[Math.floor(Math.random()*WORDLIST.length)]);
  }
  return words.join(" ");
}

async function seedToPrivateKey(seed){
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function privateKeyToAddress(pk){
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pk));
  return "SOF"+[...new Uint8Array(hash)].slice(0,20).map(b=>b.toString(16).padStart(2,"0")).join("");
}

// ===== WALLET =====
async function createWallet(){
  const seed = generateSeed();
  const pk = await seedToPrivateKey(seed);
  const address = await privateKeyToAddress(pk);
  currentWallet={seed,pk,address};
  localStorage.setItem("sofiaSeed",seed);
  alert("SAVE YOUR SEED PHRASE:\n\n"+seed);
  showWallet();
}

async function importWalletPrompt(){
  const seed = prompt("Enter seed phrase:");
  if(!seed) return;
  const pk = await seedToPrivateKey(seed);
  const address = await privateKeyToAddress(pk);
  currentWallet={seed,pk,address};
  localStorage.setItem("sofiaSeed",seed);
  showWallet();
}

function showWallet(){
  document.getElementById("seed").innerText="✅ Saved";
  document.getElementById("address").innerText=currentWallet.address;
  updateBalance();
}

// ===== BALANCE / LOCALSTORAGE =====
function updateBalance(){
  if(!currentWallet) return;
  const bal = calculateBalance(currentWallet.address);
  document.getElementById("balance").innerText = bal;
  document.getElementById("mined").innerText = minedSoFar;
  localStorage.setItem("sofiaMinedSoFar", minedSoFar);
  localStorage.setItem("sofiaBlockchain", JSON.stringify(blockchain));
}

// ===== SEND =====
function sendTransaction(){
  if(!currentWallet) return alert("Create wallet first");
  const to = document.getElementById("toAddress").value.trim();
  const amount = Number(document.getElementById("amount").value);
  if(!to || amount <= 0) return alert("Invalid address or amount");

  if(calculateBalance(currentWallet.address) < amount)
    return alert("Not enough balance");

  const tx = {from: currentWallet.address, to, amount};
  mempool.push(tx);

  if(wsBridge && bridgeConnected){
    wsBridge.send(JSON.stringify({type:"tx", tx}));
  }

  document.getElementById("toAddress").value = "";
  document.getElementById("amount").value = "";
  alert("✅ Transaction added to mempool");
}

// ===== LOAD WALLET =====
window.addEventListener("load", async ()=>{
  const seed = localStorage.getItem("sofiaSeed");
  if(seed){
    const pk = await seedToPrivateKey(seed);
    const address = await privateKeyToAddress(pk);
    currentWallet={seed,pk,address};
    showWallet();
  }

  minedSoFar = Number(localStorage.getItem("sofiaMinedSoFar")) || minedSoFar;
  blockchain = JSON.parse(localStorage.getItem("sofiaBlockchain") || "[]");

  updateBalance();
});
