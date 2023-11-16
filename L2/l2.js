import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { hashSHA256, signData, stringify } from '../commons/utils.js';
const app = express();
const PORT = process.env.PORT || 4444;
app.use(cors());
app.use(express.json());
dotenv.config();

dotenv.config();

const [privateKey, publicKey] = [
  process.env.PRIVATE_KEY,
  process.env.PUBLIC_KEY,
];

setTimeout(async () => {
  try {
    console.log(' Requesting block from the qequencer ');
    const encTxBlock = await axios.get('http://localhost:3333/block');
    console.log(
      'This is the tx block built by the sequencer: ',
      encTxBlock.data.data
    );
  } catch (error) {
    console.log(error);
  }
}, 5000);

app.post('/l2Signature', (req, res) => {
  const encTxHashes = stringify(req.body);
  console.log('L2 received encTxHashes to be signed: ', encTxHashes);
  const encTxHashesHash = hashSHA256(encTxHashes);
  const signature = signData(encTxHashesHash, privateKey);

  res.status(200).json({
    status: 'success',
    data: { l2Signature: signature },
  });
});

app.listen(PORT, () => {
  console.log('L2 is running on port: ', PORT);
});
