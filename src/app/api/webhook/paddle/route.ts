import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

// Paddle Webhook verification
function verifyPaddleSignature(signature: string, body: string, secret: string) {
    const [timestamp, h1] = signature.split(";").map(part => part.split("=")[1]);
    const signedPayload = `${timestamp}:${body}`;
    const expectedHash = crypto
        .createHmac("sha256", secret)
        .update(signedPayload)
        .digest("hex");

    return expectedHash === h1;
}

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("paddle-signature") || "";
        const secret = process.env.PADDLE_WEBHOOK_SECRET || "";

        if (!verifyPaddleSignature(signature, rawBody, secret)) {
            console.error("❌ Paddle Webhook: Invalid signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const eventType = payload.event_type;
        const data = payload.data;
        const userId = data.custom_data?.userId;

        if (!userId) {
            console.error("❌ Paddle Webhook: No user ID found in custom_data");
            return NextResponse.json({ error: "No user ID" }, { status: 400 });
        }

        console.log(`🔔 Paddle Webhook: ${eventType} for user ${userId}`);

        const userRef = adminDb.collection("users").doc(userId);

        if (eventType === "subscription.created" || eventType === "subscription.updated" || eventType === "subscription.activated") {
            const status = data.status; // 'active', 'trialing', etc.
            const isPro = status === "active" || status === "trialing";
            const nextBillingDate = data.next_billed_at;
            const planId = data.items[0]?.price?.id;

            await userRef.set({
                isPro,
                subscription: {
                    plan: "monthly", // Defaulting to monthly if it's a subscription
                    status: status,
                    provider: "paddle",
                    paddleSubscriptionId: data.id,
                    paddlePriceId: planId,
                    renewsAt: nextBillingDate ? Timestamp.fromDate(new Date(nextBillingDate)) : null,
                    endsAt: null,
                },
                updatedAt: Timestamp.now(),
            }, { merge: true });

            console.log(`✅ Paddle: Subscription ${status} for user ${userId}`);
        } else if (eventType === "transaction.paid") {
            // Check if it's a one-time payment (lifetime)
            const isLifetime = data.items.some((item: { price?: { id: string } }) => item.price?.id === process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_LIFETIME);

            if (isLifetime) {
                await userRef.set({
                    isPro: true,
                    subscription: {
                        plan: "lifetime",
                        status: "active",
                        provider: "paddle",
                        paddleTransactionId: data.id,
                        renewsAt: null,
                        endsAt: null,
                    },
                    updatedAt: Timestamp.now(),
                }, { merge: true });
                console.log(`✅ Paddle: Lifetime access granted for user ${userId}`);
            }
        } else if (eventType === "subscription.canceled") {
            const endDate = data.ends_at;

            await userRef.set({
                subscription: {
                    status: "cancelled",
                    renewsAt: null,
                    endsAt: endDate ? Timestamp.fromDate(new Date(endDate)) : Timestamp.now(),
                },
                updatedAt: Timestamp.now(),
            }, { merge: true });

            console.log(`✅ Paddle: Subscription cancelled for user ${userId}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Paddle Webhook Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
