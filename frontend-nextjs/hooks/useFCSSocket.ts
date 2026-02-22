"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ── Sector definitions ── */
export interface SectorDef {
    label: string;
    color: string;
    symbols: SymbolDef[];
}

export interface SymbolDef {
    symbol: string;      // e.g. "NSE:TCS"
    displayName: string; // e.g. "TCS"
    exchange: string;    // e.g. "NSE"
}

export const SECTORS: SectorDef[] = [
    {
        label: "Tech",
        color: "#8b5cf6",
        symbols: [
            { symbol: "NSE:TCS", displayName: "TCS", exchange: "NSE" },
            { symbol: "NSE:INFY", displayName: "Infosys", exchange: "NSE" },
            { symbol: "NSE:WIPRO", displayName: "Wipro", exchange: "NSE" },
            { symbol: "NSE:HCLTECH", displayName: "HCL Tech", exchange: "NSE" },
        ],
    },
    {
        label: "Finance",
        color: "#22d3ee",
        symbols: [
            { symbol: "NSE:HDFCBANK", displayName: "HDFC Bank", exchange: "NSE" },
            { symbol: "NSE:ICICIBANK", displayName: "ICICI Bank", exchange: "NSE" },
            { symbol: "NSE:SBIN", displayName: "SBI", exchange: "NSE" },
            { symbol: "NSE:BAJFINANCE", displayName: "Bajaj Finance", exchange: "NSE" },
        ],
    },
    {
        label: "Energy",
        color: "#f59e0b",
        symbols: [
            { symbol: "NSE:RELIANCE", displayName: "Reliance", exchange: "NSE" },
            { symbol: "NSE:ONGC", displayName: "ONGC", exchange: "NSE" },
            { symbol: "NSE:NTPC", displayName: "NTPC", exchange: "NSE" },
            { symbol: "NSE:POWERGRID", displayName: "Power Grid", exchange: "NSE" },
        ],
    },
    {
        label: "Consumer",
        color: "#34d399",
        symbols: [
            { symbol: "NSE:HINDUNILVR", displayName: "HUL", exchange: "NSE" },
            { symbol: "NSE:ITC", displayName: "ITC", exchange: "NSE" },
            { symbol: "NSE:NESTLEIND", displayName: "Nestle", exchange: "NSE" },
            { symbol: "NSE:ASIANPAINT", displayName: "Asian Paints", exchange: "NSE" },
        ],
    },
    {
        label: "Pharma",
        color: "#fb7185",
        symbols: [
            { symbol: "NSE:SUNPHARMA", displayName: "Sun Pharma", exchange: "NSE" },
            { symbol: "NSE:DRREDDY", displayName: "Dr Reddy's", exchange: "NSE" },
            { symbol: "NSE:CIPLA", displayName: "Cipla", exchange: "NSE" },
            { symbol: "NSE:DIVISLAB", displayName: "Divi's Lab", exchange: "NSE" },
        ],
    },
];

/* ── Price data ── */
export interface PriceData {
    symbol: string;
    price: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePct: number;
    direction: "up" | "down" | "flat";
    lastUpdate: number;
    history: number[]; // recent close prices for sparkline
}

interface FCSClient {
    connect: () => Promise<any>;
    join: (symbol: string, timeframe: string) => void;
    leave: (symbol: string, timeframe: string) => void;
    removeAll: () => void;
    disconnect: () => void;
    onconnected: (() => void) | null;
    onreconnect: (() => void) | null;
    onclose: ((e: any) => void) | null;
    onerror: ((e: any) => void) | null;
    onmessage: ((data: any) => void) | null;
}

declare global {
    interface Window {
        FCSClient: new (apiKey: string, wsUrl?: string) => FCSClient;
    }
}

const API_KEY = process.env.NEXT_PUBLIC_FCS_API_KEY || "fcs_socket_demo";
const WS_URL = "wss://ws-v4.fcsapi.com/ws";
const TIMEFRAME = "1D";
const MAX_HISTORY = 30;

export function useFCSSocket(activeSector: string) {
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("connecting");
    const clientRef = useRef<FCSClient | null>(null);
    const scriptLoadedRef = useRef(false);
    const currentSectorRef = useRef(activeSector);

    // Get all symbols for the active sector
    const sectorDef = SECTORS.find(s => s.label === activeSector);
    const sectorSymbols = sectorDef?.symbols ?? [];

    const updatePrice = useCallback((symbol: string, data: any) => {
        setPrices(prev => {
            const existing = prev[symbol];
            const price = data.c ?? existing?.price ?? 0;
            const open = data.o ?? existing?.open ?? price;
            const change = price - open;
            const changePct = open > 0 ? (change / open) * 100 : 0;
            const history = [...(existing?.history ?? []), price].slice(-MAX_HISTORY);

            return {
                ...prev,
                [symbol]: {
                    symbol,
                    price,
                    open: data.o ?? existing?.open ?? price,
                    high: data.h ?? existing?.high ?? price,
                    low: data.l ?? existing?.low ?? price,
                    close: price,
                    volume: data.v ?? existing?.volume ?? 0,
                    change,
                    changePct,
                    direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
                    lastUpdate: Date.now(),
                    history,
                },
            };
        });
    }, []);

    // Load the FCS client library
    useEffect(() => {
        if (scriptLoadedRef.current) return;
        if (typeof window !== "undefined" && window.FCSClient) {
            scriptLoadedRef.current = true;
            return;
        }

        const script = document.createElement("script");
        script.src = "/fcs-client-lib.js";
        script.async = true;
        script.onload = () => { scriptLoadedRef.current = true; };
        document.head.appendChild(script);

        return () => {
            // don't remove script, keep it loaded
        };
    }, []);

    // Connect and subscribe
    useEffect(() => {
        currentSectorRef.current = activeSector;

        const init = async () => {
            // Wait for script to load
            let attempts = 0;
            while (!window.FCSClient && attempts < 50) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }

            if (!window.FCSClient) {
                setStatus("error");
                return;
            }

            // If already connected, just switch subscriptions
            if (clientRef.current) {
                clientRef.current.removeAll();
                sectorSymbols.forEach(s => {
                    clientRef.current!.join(s.symbol, TIMEFRAME);
                });
                return;
            }

            setStatus("connecting");
            const client = new window.FCSClient(API_KEY, WS_URL);
            clientRef.current = client;

            client.onconnected = () => {
                setConnected(true);
                setStatus("connected");
                // Subscribe to current sector's symbols
                const sector = SECTORS.find(s => s.label === currentSectorRef.current);
                sector?.symbols.forEach(s => {
                    client.join(s.symbol, TIMEFRAME);
                });
            };

            client.onreconnect = () => {
                setConnected(true);
                setStatus("connected");
            };

            client.onclose = () => {
                setConnected(false);
                setStatus("disconnected");
            };

            client.onerror = () => {
                setStatus("error");
            };

            client.onmessage = (data: any) => {
                if (data.type === "price" && data.prices) {
                    updatePrice(data.symbol, data.prices);
                }
            };

            try {
                await client.connect();
            } catch {
                setStatus("error");
            }
        };

        init();

        // Cleanup: just unsubscribe on sector change, don't disconnect
        return () => {
            if (clientRef.current) {
                clientRef.current.removeAll();
            }
        };
    }, [activeSector, sectorSymbols, updatePrice]);

    // Full cleanup on unmount
    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect();
                clientRef.current = null;
            }
        };
    }, []);

    return { prices, connected, status, sectorSymbols };
}
