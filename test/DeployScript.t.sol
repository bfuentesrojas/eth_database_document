// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { DeployDocumentRegistry } from "../script/Deploy.s.sol";
import { DocumentRegistry } from "../contracts/DocumentRegistry.sol";

contract DeployDocumentRegistryHarness is DeployDocumentRegistry {
    string[] internal _commands;

    function runForTest() external returns (DocumentRegistry) {
        _prepareWorkspace();
        _restartAnvil();

        DocumentRegistry registry = new DocumentRegistry();

        _restartDapp();
        _printSummary(address(registry));

        return registry;
    }

    function commands() external view returns (string[] memory) {
        return _commands;
    }

    function _runBash(string memory command) internal override {
        _commands.push(command);
    }
}

contract DeployScriptTest is Test {
    DeployDocumentRegistryHarness private harness;

    function setUp() public {
        harness = new DeployDocumentRegistryHarness();
    }

    function testRunForTestDeploysDocumentRegistry() public {
        DocumentRegistry registry = harness.runForTest();

        assertTrue(address(registry) != address(0), "registry address zero");
        assertGt(address(registry).code.length, 0, "registry code length zero");
        assertEq(registry.getDocumentCount(), 0, "initial count should be zero");
    }

    function testRunForTestInvokesExpectedCommands() public {
        harness.runForTest();

        string[] memory executed = harness.commands();
        assertEq(executed.length, 6, "unexpected command count");

        assertEq(
            keccak256(bytes(executed[0])),
            keccak256(bytes("mkdir -p tmp")),
            "mkdir command mismatch"
        );

        string memory expectedEnsureAnvil =
            "if ! pgrep -f \"anvil --chain-id 31337\" > /dev/null; then nohup anvil --chain-id 31337 --host 127.0.0.1 --port 8545 --silent > tmp/anvil.log 2>&1 & sleep 1; fi";
        assertEq(
            keccak256(bytes(executed[1])),
            keccak256(bytes(expectedEnsureAnvil)),
            "anvil ensure command mismatch"
        );

        assertEq(
            keccak256(bytes(executed[2])),
            keccak256(bytes("sleep 2")),
            "anvil sleep command mismatch"
        );

        string memory expectedInstallCommand =
            "if [ ! -d node_modules ]; then npm install; fi";
        assertEq(
            keccak256(bytes(executed[3])),
            keccak256(bytes(expectedInstallCommand)),
            "npm install command mismatch"
        );

        string memory expectedEnsureDapp =
            "if ! pgrep -f \"next dev\" > /dev/null; then nohup npm run dev > tmp/dapp.log 2>&1 & sleep 2; fi";
        assertEq(
            keccak256(bytes(executed[4])),
            keccak256(bytes(expectedEnsureDapp)),
            "dapp ensure command mismatch"
        );

        assertEq(
            keccak256(bytes(executed[5])),
            keccak256(bytes("sleep 2")),
            "dapp sleep command mismatch"
        );
    }
}

