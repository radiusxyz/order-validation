import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  hashSHA256,
  signData,
  stringify,
  verifySignature,
} from '../commons/utils.js';
const app = express();
const PORT = process.env.PORT || 4444;
app.use(cors());
app.use(express.json());
dotenv.config();

dotenv.config();

const [privateKey, sequencerPublicKey] = [
  process.env.PRIVATE_KEY,
  process.env.SEQUENCER_PUBLIC_KEY,
];

setInterval(async () => {
  try {
    console.log(
      '\x1b[31m',
      'L2:',
      '\x1b[0m',
      ' requesting block from the sequencer '
    );
    const response = await axios.get('http://localhost:3333/block');
    const sequencerSignature = response.data.signature;
    const encTxBlock = response.data.encTxBlock;
    console.log(
      '\x1b[31m',
      'L2:',
      '\x1b[0m',
      ' encTxBlock built by the sequencer: ',
      encTxBlock
    );
    const encTxBlockHash = hashSHA256(stringify(encTxBlock));
    const isValid = verifySignature(
      encTxBlockHash,
      sequencerSignature,
      sequencerPublicKey
    );
    console.log(
      '\x1b[31m',
      'L2:',
      '\x1b[0m',
      " is sequencer's signature valid?",
      isValid
    );
  } catch (error) {
    console.log(
      '\x1b[31m',
      'L2:',
      '\x1b[0m',
      " error requesting sequencer's signature:",
      error
    );
  }
}, 5000);

app.post('/l2Signature', (req, res) => {
  const encTxHashes = stringify(req.body);
  console.log(
    '\x1b[31m',
    'L2:',
    '\x1b[0m',
    ' received encTxHashes to be signed: ',
    encTxHashes
  );
  const encTxHashesHash = hashSHA256(encTxHashes);
  const signature = signData(encTxHashesHash, privateKey);

  res.status(200).json({
    signature: signature,
  });
});

app.listen(PORT, () => {
  console.log('\x1b[31m', 'L2:', '\x1b[0m', ' is running on port: ', PORT);
});
