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

const encTxBlock = [];
const encTxHashes = [];

dotenv.config();

const [privateKey, _, l2PublicKey] = [
  process.env.PRIVATE_KEY,
  process.env.PUBLIC_KEY,
  process.env.L2_PUBLIC_KEY,
];

function consumeTx(req, res) {
  const encTx = stringify(req.body);
  console.log('Sequencer received a transaction: ', encTx);
  encTxBlock.push(encTx);
  const encTxHash = hashSHA256(encTx);
  encTxHashes.push(encTxHash);
  const order = encTxHashes.length - 1;
  const signature = signData(encTxHash, privateKey);
  res.status(200).json({
    status: 'success',
    data: { encTxHash, order, signature },
  });
}

app.post('/order', consumeTx);

app.get('/block', async (req, res) => {
  let responseData = { status: 'error', data: 'Invalid signature' }; // Default response
  console.log('L2 requesting block from me');
  try {
    const response = await axios.post(
      'http://localhost:4444/l2Signature',
      encTxHashes
    );
    const l2Signature = response.data.data.l2Signature;
    const encTxHashesHash = hashSHA256(stringify(encTxHashes));
    console.log(typeof l2Signature);
    const isValid = verifySignature(encTxHashesHash, l2Signature, l2PublicKey);
    console.log('Is L2 signature valid?', isValid);
    if (isValid) {
      const encTxBlockHash = hashSHA256(encTxBlock);
      const signature = signData(encTxBlockHash, privateKey);
      responseData = {
        status: 'success',
        data: { encTxBlock, encTxBlockHash, signature },
      };
    }
  } catch (error) {
    console.error('Error requesting signature from L2:', error);
  }
  res.status(200).json(responseData);
});

app.listen(PORT, () => {
  console.log('Sequencer is running on port: ', PORT);
});
