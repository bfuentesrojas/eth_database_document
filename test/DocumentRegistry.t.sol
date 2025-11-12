// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { DocumentRegistry } from "../contracts/DocumentRegistry.sol";
import { IDocumentRegistry } from "../contracts/interfaces/IDocumentRegistry.sol";

contract DocumentRegistryTest is Test {
    DocumentRegistry private registry;

    address private constant ALICE = address(0xA11CE);
    address private constant BOB = address(0xB0B);

    function setUp() public {
        registry = new DocumentRegistry();
    }

    function testStoreDocumentHash() public {
        bytes32 hash = keccak256("document-1");
        bytes memory signature = hex"1234";
        uint256 timestamp = block.timestamp;

        registry.storeDocumentHash(hash, timestamp, signature, ALICE);

        assertTrue(registry.isDocumentStored(hash), "Document should be stored");
        assertEq(registry.getDocumentCount(), 1, "Document count should be 1");
    }

    function testVerifyDocumentExisting() public {
        bytes32 hash = keccak256("document-verify");
        bytes memory signature = hex"deadbeef";
        uint256 timestamp = block.timestamp;

        registry.storeDocumentHash(hash, timestamp, signature, ALICE);

        bool isValid = registry.verifyDocument(hash, ALICE, signature);
        assertTrue(isValid, "Verification should succeed for matching signer and signature");
    }

    function testRejectDuplicateDocuments() public {
        bytes32 hash = keccak256("duplicate-doc");
        bytes memory signature = hex"cafe";
        uint256 timestamp = block.timestamp;

        registry.storeDocumentHash(hash, timestamp, signature, ALICE);

        vm.expectRevert("Document already stored");
        registry.storeDocumentHash(hash, timestamp, signature, ALICE);
    }

    function testGetDocumentInfoReturnsCorrectData() public {
        bytes32 hash = keccak256("document-info");
        bytes memory signature = hex"bead";
        uint256 timestamp = block.timestamp;

        registry.storeDocumentHash(hash, timestamp, signature, ALICE);

        IDocumentRegistry.Document memory info = registry.getDocumentInfo(hash);

        assertEq(info.hash, hash, "Hash mismatch");
        assertEq(info.timestamp, timestamp, "Timestamp mismatch");
        assertEq(info.signer, ALICE, "Signer mismatch");
        assertEq(keccak256(info.signature), keccak256(signature), "Signature mismatch");
    }

    function testGetDocumentCount() public {
        bytes32 hash1 = keccak256("doc-count-1");
        bytes32 hash2 = keccak256("doc-count-2");
        bytes memory signature = hex"0102";
        uint256 timestamp = block.timestamp;

        registry.storeDocumentHash(hash1, timestamp, signature, ALICE);
        registry.storeDocumentHash(hash2, timestamp, signature, BOB);

        assertEq(registry.getDocumentCount(), 2, "Document count should be 2");
    }

    function testGetDocumentHashByIndex() public {
        bytes32 hash1 = keccak256("doc-index-1");
        bytes32 hash2 = keccak256("doc-index-2");
        bytes memory signature = hex"11";
        uint256 timestamp = block.timestamp;

        registry.storeDocumentHash(hash1, timestamp, signature, ALICE);
        registry.storeDocumentHash(hash2, timestamp, signature, BOB);

        assertEq(registry.getDocumentHashByIndex(0), hash1, "First index mismatch");
        assertEq(registry.getDocumentHashByIndex(1), hash2, "Second index mismatch");
    }

    function testRevertWhenDocumentNotStored() public {
        bytes32 hash = keccak256("missing-doc");
        bytes memory signature = hex"55";

        vm.expectRevert("Document not found");
        registry.verifyDocument(hash, ALICE, signature);

        vm.expectRevert("Document not found");
        registry.getDocumentInfo(hash);
    }

    function testGetDocumentHashByIndexRevertsWhenOutOfBounds() public {
        vm.expectRevert("Index out of bounds");
        registry.getDocumentHashByIndex(0);
    }
}

