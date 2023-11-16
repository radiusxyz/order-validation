import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
const app = express();
import {
  hashSHA256,
  signData,
  stringify,
  verifySignature,
} from '../commons/utils.js';
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

let encTxBlock = [];
const encTxHashes = [];

dotenv.config();

const [privateKey, _, l2PublicKey] = [
  process.env.PRIVATE_KEY,
  process.env.PUBLIC_KEY,
  process.env.L2_PUBLIC_KEY,
];

function consumeTx(req, res) {
  const encTx = stringify(req.body);
  console.log(
    '\x1b[36m',
    'SEQUENCER:',
    '\x1b[0m',
    ' received an encTx: ',
    encTx
  );
  encTxBlock.push(encTx);
  const encTxHash = hashSHA256(encTx);
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
  console.log('\x1b[36m', 'SEQUENCER:', '\x1b[0m', ' L2 is requesting block');
  try {
    const response = await axios.post(
      'http://localhost:4444/l2Signature',
      encTxHashes
    );
    const l2Signature = response.data.signature;
    const encTxHashesHash = hashSHA256(stringify(encTxHashes));
    console.log(typeof l2Signature);
    const isValid = verifySignature(encTxHashesHash, l2Signature, l2PublicKey);
    console.log(
      '\x1b[36m',
      'SEQUENCER:',
      '\x1b[0m',
      " is L2's signature valid?",
      isValid
    );
    if (isValid) {
      const encTxBlockHash = hashSHA256(stringify(encTxBlock));
      const signature = signData(encTxBlockHash, privateKey);
      const temp = [...encTxBlock];
      encTxBlock = [];
      responseData = {
        encTxBlock: temp,
        signature,
      };
    }
  } catch (error) {
    console.error(
      '\x1b[36m',
      'SEQUENCER:',
      '\x1b[0m',
      " error requesting L2's signature:",
      error
    );
  }
  res.status(200).json(responseData);
});

app.listen(PORT, () => {
  console.log(
    '\x1b[36m',
    'SEQUENCER:',
    '\x1b[0m',
    ' is running on port: ',
    PORT
  );
});
