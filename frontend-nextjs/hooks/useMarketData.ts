"use client";
import { useState, useEffect } from "react";

export interface Stock {
    ticker: string;
    price: number;
    change_pct: number;
    direction: "up" | "down";
}

const INITIAL_STOCKS: Stock[] = [
    { ticker: "NIFTY 50", price: 22147.20, change_pct: 0.45, direction: "up" },
    { ticker: "SENSEX", price: 73057.40, change_pct: 0.38, direction: "up" },
    { ticker: "SWIGGY", price: 412.50, change_pct: -1.25, direction: "down" },
    { ticker: "ZOMATO", price: 164.20, change_pct: 2.15, direction: "up" },
    { ticker: "RELIANCE", price: 2985.60, change_pct: 0.85, direction: "up" },
    { ticker: "TCS", price: 4120.30, change_pct: -0.42, direction: "down" },
];

export function useMarketData() {
    const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        setConnected(true);
        const interval = setInterval(() => {
            setStocks(prev => prev.map(s => {
                const move = (Math.random() - 0.48) * 0.5;
                const newPrice = s.price * (1 + move / 100);
                return {
                    ...s,
                    price: newPrice,
                    change_pct: s.change_pct + move,
                    direction: move > 0 ? "up" : "down"
                };
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return { stocks, connected };
}
