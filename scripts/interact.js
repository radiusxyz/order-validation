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
  const transactions = [
    "0x2ebbeb5ba2fb0742366d00121750a978d3b72fbec340750fee872a5763ff46f7",
    "0x5194ead3df889a15f3d33e47bcc128114dbb9dcd1147f2de8a8ffba6a815f248",
    "0x183a7d361ca1625fa85289cbdf578effaa4376f038587b9ab574e3fe80e5edc5",
    "0x97a85b9f687bba82d44975f5f92f40894dc150ae53b4683e2e1509313bac6f73",
    "0x4a65af02a6b35dc2aa600611e5e7edc5e1b6bdb8c79a250434ca9b84e30b1c70",
    "0x4e1d7b2e7ffd8c92d050963a5d75aa049066cd4f5c0ea6c875c9a0b04c3a3e2d",
    "0xb53c3bd9fba7150c47404c3c9e72656aefebe4b56b55edab7f062e9c33e63d12",
    "0xcdc2b9e9463597ae45b3eb38c90e3083e50fc3fe3a7e819f0ac265091bc124ea",
    "0xee9a533548db30ea3db6d167f130e4f0aba4fda505a20845065f5335d7f081c7",
    "0x897bb1dca19ed70695775811b4e59f0c171dfa044760ee10500a9d3650a93011",
    "0x938e39b44e4738912b679e5cdacbfc53944dac8eefc981deffdef50cf8601544",
    "0xbf437186520fbc5eedae5f0d1a4f24145b5696323c04b3163b0715bda9e90011",
    "0xed9d50a9de3881a9f9d1a7abd272b35f789d91192d37f8e353bc2b14fc3b0911",
    "0xdeb5879543ef2e03f379dc93d293039c0b32561b33ecab2c01c9bb24b5af2329",
    "0x3ae1aaecb68e8fea836bd8c04693c26d963733763d2dca0cd4060bb4ea104a2c",
    "0x25b80a8eb47aea0d8216d25336d53c9808080ab522698a761bc6013491c76041",
    "0x94b4371e184535fd86c6d7344752622a5f0e72ae2c784a56093da7b9d8d7b4be",
    "0xb345dbea13671713509b69dd5756f2c9fc788cb972eb22f6d75c55a0f806e6c3",
    "0xf75e774189fbd061dfdb23ffe2712fe598b3676d52b5f3aa41f832edde34f968",
    "0x74d1e98d75894567a8e01afcb563a0bda15f9c6c78176c183e3c98f7b7330666",
    "0x081db1952da49d08e7bec04a1d490ba442ebefc7c1399cc888ca6347b6488cbd",
    "0x4b8213ee0c8fb8125e68c90797dcb82e66b009c53c01b4f75736243b02b88bd2",
    "0x9ee02ffdcbed4cccb144b73f5f001fa65bf2a31cd94519fa171844e2a996e044",
    "0xb2719881577dd929c8cea278b40f14f344c044c0679eb2d80a5d6d1e1f9025e4",
    "0x544a264e1dfaac9165aa1f7d5101e18ec5acf14d292a79595c9bf5ecc2cf2b78",
    "0xb2387631d8b25874b44e3768ab3992ac7f9e4100415c3b28a4e03a8242150083",
    "0x10ba824135ef9cc91bacdc57815be5048e4ad63927e9b09600b598da170f5bc6",
    "0x66106f1d7f95c702b9f8e2dc0d6be112857ed9a107993f2df9dab1ea26fb1580",
    "0xf4e8649f8c433dd2f2af6a0ac401974163b94a6e2443ebb9fc77cf6b35c2e394",
    "0x2518e3702e1175ea303eeaf6a0f76906def787b233bc627e00b084b2e848d55f",
    "0xbd9a750629563320cfc05bbd64c16b4cb3d3cec71b9fd1e9778a53436787a221",
    "0x7db497eb46da4bc07a8aecf06c696025daf35e6dd154f812694b181ee21cb5af",
    "0x5b7f953ffb214c662c40a738ab8a895cc9c066ddb06616c680d644a32b3f5b5b",
    "0x431dc41e40adb7eed9e6d363842fcf34d4402463e8d15742e84046590b55341a",
    "0x8288a3f95e3f18b4335c5078912be11f3addee1cc0793d4f86207d0769bbfcfd",
    "0x4e1e901c8cea07e728c87eb632dd785c53ffc414673d7e311a51214c22602a74",
    "0x8232aa7f8ce7eacbc94b0a773ef7c4fa0e6841b658c54f080d8aec9a22157ec3",
    "0x037c8dc87ef45887eee5f137586289b04518dee2dc8eb8401d9ac5e0a0ad8e35",
    "0x2cfd65f494dbd63ebc076a9a63f327381e5feecf665ed3c3cc3dfac96a0a12eb",
    "0xcd89d42702442ab735ce19ed86cd7153b424e65ab6500b070eaa2facddd28203",
    "0xe7f72ff0dbe0562f4b12970bc996194dcb4bfc9c05e521faf6094ada7141aca5",
    "0x30198bf96c1435f4a1df85b13a810b10c99f78fc264cc71d7293a8e25d7d3cb6",
    "0x0ba92840994d58bdd23ee0ca15755b063f1a009e0d5b3194e9ec89f297ff0e2b",
    "0xa739789337c90db24375ff11d3158426b1e78c4033f7ea66f66349c919a7b47a",
    "0x7a44e728af8c9f2061e7fb716bc3a7d9b51c3f2f67ed81c3f3b91d8f9df69140",
    "0xc7e655feeda6e7dfcd5f7965a1f47754840c85dcb47bb36b4d0b968752c2d223",
    "0x403b8ae70b1bd807b70e8d7502c3f9e07f8dc3a68a5c7ebe9013b0d5561f1b85",
    "0xf5264965c542f0f876152f343b5e69d7142194324940b76a7b0e5caf1e2e68d9",
    "0xcf929acf7d7c2eb15c92bec1ac5dd5f16bc3782fc09d9951f645c236c0697fde",
    "0x9d384962e2030de69feb97ae215568530974cdce0ff4a22b38f613e9fe08e6e9",
    "0x384ea10bbbdad028f0c820820a179511609a3bfe48cd5bddd11f9a3a19e13aa5",
    "0x6b90f6d59fb5cc6950407d5343d8dcbfe80c684450a47cf9526aeb0b33f8f0ce",
    "0x98e946e7fa092c2f4bc204e56c0d39874a70b0411f51ab312221572e68b3b902",
    "0x772d34493ef0c366475fc9b8446ee76baa0ace8824255ca96526a5bfd3804aa2",
    "0x0093e65497d710499737dea256fa9ea73e7580b7971d1775c0d7f5117e4d450e",
    "0xf72a8df897edd106a7bfa04c73529a9b4e948d6c586f3a860ff0f6c6e146b1d4",
    "0x4d89a3df02c9621dcb0a98a0f05dfb0cd46b643d4e05da29b22ed69ca20b6998",
    "0x4e38345acaa94cf3a3af0a12df2c40a8eaf835c6c33f7f00d5e6cc0f90f6de96",
    "0x85f50286fd5c2a3f792bb71ef7f9a5d3937e5b633839e486e94f250dc314c3fc",
    "0x81f243f1cc322db1fd09d37742de03e8338e05bae0f621e5c31f092980e98f87",
    "0xae104bb6125a9ea48928dfc9478f0ed5e7f213a7088a2fc48a3f9872a6b3523e",
    "0xdd72e2e0304c78a7bc982032c50aec1b177776885de979faba32cce87076ad2b",
    "0x18683b1c45eff8638ebc4024b201f3e4d4828073e0b5a595c9c5a54fa2142251",
    "0xb145d9e0b0ed9d9e81b95b1640f8476dc8189918dc722a14895f17021dc6d406",
    "0x845faf9f8ba9571a3be217ca35098a486708f77c334f511df85f38f7cc4aa451",
    "0xd1ef47c387df1cef4ccf981e3c1d0d13e46cb6334f1281863a00ce938cb6ad18",
    "0xeb3f224b1496cb1b407ff1241e691d400744859b307a68e87ec62641d61c9132",
    "0xf8ed68e87c56d0e674febb122c35a686dcdb03245cef0b289202fa69bbe54445",
    "0x2e1456af270e79c607feb51dc558bdd4e37e0d2a772bb546a1a80ba0c0fe5beb",
    "0xe7bcad95d08172257621fc9eaba659d64604f532a3c532fafc62ebb170236068",
    "0xe2eeab0c50bdc2456038813148d20d3de43fe48d15f29502ef0425b7e4bf804b",
    "0x78779498ad1f04ed4b95289c99b357b852f69bd6ae2493d144320cb61656c1bc",
    "0xcbbb0a10ff504037e3b8e9f9a464fc0c672294f4485dfec88a2941a504d6da60",
    "0xd2d788ce5b3eb60906903b18cbf34ea0d70e9429b38d32e1b41cf3859893a28a",
    "0xa299d0f50b05389978af994d57ebdabda45f3fd65e5ddeac9d98a30c14adbcb3",
    "0xc967b96e472df5a2dd4cce90a69c3742072f181f3fdaeb514cc573a25904504a",
    "0x6b1c9fe3e5f49220e0ddc50ec335d7c99835335b4fdfdc2d0124e9e10ab7a17c",
    "0xbd6923ef14940ebb6f4c318fda70ef66f8a3d9a12aee171a768be538cb1b812a",
    "0x3ef6f6176cd329db99db3c74d7d644444091d97e9182629f47fae11141344ee1",
    "0xdb617a52cf77d11c458079e072618ce7378a5998df821e202830ef8184b81e54",
    "0x5aba86eef5c7342c143db21e1a158c4f9ebeb502edaab82fd028b48f3f8f0f3d",
    "0x6286b2500c70074ff89f557beaf019240ae83f2452b8728ee69d51d6ad6be12b",
    "0x932cd3e013066e33e432ef20bf9d0d8a3e059cd3a038e659af23e6067520e2c9",
    "0xa34dc954aeb406d06d804c8ffd18f40d84906533bd0aaf23950e67bc6b97f9a7",
    "0xa31b2e99d2bb7819c7e49431afbc1dc6b009c771caa6f30a4448904d7c2861fc",
    "0x6150e8ed77afa41b7955a16437bf68fd7af668b2afa7ee0cf2c7391fa618dac7",
    "0xd9198b7bf4ceeae78b20861965ee50c176b098fd4c504dcbb15a17c74762eafe",
    "0x7686b31637d05ea7e2c80c6caf9e3c0e659b07d012d06660a2c84ef25b27e47c",
    "0x7cf1165df725e4dd4d88d54d963d24d38f9a7e19520b4fccebc1984dc39c7529",
    "0xa1924194479061d08e2af5b5d28f0e826e1ff46c04fc0c8cba226baa99aee709",
    "0xb7a7d89dcd5fcf6a3c8a487629d6d31db3106f5de4cc0aaecc3e0d46b5633386",
    "0xb21b2a8cfee4475f475f8f1c6d7e4cffe909e1928219ace9cb43e3d39060033d",
    "0x725ff33656db76cbbfa21fa1e9f3a39702217d61f7e02515479aae8ace76c947",
    "0x7dda39dac9f26851a6861005e418b94b332d3a547c71bd9ba5b15cb10e6bd552",
    "0x017074ec7ba9ddd05f2cd1bd74c41a8139805e859fabda7a1e7d9e93e9d97e1f",
    "0xb17e472870123342c1d73960cb729d7e8abf8b64fc90df56779b75734ffef16b",
    "0xd70b89380ad7973507728832787fff4e0d8eaf9d3333c3654efdc5a241fb2fd5",
    "0x970e4cb4f846199a1e710b88a8e165a1c3d7c144e115fd1ab77b051e5688f936",
    "0xf467fcff768020ddc8fc04b52bf600b30724389ce44fa6a3193064827492662f",
    "0x295841acb5d43fdd1e51ad6e0566365421b0c70835188e90cee069712a65c1cd",
  ];

  // Calculate Merkle root
  const merkleRoot = "0x5d68e1af5c97e158bf9eb63489d05ae7da229e264607323c5ec51a927fb90fe1";

  // Pick any member of that list
  const index = 50; // Pick any transaction index
  const proof = [
    "0x6b90f6d59fb5cc6950407d5343d8dcbfe80c684450a47cf9526aeb0b33f8f0ce",
    "0x99d0f006bd028d783996d3d879b88b5f51a071850dbf3cc243e93d87f210e243",
    "0xadeaf35def94369d783e2fa4f3d9405c5d08dea633e57788a564ee49f1bea535",
    "0x2316092faac7a4a4fdcdd2622979445bcfed67b11de3580fc24ec358a6b13a04",
    "0x61a0d847fba065cd22623432957ab689e1023a4b70fb6a8b712cb97f20489fb9",
    "0x5bb2f2f02d6031177af431d19f95064c4c16799b9558c7bd10465fc9b90cf1e7",
    "0x52c9ce858c66102049e3aaca2f55e7fce7e1dcb0e77555637aa1917b37f5d159",
  ];
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
