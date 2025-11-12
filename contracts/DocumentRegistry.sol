// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IDocumentRegistry } from "./interfaces/IDocumentRegistry.sol";

/**
 * @title DocumentRegistry
 * @notice Concrete implementation of `IDocumentRegistry` storing document hashes with metadata on-chain.
 * @dev Stores `Document` structs keyed by hash and exposes read helpers for easy enumeration.
 */
contract DocumentRegistry is IDocumentRegistry {
    mapping(bytes32 => IDocumentRegistry.Document) private documents;
    bytes32[] private documentHashes;

    /**
     * @notice Guard executed before storing a new document hash.
     */
    modifier documentNotExists(bytes32 documentHash) {
        _documentNotExists(documentHash);
        _;
    }

    /**
     * @notice Guard executed before reading document metadata.
     */
    modifier documentExists(bytes32 documentHash) {
        _documentExists(documentHash);
        _;
    }

    /**
     * @inheritdoc IDocumentRegistry
     */
    function storeDocumentHash(bytes32 _hash, uint256 _timestamp, bytes calldata _signature, address _signer)
        external
        documentNotExists(_hash)
        override
    {
        documents[_hash] =
            IDocumentRegistry.Document({ hash: _hash, timestamp: _timestamp, signer: _signer, signature: _signature });

        documentHashes.push(_hash);

        emit DocumentStored(_hash, _signer, _timestamp);
    }

    /**
     * @inheritdoc IDocumentRegistry
     */
    function verifyDocument(bytes32 _hash, address _signer, bytes calldata _signature)
        external
        view
        documentExists(_hash)
        override
        returns (bool)
    {
        IDocumentRegistry.Document storage document = documents[_hash];
        return document.signer == _signer && keccak256(document.signature) == keccak256(_signature);
    }

    /**
     * @inheritdoc IDocumentRegistry
     */
    function getDocumentInfo(bytes32 _hash)
        external
        view
        documentExists(_hash)
        override
        returns (IDocumentRegistry.Document memory)
    {
        IDocumentRegistry.Document storage document = documents[_hash];
        return document;
    }

    /**
     * @inheritdoc IDocumentRegistry
     */
    function isDocumentStored(bytes32 _hash) external view override returns (bool) {
        return documents[_hash].signer != address(0);
    }

    /**
     * @inheritdoc IDocumentRegistry
     */
    function getDocumentCount() external view override returns (uint256) {
        return documentHashes.length;
    }

    /**
     * @inheritdoc IDocumentRegistry
     */
    function getDocumentHashByIndex(uint256 _index) external view override returns (bytes32) {
        require(_index < documentHashes.length, "Index out of bounds");
        return documentHashes[_index];
    }

    /**
     * @notice Reverts when the document hash is already registered.
     */
    function _documentNotExists(bytes32 documentHash) internal view {
        require(documents[documentHash].signer == address(0), "Document already stored");
    }

    /**
     * @notice Reverts when querying metadata for a document hash that does not exist.
     */
    function _documentExists(bytes32 documentHash) internal view {
        require(documents[documentHash].signer != address(0), "Document not found");
    }
}

