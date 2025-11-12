"use client";

import React, { useEffect, useMemo, useState } from "react";
import FileUploader from "../components/FileUploader";
import DocumentSigner from "../components/DocumentSigner";
import DocumentVerifier from "../components/DocumentVerifier";
import DocumentHistory from "../components/DocumentHistory";
import { useMetaMaskContext } from "../contexts/MetaMaskContext";

const tabs = [
    { id: "upload", label: "Upload & Sign" },
    { id: "verify", label: "Verify" },
    { id: "history", label: "History" },
];

/**
 * Main dapp page that orchestrates document upload, signing, verification and history.
 */
const Page: React.FC = () => {
    const {
        walletAddress,
        isConnected,
        connect,
        disconnect,
        switchWallet,
        availableWallets,
        currentWalletIndex,
    } = useMetaMaskContext();

    const [activeTab, setActiveTab] = useState<string>("upload");
    const [documentHash, setDocumentHash] = useState<string>("");
    const [selectedWalletIndex, setSelectedWalletIndex] = useState<number>(
        () => availableWallets[0]?.index ?? 0,
    );

    useEffect(() => {
        if (typeof currentWalletIndex === "number") {
            setSelectedWalletIndex(currentWalletIndex);
            return;
        }

        if (availableWallets.length > 0) {
            setSelectedWalletIndex((prev) => {
                const stillExists = availableWallets.some(
                    (wallet) => wallet.index === prev,
                );
                return stillExists ? prev : availableWallets[0].index;
            });
        }
    }, [availableWallets, currentWalletIndex]);

    const currentAddressShort = useMemo(() => {
        if (!walletAddress) return "No conectado";
        return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }, [walletAddress]);

    const handleConnect = async () => {
        if (availableWallets.length === 0) {
            alert(
                "No se encontraron wallets derivadas. Verifica NEXT_PUBLIC_MNEMONIC.",
            );
            return;
        }
        try {
            await connect(selectedWalletIndex);
        } catch (error) {
            console.error(error);
            alert("No se pudo conectar la wallet.");
        }
    };

    const handleDisconnect = () => {
        disconnect();
    };

    const handleWalletChange = async (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const index = Number(event.target.value);
        setSelectedWalletIndex(index);
        if (isConnected) {
            try {
                await switchWallet(index);
            } catch (error) {
                console.error(error);
                alert("No se pudo cambiar la wallet.");
            }
        }
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case "upload":
                return (
                    <div className="space-y-6">
                        <FileUploader onHashCalculated={setDocumentHash} />
                        <DocumentSigner documentHash={documentHash} />
                    </div>
                );
            case "verify":
                return <DocumentVerifier />;
            case "history":
                return <DocumentHistory />;
            default:
                return null;
        }
    };

    return (
        <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-12 text-slate-100">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-grid bg-[length:24px_24px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top,rgba(2,132,199,0.35),transparent)]" />

            <header className="card gradient-border flex flex-col gap-6">
                <div className="space-y-2">
                    <p className="section-title">Document Registry dApp</p>
                    <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">
                        Custodia, firma y verifica documentos con Ethereum
                    </h1>
                    <p className="text-sm text-slate-400 sm:text-base">
                        Conecta una wallet derivada de Anvil, registra hashes de
                        documentos en el smart contract y consulta su historial
                        completo on-chain.
                    </p>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                            Wallet simulada (Anvil)
                        </label>
                        <select
                            className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 sm:w-72"
                            value={selectedWalletIndex}
                            onChange={handleWalletChange}
                        >
                            {availableWallets.length > 0 ? (
                                availableWallets.map((wallet) => (
                                    <option
                                        key={wallet.index}
                                        value={wallet.index}
                                    >
                                        Wallet {wallet.index} —{" "}
                                        {wallet.address.slice(0, 12)}...
                                    </option>
                                ))
                            ) : (
                                <option value={-1}>
                                    Configura NEXT_PUBLIC_MNEMONIC
                                </option>
                            )}
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                                isConnected
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                                    : "border-rose-500/40 bg-rose-500/10 text-rose-200"
                            }`}
                        >
                            <span
                                className={`h-2.5 w-2.5 rounded-full shadow ${
                                    isConnected
                                        ? "bg-emerald-400 shadow-emerald-400/40"
                                        : "bg-rose-400 shadow-rose-400/40"
                                }`}
                            />
                            {isConnected ? "Conectado" : "Desconectado"}
                        </span>
                        <span className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                            {currentAddressShort}
                        </span>
                        {isConnected ? (
                            <button
                                type="button"
                                className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                                onClick={handleDisconnect}
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
                                onClick={handleConnect}
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <nav className="flex flex-wrap gap-3">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            type="button"
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                                isActive
                                    ? "bg-sky-500 text-slate-950 shadow-glow"
                                    : "border border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            <section className="space-y-6">{renderActiveTab()}</section>
        </main>
    );
};

export default Page;

