import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  hashSHA256,
  logL2,
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
    logL2('requesting block from the sequencer ');
    const response = await axios.get('http://localhost:3333/block');
    const sequencerSignature = response.data.signature;
    const encTxBlock = response.data.encTxBlock;
    logL2('encTxBlock built by the sequencer: ', encTxBlock);
    const encTxBlockHash = hashSHA256(stringify(encTxBlock));
    const isValid = verifySignature(
      encTxBlockHash,
      sequencerSignature,
      sequencerPublicKey
    );

    logL2("is sequencer's signature valid?", isValid);
  } catch (error) {
    logL2("error requesting sequencer's signature:", error);
  }
}, 5000);

app.post('/l2Signature', (req, res) => {
  const encTxHashes = stringify(req.body);
  logL2('received encTxHashes to be signed: ', encTxHashes);
  const encTxHashesHash = hashSHA256(encTxHashes);
  const signature = signData(encTxHashesHash, privateKey);

  res.status(200).json({
    signature: signature,
  });
});

app.listen(PORT, () => {
  logL2('\x1b[31m', 'L2:', '\x1b[0m', 'is running on port: ', PORT);
});
