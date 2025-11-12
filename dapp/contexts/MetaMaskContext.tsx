"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useRef,
    ReactNode,
} from "react";
import { ethers, Wallet } from "ethers";

/**
 * Wallet derived from an Anvil mnemonic that can be toggled from the UI.
 */
interface DerivedWallet {
    index: number;
    address: string;
    privateKey: string;
}

/**
 * Shape of the MetaMask simulation context exposed to the rest of the dapp.
 */
interface MetaMaskContextValue {
    provider: ethers.JsonRpcProvider;
    walletAddress: string | null;
    isConnected: boolean;
    availableWallets: DerivedWallet[];
    currentWalletIndex: number | null;
    connect: (walletIndex?: number) => Promise<string>;
    disconnect: () => void;
    signMessage: (message: string | Uint8Array) => Promise<string>;
    getSigner: () => Wallet | null;
    switchWallet: (walletIndex: number) => Promise<string>;
}

const DEFAULT_ANVIL_MNEMONIC =
    "test test test test test test test test test test test junk";
const ANVIL_MNEMONIC =
    process.env.NEXT_PUBLIC_MNEMONIC ?? DEFAULT_ANVIL_MNEMONIC;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

const MetaMaskContext = createContext<MetaMaskContextValue | undefined>(
    undefined,
);

/**
 * Provides access to a deterministic set of wallets derived from Anvil's mnemonic.
 * Mirrors the behaviour of MetaMask but relies on `ethers.Wallet` for local signing.
 */
export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
    const provider = useMemo(
        () => new ethers.JsonRpcProvider(RPC_URL),
        [RPC_URL],
    );

    const availableWallets = useMemo<DerivedWallet[]>(() => {
        if (!ANVIL_MNEMONIC) {
            return [];
        }
        return Array.from({ length: 10 }, (_, index) => {
            const path = `m/44'/60'/0'/0/${index}`;
            const wallet = ethers.HDNodeWallet.fromPhrase(
                ANVIL_MNEMONIC,
                undefined,
                path,
            );
            return {
                index,
                address: wallet.address,
                privateKey: wallet.privateKey,
            };
        });
    }, []);

    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [walletIndex, setWalletIndex] = useState<number | null>(null);
    const walletRef = useRef<Wallet | null>(null);
    const walletIndexRef = useRef<number | null>(null);

    const deriveWallet = useCallback(
        (index: number) => {
            if (!ANVIL_MNEMONIC || availableWallets.length === 0) {
                throw new Error("Mnemonic not configured for Anvil wallets");
            }
            if (index < 0 || index >= availableWallets.length) {
                throw new Error("Wallet index out of bounds");
            }

            const selected = availableWallets[index];
            return new Wallet(selected.privateKey, provider);
        },
        [availableWallets, provider],
    );

    const connect = useCallback(
        async (index = 0) => {
            const derivedWallet = deriveWallet(index);
            walletRef.current = derivedWallet;
            walletIndexRef.current = index;
            setWallet(derivedWallet);
            setWalletIndex(index);
            return derivedWallet.address;
        },
        [deriveWallet],
    );

    const disconnect = useCallback(() => {
        setWallet(null);
        setWalletIndex(null);
        walletRef.current = null;
        walletIndexRef.current = null;
    }, []);

    const signMessage = useCallback(
        async (message: string | Uint8Array) => {
            let activeWallet = walletRef.current ?? wallet;
            if (!activeWallet) {
                const index = walletIndexRef.current ?? walletIndex;
                if (index === null) {
                    throw new Error("Wallet not connected");
                }
                activeWallet = deriveWallet(index);
                walletRef.current = activeWallet;
                setWallet(activeWallet);
                setWalletIndex(index);
            }
            return activeWallet.signMessage(message);
        },
        [deriveWallet, wallet, walletIndex],
    );

    const getSigner = useCallback(() => {
        const activeWallet = walletRef.current ?? wallet;
        if (!activeWallet) {
            return null;
        }
        if (!activeWallet.provider) {
            const connectedWallet = activeWallet.connect(provider);
            walletRef.current = connectedWallet;
            setWallet(connectedWallet);
            return connectedWallet;
        }
        return activeWallet;
    }, [provider, wallet]);

    const switchWallet = useCallback(
        async (index: number) => {
            const address = await connect(index);
            return address;
        },
        [connect],
    );

    const contextValue = useMemo<MetaMaskContextValue>(
        () => ({
            provider,
            walletAddress: wallet?.address ?? walletRef.current?.address ?? null,
            isConnected: !!(wallet ?? walletRef.current),
            availableWallets,
            currentWalletIndex: walletIndex,
            connect,
            disconnect,
            signMessage,
            getSigner,
            switchWallet,
        }),
        [
            availableWallets,
            connect,
            disconnect,
            getSigner,
            provider,
            signMessage,
            switchWallet,
            wallet,
            walletIndex,
        ],
    );

    return (
        <MetaMaskContext.Provider value={contextValue}>
            {children}
        </MetaMaskContext.Provider>
    );
};

export const useMetaMaskContext = (): MetaMaskContextValue => {
    const context = useContext(MetaMaskContext);
    if (context === undefined) {
        throw new Error(
            "useMetaMaskContext must be used within a MetaMaskProvider",
        );
    }
    return context;
};

