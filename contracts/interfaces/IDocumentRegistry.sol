// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDocumentRegistry
 * @notice Interface describing the behaviour of the document registry contract used throughout the project.
 * @dev Provides a stable ABI for both the dapp and tests, decoupling them from a particular implementation.
 */
interface IDocumentRegistry {
    /**
     * @notice Structured metadata stored for every document hash.
     * @param hash Keccak256 hash of the original document.
     * @param timestamp Unix timestamp associated with the registration.
     * @param signer Address that stored the document.
     * @param signature Off-chain signature supplied alongside the document hash.
     */
    struct Document {
        bytes32 hash;
        uint256 timestamp;
        address signer;
        bytes signature;
    }

    /**
     * @notice Emitted when a new document hash is successfully registered.
     * @param hash Hash that was recorded.
     * @param signer Account responsible for the registration.
     * @param timestamp Timestamp stored with the document metadata.
     */
    event DocumentStored(bytes32 indexed hash, address indexed signer, uint256 timestamp);

    /**
     * @notice Stores a new document hash and its accompanying metadata.
     * @param _hash Hash of the original document.
     * @param _timestamp Epoch timestamp for the registration.
     * @param _signature Off-chain signature associated with the document hash.
     * @param _signer Address that created the signature.
     */
    function storeDocumentHash(bytes32 _hash, uint256 _timestamp, bytes calldata _signature, address _signer) external;

    /**
     * @notice Verifies if the stored metadata matches the expected signer and signature.
     * @return True when the stored signer and signature match the provided values.
     */
    function verifyDocument(bytes32 _hash, address _signer, bytes calldata _signature) external view returns (bool);

    /**
     * @notice Retrieves the full metadata for a stored document hash.
     */
    function getDocumentInfo(bytes32 _hash) external view returns (Document memory);

    /**
     * @notice Checks whether a document hash is already registered.
     */
    function isDocumentStored(bytes32 _hash) external view returns (bool);

    /**
     * @notice Returns the total number of stored document hashes.
     */
    function getDocumentCount() external view returns (uint256);

    /**
     * @notice Returns the document hash located at the requested index.
     * @dev MUST revert if the index is out of bounds.
     */
    function getDocumentHashByIndex(uint256 _index) external view returns (bytes32);
}

