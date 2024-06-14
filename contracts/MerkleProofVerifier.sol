// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MerkleProofVerifier {
    /**
     * @dev Verifies the inclusion of a leaf in a Merkle tree.
     * @param proof The Merkle proof containing sibling hashes.
     * @param root The root of the Merkle tree.
     * @param leaf The leaf node (transaction hash) to verify.
     * @param index The index of the leaf node in the tree.
     * @return True if the leaf is part of the tree, false otherwise.
     */
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
                computedHash = keccak256(
                    abi.encodePacked(computedHash, proofElement)
                );
            } else {
                computedHash = keccak256(
                    abi.encodePacked(proofElement, computedHash)
                );
            }

            index = index / 2;
        }

        return computedHash == root;
    }
}
