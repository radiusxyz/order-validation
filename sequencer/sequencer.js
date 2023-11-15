import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const encTxBlock = [];
const encTxHashes = [];

dotenv.config();

const [privateKey, publicKey] = [
  process.env.PRIVATE_KEY,
  process.env.PUBLIC_KEY,
];

function signData(data, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'base64');
}

function hashSHA256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function consumeTx(req, res) {
  const encTx = JSON.stringify(req.body);
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
  console.log('L2 requesting block');
  try {
    await axios.post('http://localhost:4444/l2Signature', encTxHashes);
  } catch (error) {
    console.error('Error requesting signature from L2:', error);
  }

  res.status(200).json({ message: 'Hello', world: 'Bye' });
});

app.listen(PORT, () => {
  console.log('Sequencer is running on port: ', PORT);
});
