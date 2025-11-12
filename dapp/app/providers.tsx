"use client";

import React from "react";
import { MetaMaskProvider } from "../contexts/MetaMaskContext";

/**
 * Wraps the application with the MetaMask simulation provider so hooks can access wallet state.
 */

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MetaMaskProvider>{children}</MetaMaskProvider>;
}



