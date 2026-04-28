import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json(
    {
      error: "Subscription reactivation now requires payment. Please use the payment flow to reactivate your subscription.",
      redirectTo: "/pricing",
    },
    { status: 410 }
  );
}
