import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
const app = express();
import {
  hashSHA256,
  logSeq,
  signData,
  stringify,
  verifySignature,
} from '../commons/utils.js';
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

let encTxBlock = [];
let encTxHashes = [];

dotenv.config();

const [privateKey, _, l2PublicKey] = [
  process.env.PRIVATE_KEY,
  process.env.PUBLIC_KEY,
  process.env.L2_PUBLIC_KEY,
];

function solvePuzzle(seed, iters) {
  let key = seed;
  for (let i = 0; i < iters; i++) {
    key = crypto.createHash('sha256').update(key).digest('hex');
  }
  return key;
}

function consumeTx(req, res) {
  const { encTx, puzzle } = req.body;
  logSeq('this is the puzzle received', puzzle);
  const decryptionKey = solvePuzzle(puzzle.seed, puzzle.iters);
  logSeq('this is the decryption key', decryptionKey);
  const encTxStr = stringify(encTx);
  logSeq('received an encTx: ', encTxStr);
  encTxBlock.push(encTxStr);
  const encTxHash = hashSHA256(encTxStr);
  encTxHashes.push(encTxHash);
  const order = encTxHashes.length - 1;
  const signature = signData(encTxHash, privateKey);
  res.status(200).json({
    encTxHash,
    order,
    signature,
  });
}

app.post('/order', consumeTx);

app.get('/block', async (req, res) => {
  let responseData = {
    encTxBlock: undefined,
    encTxBlockHash: undefined,
    signature: undefined,
  }; // Default response
  logSeq('L2 is requesting block');
  try {
    const response = await axios.post(
      'http://localhost:4444/l2Signature',
      encTxHashes
    );
    const l2Signature = response.data.signature;
    const encTxHashesHash = hashSHA256(stringify(encTxHashes));
    const isValid = verifySignature(encTxHashesHash, l2Signature, l2PublicKey);
    logSeq("is L2's signature valid?", isValid);
    if (isValid) {
      const encTxBlockHash = hashSHA256(stringify(encTxBlock));
      const signature = signData(encTxBlockHash, privateKey);
      responseData = {
        encTxBlock: [...encTxBlock],
        signature,
      };
      encTxBlock = [];
      encTxHashes = [];
    }
  } catch (error) {
    console.error("error requesting L2's signature:", error);
  }
  res.status(200).json(responseData);
});

app.listen(PORT, () => {
  logSeq('is running on port: ', PORT);
});
