// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { DocumentRegistry } from "../contracts/DocumentRegistry.sol";

/**
 * @title DeployDocumentRegistry
 * @notice Foundry script that deploys `DocumentRegistry` and orchestrates the local dev environment.
 * @dev Designed to run against Anvil; it optionally spawns Anvil and the Next.js dapp through FFI commands.
 */
contract DeployDocumentRegistry is Script {
    string internal constant _TMP_DIR = "tmp";
    string internal constant _ANVIL_CMD =
        "nohup anvil --chain-id 31337 --host 127.0.0.1 --port 8545 --silent > tmp/anvil.log 2>&1 &";
    string internal constant _DAPP_CMD = "nohup npm run dev > tmp/dapp.log 2>&1 &";

    function run() external returns (DocumentRegistry) {
        _prepareWorkspace();
        _restartAnvil();

        vm.startBroadcast();
        DocumentRegistry registry = new DocumentRegistry();
        vm.stopBroadcast();

        console2.log("Contract deployed at:", address(registry));

        _restartDapp();
        _printSummary(address(registry));

        return registry;
    }

    function _prepareWorkspace() internal {
        console2.log("Preparing workspace...");
        _runBash(string.concat("mkdir -p ", _TMP_DIR));
    }

    function _restartAnvil() internal {
        console2.log("Ensuring Anvil on http://127.0.0.1:8545 ...");
        _runBash(
            string.concat(
                "if ! pgrep -f \"[a]nvil --chain-id 31337\" > /dev/null; then ",
                _ANVIL_CMD,
                " sleep 1; fi"
            )
        );
        _runBash("sleep 2");
        console2.log("Anvil is running. Logs:", string.concat(_TMP_DIR, "/anvil.log"));
    }

    function _restartDapp() internal {
        console2.log("Ensuring Next.js dapp on http://localhost:3001 ...");
        _runBash("if [ ! -d node_modules ]; then npm install; fi");
        _runBash(
            string.concat(
                "if ! pgrep -f \"[n]ext dev\" > /dev/null; then ",
                _DAPP_CMD,
                " sleep 2; fi"
            )
        );
        _runBash("sleep 2");
        console2.log("Dapp available. Logs:", string.concat(_TMP_DIR, "/dapp.log"));
    }

    function _printSummary(address registry) internal pure {
        console2.log("");
        console2.log("----------------------------------------------------");
        console2.log("Environment ready");
        console2.log("RPC URL    : http://127.0.0.1:8545");
        console2.log("Dapp URL   : http://localhost:3001");
        console2.log("Registry   :", registry);
        console2.log("Logs (Anvil):", string.concat(_TMP_DIR, "/anvil.log"));
        console2.log("Logs (Dapp) :", string.concat(_TMP_DIR, "/dapp.log"));
        console2.log("----------------------------------------------------");
    }

    function _runBash(string memory command) internal virtual {
        string[] memory inputs = new string[](3);
        inputs[0] = "bash";
        inputs[1] = "-lc";
        inputs[2] = command;
        vm.ffi(inputs);
    }
}