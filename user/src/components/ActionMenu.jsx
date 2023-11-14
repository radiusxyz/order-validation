import React, { useState } from 'react';
import { styled } from 'styled-components';
import axios from 'axios';
import Action from './Action';
import crypto from 'crypto';
const sequencerPublicKey = import.meta.env.VITE_SEQUENCER_PUBLIC_KEY;

const Main = styled.div`
  background: #f2f2f2;
  height: 100%;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
`;

const Actions = styled.div`
  background: #373f68;
  padding: 10px 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.p`
  color: #fff;
  font-size: 24px;
`;

const mockTx = {
  nonce: '0x0', // 9th transaction from the sender's address
  gasPrice: '0x4a817c800', // 20 Gwei
  gasLimit: '0x5208', // 21000 gas units, typical for a simple transfer
  to: '0x recipient address here', // recipient's Ethereum address
  value: '0xde0b6b3a7640000', // 1 ether in wei
  data: '0x', // no data is sent in a simple ether transfer
  // signature fields
  v: '0x1b', // chain ID and recovery ID
  r: '0xb850...', // part of the signature
  s: '0x42842...', // part of the signature
};

function solveTLP() {}

async function verifySignature(data, signature, publicKeyPem) {
  // Convert the PEM-encoded public key to a CryptoKey object
  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    pemToBuffer(publicKeyPem),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['verify']
  );

  // Convert data and signature to ArrayBuffer
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const signatureBuffer = Uint8Array.from(atob(signature), (c) =>
    c.charCodeAt(0)
  );

  // Verify the signature
  const isValid = await window.crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    signatureBuffer,
    dataBuffer
  );

  return isValid;
}

// Helper function to convert PEM to ArrayBuffer
function pemToBuffer(pem) {
  const base64String = pem.replace(
    /-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|[\n\r]/g,
    ''
  );
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const ActionMenu = () => {
  const [tx, setTx] = useState(mockTx);
  const [isSendEncTxRunning, setIsSendEncTxRunning] = useState(false);

  const encryptTx = (tx) => {
    return tx;
  };

  const sendEncTx = async () => {
    // Make the function async
    setIsSendEncTxRunning((prevState) => !prevState && true);
    const encTx = encryptTx(tx);
    console.log(encTx);

    try {
      const response = await axios.post('http://localhost:3333/order', encTx);
      console.log(response);
      const isValid = await verifySignature(
        response.data.data.encTxHash,
        response.data.data.signature,
        sequencerPublicKey
      );
      console.log('Is signature valid?', isValid);
    } catch (error) {
      console.log(error);
    }

    setTx((prevTx) => ({
      ...prevTx,
      nonce: `0x${parseInt(parseInt(prevTx.nonce) + 1).toString(16)}`,
    }));
  };

  return (
    <Main>
      <Actions>
        <Title>User</Title>
        <Action handleAction={sendEncTx} isRunning={isSendEncTxRunning}>
          Send tx
        </Action>
        <Action isRunning={false}>Claim</Action>
      </Actions>
      <Actions>
        <Title>Sequencer</Title>
        <Action isRunning={false}>Order tx</Action>
        <Action isRunning={false}>Sign</Action>
        <Action isRunning={false}>Send to user</Action>
        <Action isRunning={false}>Send hashes to L2</Action>
        <Action isRunning={false}>Send tx list to L2</Action>
        <Action isRunning={false}>Store hashes to L1</Action>
      </Actions>
      <Actions>
        <Title>L2</Title>
        <Action isRunning={false}>Request block</Action>
        <Action isRunning={false}>Sign hashchain</Action>
        <Action isRunning={false}>Send to sequencer</Action>
      </Actions>
    </Main>
  );
};

export default ActionMenu;
