"use client";

import React, { useCallback, useState } from "react";
import { ethers } from "ethers";
import useContract from "../hooks/useContract";

interface VerificationResult {
    isStored: boolean;
    matchesSigner: boolean;
    signerOnChain?: string;
    timestamp?: bigint;
    signature?: string;
}

/**
 * Component that recalculates a file hash locally and validates it against on-chain metadata.
 */
const DocumentVerifier: React.FC = () => {
    const { isDocumentStored, getDocumentInfo } = useContract();

    const [file, setFile] = useState<File | null>(null);
    const [fileHash, setFileHash] = useState<string>("");
    const [signerAddress, setSignerAddress] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected);
            setResult(null);
            setError(null);
            if (!selected) {
                setFileHash("");
                return;
            }

            try {
                const buffer = await selected.arrayBuffer();
                const bytes = new Uint8Array(buffer);
                const hash = ethers.keccak256(bytes);
                setFileHash(hash);
            } catch (err) {
                console.error(err);
                setError("No se pudo calcular el hash del archivo.");
                setFileHash("");
            }
        },
        [],
    );

    const handleVerify = useCallback(async () => {
        if (!file || !fileHash) {
            alert("Selecciona un archivo para verificar.");
            return;
        }
        if (!signerAddress) {
            alert("Introduce la dirección del firmante.");
            return;
        }

        setIsVerifying(true);
        setError(null);
        setResult(null);

        try {
            const stored = await isDocumentStored(fileHash);
            if (!stored) {
                setResult({
                    isStored: false,
                    matchesSigner: false,
                });
                return;
            }

            const info = await getDocumentInfo(fileHash);
            const matches =
                info.signer.toLowerCase() === signerAddress.toLowerCase();

            setResult({
                isStored: true,
                matchesSigner: matches,
                signerOnChain: info.signer,
                timestamp: info.timestamp,
                signature: info.signature,
            });
        } catch (err) {
            console.error(err);
            setError("Error al verificar el documento.");
        } finally {
            setIsVerifying(false);
        }
    }, [file, fileHash, getDocumentInfo, isDocumentStored, signerAddress]);

    const renderResult = () => {
        if (!result) return null;

        if (!result.isStored) {
            return (
                <div className="rounded border border-red-500 bg-red-900/20 p-4 text-red-200">
                    ❌ El documento no existe en la blockchain.
                </div>
            );
        }

        if (!result.matchesSigner) {
            return (
                <div className="space-y-3 rounded border border-yellow-500 bg-yellow-900/20 p-4 text-yellow-100">
                    ❌ El firmante proporcionado no coincide con el registrado.
                    <div className="text-xs">
                        Firmante registrado:{" "}
                        <span className="break-all font-mono">
                            {result.signerOnChain}
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-3 rounded border border-emerald-500 bg-emerald-900/20 p-4 text-emerald-100">
                ✅ El documento es válido y coincide con el firmante.
                <div className="text-xs">
                    <p>
                        Firmante:{" "}
                        <span className="break-all font-mono">
                            {result.signerOnChain}
                        </span>
                    </p>
                    <p>
                        Timestamp:{" "}
                        <span className="font-mono">
                            {result.timestamp?.toString()}
                        </span>
                    </p>
                    <p className="break-all">
                        Firma: {result.signature}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="card space-y-5">
            <header className="space-y-2">
                <p className="section-title">3. Verificar documento</p>
                <h2 className="text-xl font-semibold text-slate-50">
                    Comprueba si el archivo fue firmado y registrado
                </h2>
                <p className="text-sm text-slate-400">
                    Recalculamos el hash localmente y contrastamos los datos
                    on-chain para validar integridad y autoría.
                </p>
            </header>

            <label className="relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-indigo-500/50 bg-indigo-500/5 px-6 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-500/10">
                <span className="text-sm font-medium text-indigo-200">
                    Selecciona el archivo a verificar
                </span>
                <span className="mt-2 text-xs text-slate-400">
                    Calcularemos nuevamente el hash para compararlo con la
                    blockchain.
                </span>
                <input
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                />
            </label>

            {fileHash && (
                <div className="rounded-xl border border-sky-500/60 bg-sky-500/10 p-4 text-xs text-sky-200 break-all">
                    <p className="mb-1 text-[0.7rem] uppercase tracking-widest text-sky-300/80">
                        Hash detectado
                    </p>
                    {fileHash}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                    Dirección del firmante esperado
                </label>
                <input
                    type="text"
                    placeholder="0x..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    value={signerAddress}
                    onChange={(event) => setSignerAddress(event.target.value)}
                />
            </div>

            <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-800"
                onClick={handleVerify}
                disabled={isVerifying}
            >
                {isVerifying ? "Verificando..." : "Verificar documento"}
            </button>

            {renderResult()}

            {error && (
                <div className="rounded-xl border border-rose-500/60 bg-rose-500/10 p-4 text-xs text-rose-200">
                    {error}
                </div>
            )}
        </div>
    );
};

export default DocumentVerifier;

