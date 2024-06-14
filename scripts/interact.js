const hre = require("hardhat");
const ethers = require("ethers");
// Generate 100 Keccak256 transactions
function generateTransactions() {
  const transactions = [];
  for (let i = 0; i < 100; i++) {
    const tx = `tx${i}`;
    transactions.push(ethers.keccak256(ethers.toUtf8Bytes(tx)));
  }
  return transactions;
}

// Convert hex string to Buffer
function bufferize(hash) {
  return Buffer.from(hash.slice(2), "hex");
}

// Calculate Merkle root
function calculateMerkleRoot(hashes) {
  if (hashes.length === 1) {
    return hashes[0];
  }
  const newLevel = [];
  for (let i = 0; i < hashes.length; i += 2) {
    const left = bufferize(hashes[i]);
    const right = i + 1 < hashes.length ? bufferize(hashes[i + 1]) : left;
    newLevel.push(ethers.keccak256(Buffer.concat([left, right])));
  }
  return calculateMerkleRoot(newLevel);
}

// Get Merkle proof
function getMerkleProof(hashes, index) {
  let proof = [];
  while (hashes.length > 1) {
    const newLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = bufferize(hashes[i]);
      const right = i + 1 < hashes.length ? bufferize(hashes[i + 1]) : left;
      if (i === index || i + 1 === index) {
        proof.push(i === index ? hashes[i + 1] : hashes[i]);
      }
      newLevel.push(ethers.keccak256(Buffer.concat([left, right])));
    }
    index = Math.floor(index / 2);
    hashes = newLevel;
  }
  return proof;
}

// Convert hash string to bytes32 format
function toBytes32(hash) {
  return ethers.hexlify(hash);
}

async function main() {
  // Contract related
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const Contract = await hre.ethers.getContractFactory("MerkleProofVerifier");
  const contract = Contract.attach(contractAddress);

  // Generate 100 Keccak256 transactions
  const transactions = generateTransactions();
  console.log("Transactions:", transactions);

  // Calculate Merkle root
  const merkleRoot = calculateMerkleRoot(transactions);
  console.log("Merkle Root:", merkleRoot);

  // Pick any member of that list
  const index = 50; // Pick any transaction index
  const proof = getMerkleProof(transactions, index);
  console.log(`Proof for transaction ${transactions[50]} at index 50:`, proof);

  // Prepare the data for the verification call
  const leaf = toBytes32(transactions[index]);
  const root = toBytes32(merkleRoot);
  const proofElements = proof.map(toBytes32);

  // Verify the proof
  const isValid = await contract.verify(proofElements, root, leaf, index);
  console.log("Is the transaction order valid?", isValid);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
