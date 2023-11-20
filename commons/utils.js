import crypto from 'crypto';
import pkg from 'js-sha3';
const { keccak_256 } = pkg;

// Convert any data type to string

export const stringify = (data) => JSON.stringify(data);

// Make an RSA signature

export function signDataRSA(data, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  const signature = sign.sign(privateKey, 'base64');
  return signature;
}

// Make an ECDSA signature

export function signDataECDSA(hash, privateKey) {
  const hashBuffer = Buffer.from(hash, 'hex');
  return crypto.sign(null, hashBuffer, privateKey).toString('hex');
}

// Verify an ECDSA signature

export function verifySignatureECDSA(hash, signature, publicKey) {
  const hashBuffer = Buffer.from(hash, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');
  return crypto.verify(null, hashBuffer, publicKey, signatureBuffer);
}

// Node.js SHA256 hashing using 'crypto' library

export function hashSHA256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Node.js Kecak-256 hashing using 'js-sha3' library

export function hashKeccak256(str) {
  return Buffer.from(keccak_256.arrayBuffer(str)).toString('hex');
}

// RSA signature verification

export function verifySignatureRSA(data, signature, publicKey) {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, 'base64');
}

// Creates an RSA privateKey and publicKey. Destructure with {privateKey, publicKey} = generatePrivPubRSA()

export function generatePrivPubRSA() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Length of your key in bits
  });
}

// Creates an ECDSA privateKey and publicKey. Destructure with {privateKey, publicKey} = generatePrivPubECDSA()

export function generatePrivPubECDSA() {
  return crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}

export function logSeq(...args) {
  console.log('\x1b[36m', 'SEQUENCER: ', '\x1b[0m', ...args);
}

export function logL2(...args) {
  console.log('\x1b[31m', 'L2: ', '\x1b[0m', ...args);
}

export function logL1(...args) {
  console.log('\x1b[92m', 'L1: ', '\x1b[0m', ...args);
}
export default () => 'Welcome to utils';
