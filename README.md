# Merkle Proof based Order-Commitment

## Overview

This project demonstrates a Merkle Proof verification system. It includes:
1. A Solidity smart contract to verify whether a transaction (leaf) belongs to a Merkle tree given its proof.
2. A Rust program using the `ethers` library to interact with the smart contract, construct proofs, and verify their validity.

## Smart Contract

The `MerkleProofVerifier` contract provides a method to verify the inclusion of a leaf in a Merkle tree based on its proof.

### Contract Details

- **File**: `MerkleProofVerifier.sol`
- **Language**: Solidity 0.8+
- **Functionality**:
  - **`verify`**:
    - Inputs:
      - `bytes32[] proof`: The Merkle proof containing sibling hashes.
      - `bytes32 root`: The root hash of the Merkle tree.
      - `bytes32 leaf`: The hash of the leaf node (transaction hash).
      - `uint256 index`: The index of the leaf node in the Merkle tree.
    - Returns:
      - `bool`: `true` if the leaf is part of the Merkle tree, `false` otherwise.

```solidity
function verify(
    bytes32[] memory proof,
    bytes32 root,
    bytes32 leaf,
    uint256 index
) public pure returns (bool) {
    bytes32 computedHash = leaf;

    for (uint256 i = 0; i < proof.length; i++) {
        bytes32 proofElement = proof[i];

        if (index % 2 == 0) {
            computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
        } else {
            computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
        }

        index = index / 2;
    }

    return computedHash == root;
}
```

---

## Rust Integration

The Rust program interacts with the deployed smart contract to verify Merkle proofs on-chain. It uses the `ethers` crate for Ethereum interaction.


### Workflow

1. **Connect to Ethereum Node**:
   - Uses an HTTP provider (`http://localhost:8545`) to communicate with an Ethereum node.

2. **Define Smart Contract**:
   - The contract is defined using `ethers::abigen!` to generate type-safe bindings.

3. **Convert Data to Bytes**:
   - Transaction hashes, root, and proof elements are converted to the `bytes32` format.

4. **Merkle Proof Construction**:
   - Example transactions and proof elements are hardcoded for testing.

5. **Verify Proof**:
   - Calls the `verify` method of the `MerkleProofVerifier` contract to validate the proof.

### Example Code Snippets

#### Transaction Proof Setup

```rust
let transactions = vec![
    "0x2ebbeb5ba2fb0742366d00121750a978d3b72fbec340750fee872a5763ff46f7",
    "0x5194ead3df889a15f3d33e47bcc128114dbb9dcd1147f2de8a8ffba6a815f248",
    // Additional transactions...
];
let merkle_root = "0x5d68e1af5c97e158bf9eb63489d05ae7da229e264607323c5ec51a927fb90fe1";
let index = 50; // Example index
```

#### Verify the Proof

```rust
let is_valid = contract
    .verify(proof_elements, root, leaf, index.into())
    .call()
    .await?;
println!("Is the transaction order valid? {}", is_valid);
```


## How to Use

### Steps

1. **Deploy the Contract**:
   - Compile and deploy `MerkleProofVerifier.sol` using your preferred Ethereum deployment method.
   - Note the deployed contract address.

2. **Run the Rust Program**:
   - Update the Rust code with the deployed contract address.
   - Ensure the Ethereum node URL is correct.
   - Build and run the Rust program:
     ```bash
     cargo run
     ```

3. **Check Output**:
   - The program will print whether the Merkle proof is valid for the given transaction.


## Example Output

```plaintext
Proof for transaction 0x66106f1d7f95c702b9f8e2dc0d6be112857ed9a107993f2df9dab1ea26fb1580 at index 50: ["0x6b90f6d59fb5cc6950407d5343d8dcbfe80c684450a47cf9526aeb0b33f8f0ce", ...]
Is the transaction order valid? true
```
