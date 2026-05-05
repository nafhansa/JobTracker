import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAuth } from "@/lib/middleware/auth";
import { MIDTRANS_CONFIG } from "@/lib/midtrans-config";
import { supabaseAdmin } from "@/lib/supabase/server";
import { COIN_PACKAGES } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { packageId, customerDetails } = body;

    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    if (!customerDetails) {
      return NextResponse.json({ error: "Missing customerDetails" }, { status: 400 });
    }

    const amount = pkg.price_idr;
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    const userIdShort = authResult.userId.substring(0, 12);
    const orderId = `JP-${userIdShort}-${timestamp}-${randomStr}`;

    const snapBody: Record<string, unknown> = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
        currency: "IDR",
      },
      customer_details: {
        first_name: customerDetails.firstName || "JobTracker",
        last_name: customerDetails.lastName || "User",
        email: customerDetails.email || "",
        phone: customerDetails.phone || "",
      },
      item_details: [
        {
          id: `coins_${pkg.id}`,
          price: amount,
          quantity: 1,
          name: `JobTracker JPs - ${pkg.name} (${pkg.coins} JPs)`,
          brand: "JobTracker",
          currency: "IDR",
        },
      ],
      custom_field1: authResult.userId,
      custom_field2: `coins_${pkg.id}`,
      custom_field3: "IDR",
    };

    if (!MIDTRANS_CONFIG.serverKey) {
      return NextResponse.json({ error: "Midtrans not configured" }, { status: 500 });
    }

    const authString = Buffer.from(`${MIDTRANS_CONFIG.serverKey}:`).toString("base64");
    const snapApiUrl = MIDTRANS_CONFIG.isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      response = await fetch(snapApiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(snapBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      console.error("Failed to connect to Midtrans API:", fetchError);
      return NextResponse.json({ error: "Failed to connect to payment provider" }, { status: 504 });
    }

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Midtrans API error:", response.status, responseText);
      return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
    }

    const result = JSON.parse(responseText);
    if (!result.token) {
      return NextResponse.json({ error: "No token returned from payment provider" }, { status: 500 });
    }

    const transactionId = crypto.randomUUID();
    const { error: dbError } = await (supabaseAdmin as any)
      .from("pending_midtrans_transactions")
      .insert({
        id: transactionId,
        order_id: orderId,
        user_id: authResult.userId,
        plan: `coins_${pkg.id}`,
        amount: amount,
        snap_token: result.token,
        customer_email: customerDetails.email || null,
        currency: "IDR",
        billing_day: new Date().getDate(),
      });

    if (dbError) {
      console.error("Failed to store pending coin transaction:", dbError);
      return NextResponse.json({ error: "Failed to create transaction record" }, { status: 500 });
    }

    // Also create a permanent coin_purchases record
    const { error: purchaseError } = await (supabaseAdmin as any)
      .from("coin_purchases")
      .insert({
        user_id: authResult.userId,
        order_id: orderId,
        package_id: pkg.id,
        coins: pkg.coins,
        amount_idr: pkg.price_idr,
        status: "pending",
        snap_token: result.token,
      });

    if (purchaseError) {
      console.error("Failed to store coin purchase record:", purchaseError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      token: result.token,
      redirectUrl: result.redirect_url,
      packageId: pkg.id,
      coins: pkg.coins,
      amount,
      currency: "IDR",
    });
  } catch (error) {
    console.error("Error in coin purchase API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}