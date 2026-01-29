"use client";

import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { ReactNode, useEffect, useState } from "react";
import { PADDLE_ENV } from "@/lib/paddle-config";

export function PaddleProvider({ children }: { children: ReactNode }) {
    const [paddle, setPaddle] = useState<Paddle>();

    useEffect(() => {
        if (PADDLE_ENV.clientToken) {
            initializePaddle({
                environment: PADDLE_ENV.environment,
                token: PADDLE_ENV.clientToken,
            }).then((paddleInstance) => {
                if (paddleInstance) {
                    setPaddle(paddleInstance);
                }
            });
        }
    }, []);

    return <>{children}</>;
}
