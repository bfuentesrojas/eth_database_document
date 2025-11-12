"use client";

import React, { useEffect, useMemo, useState } from "react";
import useContract, { DocumentInfo } from "../hooks/useContract";

interface DocumentEntry extends DocumentInfo {
    formattedTimestamp: string;
}

/**
 * Lists every document stored on-chain with readable metadata.
 */
const DocumentHistory: React.FC = () => {
    const { getDocumentCount, getDocumentHashByIndex, getDocumentInfo } =
        useContract();

    const [documents, setDocuments] = useState<DocumentEntry[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const count = Number(await getDocumentCount());
                if (Number.isNaN(count) || count <= 0) {
                    setDocuments([]);
                    return;
                }

                const entries = await Promise.all(
                    Array.from({ length: count }, async (_, index) => {
                        const hash = await getDocumentHashByIndex(index);
                        const info = await getDocumentInfo(hash);
                        const timestampNumber = Number(info.timestamp);
                        const formattedTimestamp = new Date(
                            timestampNumber * 1000,
                        ).toLocaleString();
                        return {
                            ...info,
                            formattedTimestamp,
                        };
                    }),
                );

                setDocuments(entries);
            } catch (err) {
                console.error(err);
                setError("No se pudo cargar el historial de documentos.");
            } finally {
                setIsLoading(false);
            }
        };

        void loadHistory();
    }, [getDocumentCount, getDocumentHashByIndex, getDocumentInfo]);

    const tableRows = useMemo(() => {
        if (!documents.length) {
            return (
                <tr>
                    <td
                        colSpan={4}
                        className="px-4 py-3 text-center text-sm text-gray-400"
                    >
                        No hay documentos registrados.
                    </td>
                </tr>
            );
        }

        return documents.map((doc) => (
            <tr
                key={doc.hash}
                className="text-xs text-slate-300 transition hover:bg-slate-900/80"
            >
                <td className="max-w-[220px] px-6 py-4 font-mono break-all text-cyan-300">
                    {doc.hash}
                </td>
                <td className="max-w-[220px] px-6 py-4 font-mono break-all text-indigo-200">
                    {doc.signer}
                </td>
                <td className="px-6 py-4 text-slate-400">
                    {doc.formattedTimestamp}
                </td>
                <td className="max-w-[220px] px-6 py-4 font-mono break-all text-slate-300">
                    {doc.signature.length > 26
                        ? `${doc.signature.slice(0, 12)}...${doc.signature.slice(-10)}`
                        : doc.signature}
                </td>
            </tr>
        ));
    }, [documents]);

    return (
        <div className="card space-y-5">
            <header className="space-y-2">
                <p className="section-title">4. Historial on-chain</p>
                <h2 className="text-xl font-semibold text-slate-50">
                    Consulta todos los documentos registrados
                </h2>
                <p className="text-sm text-slate-400">
                    Recorremos el contrato para mostrar cada documento, su
                    firmante, fecha y firma original almacenada.
                </p>
            </header>

            {isLoading && (
                <div className="rounded-xl border border-sky-500/50 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
                    Cargando historial de documentos...
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-rose-500/60 bg-rose-500/10 p-4 text-xs text-rose-200">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                        <tr>
                            <th className="px-6 py-4">Hash</th>
                            <th className="px-6 py-4">Firmante</th>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Firma</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                        {tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DocumentHistory;

