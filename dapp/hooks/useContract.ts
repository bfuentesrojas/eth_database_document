import { useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { useMetaMaskContext } from "../contexts/MetaMaskContext";
import DocumentRegistryArtifact from "../abi/DocumentRegistry.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
const DOCUMENT_REGISTRY_ABI = DocumentRegistryArtifact.abi as ethers.InterfaceAbi;

type DocumentRegistryContract = ethers.Contract & {
    storeDocumentHash: (
        hash: string,
        timestamp: bigint,
        signature: ethers.BytesLike,
        signer: string,
    ) => Promise<ethers.TransactionResponse>;
    verifyDocument: (
        hash: string,
        signer: string,
        signature: ethers.BytesLike,
    ) => Promise<boolean>;
    getDocumentInfo: (
        hash: string,
    ) => Promise<{
        hash: string;
        timestamp: bigint;
        signer: string;
        signature: string;
    }>;
    isDocumentStored: (hash: string) => Promise<boolean>;
    getDocumentCount: () => Promise<bigint>;
    getDocumentHashByIndex: (index: bigint) => Promise<string>;
};

/**
 * Serializable representation returned by `getDocumentInfo`.
 */
export interface DocumentInfo {
    hash: string;
    timestamp: bigint;
    signer: string;
    signature: string;
}

/**
 * React hook that encapsulates read/write operations against the `DocumentRegistry` contract.
 */
const useContract = () => {
    const { provider, getSigner, walletAddress } = useMetaMaskContext();

    const contract = useMemo<DocumentRegistryContract | null>(() => {
        if (!CONTRACT_ADDRESS) {
            return null;
        }
        return new ethers.Contract(
            CONTRACT_ADDRESS,
            DOCUMENT_REGISTRY_ABI,
            provider,
        ) as DocumentRegistryContract;
    }, [provider]);

    const requireContract = useCallback((): DocumentRegistryContract => {
        if (!contract) {
            throw new Error(
                "DocumentRegistry contract address no configurado. Define NEXT_PUBLIC_CONTRACT_ADDRESS.",
            );
        }
        return contract;
    }, [contract]);

    const storeDocumentHash = useCallback(
        async (
            hash: string,
            signature: ethers.BytesLike,
            timestamp?: bigint | number,
        ) => {
            const instance = requireContract();
            const signer = getSigner();

            if (!signer || !walletAddress) {
                throw new Error("Debes conectar una wallet antes de firmar.");
            }

            const executionTimestamp =
                typeof timestamp === "bigint"
                    ? timestamp
                    : BigInt(
                          timestamp ??
                              Math.floor(Date.now() / 1000),
                      );

            const instanceWithSigner = instance.connect(
                signer,
            ) as DocumentRegistryContract;

            const tx = await instanceWithSigner.storeDocumentHash(
                hash,
                executionTimestamp,
                signature,
                walletAddress,
            );

            return tx.wait();
        },
        [getSigner, requireContract, walletAddress],
    );

    const verifyDocument = useCallback(
        async (
            hash: string,
            signature: ethers.BytesLike,
            signerAddress?: string,
        ) => {
            const instance = requireContract();
            const addressToVerify = signerAddress ?? walletAddress;

            if (!addressToVerify) {
                throw new Error(
                    "Se requiere una dirección de firmante para verificar el documento.",
                );
            }

            return instance.verifyDocument(hash, addressToVerify, signature);
        },
        [requireContract, walletAddress],
    );

    const getDocumentInfo = useCallback(
        async (hash: string): Promise<DocumentInfo> => {
            const instance = requireContract();
            const data = await instance.getDocumentInfo(hash);

            return {
                hash: data.hash,
                timestamp: BigInt(data.timestamp),
                signer: data.signer,
                signature: data.signature,
            };
        },
        [requireContract],
    );

    const isDocumentStored = useCallback(
        async (hash: string) => {
            const instance = requireContract();
            return instance.isDocumentStored(hash);
        },
        [requireContract],
    );

    const getDocumentCount = useCallback(async () => {
        const instance = requireContract();
        const count = await instance.getDocumentCount();
        return BigInt(count);
    }, [requireContract]);

    const getDocumentHashByIndex = useCallback(
        async (index: number | bigint) => {
            const instance = requireContract();
            const normalizedIndex =
                typeof index === "bigint" ? index : BigInt(index);
            return instance.getDocumentHashByIndex(normalizedIndex);
        },
        [requireContract],
    );

    return {
        contract,
        storeDocumentHash,
        verifyDocument,
        getDocumentInfo,
        isDocumentStored,
        getDocumentCount,
        getDocumentHashByIndex,
    };
};

export default useContract;

