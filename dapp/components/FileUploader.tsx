"use client";

import React, { useCallback, useState } from "react";
import { ethers } from "ethers";

interface FileUploaderProps {
    onHashCalculated?: (hash: string) => void;
}

/**
 * Handles file selection and hashing, emitting the resulting hash to parent components.
 */
const FileUploader: React.FC<FileUploaderProps> = ({ onHashCalculated }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileHash, setFileHash] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const computeHash = useCallback(
        async (file: File) => {
            setIsProcessing(true);
            setError(null);
            try {
                const arrayBuffer = await file.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                const hash = ethers.keccak256(bytes);

                setFileHash(hash);
                onHashCalculated?.(hash);
            } catch (err) {
                setError("No se pudo calcular el hash del archivo.");
                console.error(err);
            } finally {
                setIsProcessing(false);
            }
        },
        [onHashCalculated],
    );

    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) {
                setSelectedFile(null);
                setFileHash("");
                onHashCalculated?.("");
                return;
            }

            setSelectedFile(file);
            await computeHash(file);
        },
        [computeHash, onHashCalculated],
    );

    return (
        <div className="card gradient-border space-y-5">
            <header className="space-y-2">
                <p className="section-title">1. Subir documento</p>
                <h2 className="text-xl font-semibold text-slate-50">
                    Selecciona un archivo para generar su huella única
                </h2>
                <p className="text-sm text-slate-400">
                    Calculamos automáticamente el hash keccak256 para garantizar
                    la integridad del documento antes de firmarlo.
                </p>
            </header>

            <label className="relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cyan-600/40 bg-cyan-500/5 px-6 py-8 text-center transition hover:border-cyan-400/80 hover:bg-cyan-500/10">
                <span className="text-sm font-medium text-cyan-200">
                    Arrastra y suelta el archivo aquí o haz clic para elegir
                </span>
                <span className="mt-2 text-xs text-slate-400">
                    Se admiten todos los formatos. Tamaño máximo 10 MB.
                </span>
                <input
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                />
            </label>

            {selectedFile && (
                <div className="flex items-center justify-between rounded-xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                </div>
            )}

            {isProcessing && (
                <p className="text-sm text-cyan-300">
                    Calculando hash... esto puede tardar unos segundos.
                </p>
            )}

            {fileHash && (
                <div className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 p-4 text-xs text-emerald-200 break-all shadow-glow">
                    <p className="mb-1 text-[0.7rem] uppercase tracking-widest text-emerald-300/80">
                        Hash generado
                    </p>
                    {fileHash}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-rose-500/60 bg-rose-500/10 p-4 text-xs text-rose-200">
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUploader;

