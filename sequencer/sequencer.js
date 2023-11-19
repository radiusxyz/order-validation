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
let txBlock = [];

dotenv.config();

const [privateKey, _, l2PublicKey] = [
  process.env.PRIVATE_KEY,
  process.env.PUBLIC_KEY,
  process.env.L2_PUBLIC_KEY,
];

function hexToBuffer(hexString) {
  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return byteArray.buffer;
}

function solvePuzzle(seed, iters) {
  let key = seed;
  for (let i = 0; i < iters; i++) {
    key = crypto.createHash('sha256').update(key).digest('hex');
  }
  return key;
}

async function decryptText(encryptedWithTag, iv, keyBuffer) {
  if (encryptedWithTag instanceof ArrayBuffer) {
    encryptedWithTag = Buffer.from(encryptedWithTag);
  }
  // Assuming the tag is the last 16 bytes of the encrypted data
  const tagLength = 16;
  const encrypted = encryptedWithTag.slice(0, -tagLength);
  const tag = encryptedWithTag.slice(-tagLength);

  // Create a decipher instance
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
  decipher.setAuthTag(tag);

  // Decrypt the data
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf-8'); // Assuming UTF-8 encoded data
}

async function consumeTx(req, res) {
  // Destructure the request body
  const { encTxHexStr, iv, unsolved } = req.body;
  logSeq('the received encTxHexStr:', encTxHexStr);
  logSeq('the received puzzle:', unsolved);
  // Hash the encrypted transaction as hex string, since we are planning to store only encrypted txs in the L1
  const encTxHexStrHash = hashSHA256(encTxHexStr);
  // Push the hash of the encrypted transaction as hex string to block
  encTxHashes.push(encTxHexStrHash);
  // Since the method is FCFS, and we order starting from 0, the order is length of the block - 1
  const order = encTxHashes.length - 1;
  // Sign the hash of the encrypted transaction as hex string
  const signature = signData(encTxHexStrHash, privateKey);
  // Respond to the user
  res.status(200).json({
    encTxHexStrHash,
    order,
    signature,
  });
  // Solve the time-lock puzzle
  const decryptionKey = solvePuzzle(unsolved.seed, unsolved.iters);
  logSeq('the decryption key:', decryptionKey);
  // Stringify iv
  const ivStr = stringify(iv);
  console.log('the received iv (stringified):', ivStr);
  // Push the encrypted transaction as hex string, iv as string, and decryption key as hex string into the block of encrypted txs
  encTxBlock.push({ encTxHexStr, ivStr, decryptionKey });
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
