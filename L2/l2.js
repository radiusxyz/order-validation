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

// Request the block of transactions every 5 seconds
setInterval(async () => {
  try {
    logL2('requesting block from the sequencer ');
    /* Send a get request for getting the block, this will trigger 
    the sequencer to make a POST request to /l2Signature for
    signing before it provides the transaction block */
    const response = await axios.get('http://localhost:3333/block');
    /* After the sequencer receives and verifies the signature 
    it provides the encrpyted transaction block, which contains
    objects with the necessary information for decryption */
    const sequencerSignature = response.data.signature;
    const encTxBlock = response.data.encTxBlock;
    logL2('encTxBlock built by the sequencer: ', encTxBlock);
    // Hash the stringified encrypted tx block for signature verification
    const encTxBlockHash = hashSHA256(stringify(encTxBlock));
    // Verify the signature
    const isValid = verifySignature(
      encTxBlockHash,
      sequencerSignature,
      sequencerPublicKey
    );

    logL2("is sequencer's signature valid?", isValid);
  } catch (error) {
    logL2("error requesting sequencer's signature:", error);
  }
}, 20000);

app.post('/l2Signature', (req, res) => {
  // Convert received object to string, since arguments for hashing functions should of type string
  const encTxHashes = stringify(req.body);
  logL2('received encTxHashes to be signed: ', encTxHashes);
  // Hash the encrypted tx hash list
  const encTxHashesHash = hashSHA256(encTxHashes);
  // Sign it with L2's private key
  const signature = signData(encTxHashesHash, privateKey);
  // Send the signature back to the sequencer
  res.status(200).json({
    signature: signature,
  });
});

app.listen(PORT, () => {
  logL2('is running on port: ', PORT);
});
