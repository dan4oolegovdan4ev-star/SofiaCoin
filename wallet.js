let currentWallet = null;
let minedSoFar = 0;
const totalSupply = 100000000;

function generateSeed() {
  return Array.from({length:12},()=>WORDLIST[Math.random()*WORDLIST.length|0]).join(" ");
}

async function sha256(txt) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
  return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function createWallet() {
  const seed = generateSeed();
  const pk = await sha256(seed);
  const addr = "SOF" + (await sha256(pk)).slice(0,30);
  currentWallet = {seed,pk,address:addr};
  localStorage.setItem("sofiaSeed", seed);
  document.getElementById("address").innerText = addr;
}

async function importWalletPrompt() {
  const seed = prompt("Seed:");
  if (!seed) return;
  const pk = await sha256(seed);
  const addr = "SOF" + (await sha256(pk)).slice(0,30);
  currentWallet = {seed,pk,address:addr};
  document.getElementById("address").innerText = addr;
}
