import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';
const app = express();
const PORT = process.env.PORT || 4444;
app.use(cors());
app.use(express.json());
dotenv.config();

const [privateKey, publicKey] = [
  process.env.PRIVATE_KEY,
  process.env.PUBLIC_KEY,
];

dotenv.config();

// const [privateKey, publicKey] = [
//   process.env.PRIVATE_KEY,
//   process.env.PUBLIC_KEY,
// ];

function signData(data, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'base64');
}

function hashSHA256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

setTimeout(async () => {
  try {
    console.log('L2 will request block ');
    const encTxBlock = await axios.get('http://localhost:3333/block');
    console.log(
      'This is the tx_block built by the sequencer: ',
      encTxBlock.data.data
    );
  } catch (error) {
    console.log(error);
  }
}, 5000);

app.post('/l2Signature', (req, res) => {
  const encTxHashes = JSON.stringify(req.body);
  console.log('encTxHashes received by L2: ', encTxHashes);
  res.status(200).json({
    status: 'success',
    data: { l2Signature: 'This is the signature from L2' },
  });
});

app.listen(PORT, () => {
  console.log('L2 is running on port: ', PORT);
});
