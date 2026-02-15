"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { PADDLE_ENV } from "@/lib/paddle-config";

interface PaddleContextType {
    paddle: Paddle | undefined;
}

const PaddleContext = createContext<PaddleContextType>({ paddle: undefined });

export const usePaddle = () => useContext(PaddleContext);

export function PaddleProvider({ children }: { children: ReactNode }) {
    const [paddle, setPaddle] = useState<Paddle>();

    useEffect(() => {
        if (PADDLE_ENV.clientToken && !paddle) {
            initializePaddle({
                environment: PADDLE_ENV.environment,
                token: PADDLE_ENV.clientToken,
            }).then((paddleInstance) => {
                if (paddleInstance) {
                    setPaddle(paddleInstance);
                }
            });
        }
    }, [paddle]);

    return (
        <PaddleContext.Provider value={{ paddle }}>
            {children}
        </PaddleContext.Provider>
    );
}
