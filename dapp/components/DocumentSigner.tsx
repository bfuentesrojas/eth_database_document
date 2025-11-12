"use client";

import React, { useCallback, useState } from "react";
import { ethers } from "ethers";
import useContract from "../hooks/useContract";
import { useMetaMaskContext } from "../contexts/MetaMaskContext";

interface DocumentSignerProps {
    documentHash: string;
}

/**
 * Allows the user to sign the current document hash and submit the transaction to the registry.
 */
const DocumentSigner: React.FC<DocumentSignerProps> = ({ documentHash }) => {
    const { signMessage, isConnected, connect, walletAddress } =
        useMetaMaskContext();
    const { storeDocumentHash } = useContract();

    const [signature, setSignature] = useState<string>("");
    const [isSigning, setIsSigning] = useState<boolean>(false);
    const [isStoring, setIsStoring] = useState<boolean>(false);

    const handleSign = useCallback(async () => {
        if (!documentHash) {
            alert("Primero selecciona un archivo y genera su hash.");
            return;
        }

        if (!isConnected) {
            try {
                await connect();
            } catch (error) {
                console.error(error);
                alert(
                    "No se pudo conectar la wallet simulada. Verifica que Anvil esté en ejecución e inténtalo nuevamente.",
                );
                return;
            }
        }

        const shouldSign = window.confirm(
            `Se firmará el documento con hash:\n${documentHash}\n\n¿Deseas continuar?`,
        );

        if (!shouldSign) {
            return;
        }

        try {
            setIsSigning(true);
            const signedMessage = await signMessage(documentHash);
            setSignature(signedMessage);
            alert(`Documento firmado correctamente.\nFirma: ${signedMessage}`);
        } catch (error) {
            console.error(error);
            alert("No se pudo firmar el documento.");
        } finally {
            setIsSigning(false);
        }
    }, [connect, documentHash, isConnected, signMessage]);

    const handleStoreOnChain = useCallback(async () => {
        if (!documentHash || !signature) {
            alert(
                "Debes generar el hash y la firma del documento antes de almacenarlo en la blockchain.",
            );
            return;
        }

        if (!walletAddress) {
            alert("Conecta una wallet para continuar.");
            return;
        }

        const shouldStore = window.confirm(
            `Se enviará el documento con hash ${documentHash} a la blockchain.\n¿Confirmas la transacción?`,
        );

        if (!shouldStore) {
            return;
        }

        try {
            setIsStoring(true);
            const timestamp = BigInt(Math.floor(Date.now() / 1000));
            const txReceipt = await storeDocumentHash(
                documentHash,
                signature,
                timestamp,
            );
            alert(
                `Documento almacenado en la blockchain.\nTx Hash: ${txReceipt?.hash ?? "N/A"}`,
            );
        } catch (error) {
            console.error(error);
            alert("No se pudo almacenar el documento en la blockchain.");
        } finally {
            setIsStoring(false);
        }
    }, [documentHash, signature, storeDocumentHash, walletAddress]);

    return (
        <div className="card space-y-5">
            <header className="space-y-2">
                <p className="section-title">2. Firmar & Registrar</p>
                <h2 className="text-xl font-semibold text-slate-50">
                    Firma el hash y publícalo en la blockchain
                </h2>
                <p className="text-sm text-slate-400">
                    Utiliza la wallet seleccionada para generar una firma
                    criptográfica y registrar el documento en el contrato
                    inteligente.
                </p>
            </header>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                    Hash actual
                </p>
                <p className="mt-2 break-all font-mono text-sm text-cyan-300">
                    {documentHash || "Genera un hash desde el paso anterior"}
                </p>
            </div>

            {signature && (
                <div className="rounded-xl border border-indigo-500/60 bg-indigo-500/10 p-4 text-xs text-indigo-200">
                    <p className="mb-2 font-semibold uppercase tracking-widest text-indigo-300/80">
                        Firma generada
                    </p>
                    <p className="break-all">{signature}</p>
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:text-emerald-200"
                    onClick={handleSign}
                    disabled={isSigning}
                >
                    {isSigning ? "Firmando..." : "Firmar documento"}
                </button>
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-800 disabled:text-sky-200"
                    onClick={handleStoreOnChain}
                    disabled={isStoring}
                >
                    {isStoring ? "Registrando..." : "Registrar en blockchain"}
                </button>
            </div>
        </div>
    );
};

export default DocumentSigner;

