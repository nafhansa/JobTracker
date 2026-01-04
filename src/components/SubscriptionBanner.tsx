"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react"; // Opsional: Tambah ikon biar lebih cantik

export const SubscriptionBanner = () => {
  return (
    // 1. Card Background disamakan dengan Pricing Card (#2a0401)
    <Card className="w-full border-[#FFF0C4]/10 bg-[#2a0401] shadow-lg shadow-[#8C1007]/10">
      <CardHeader>
        {/* 2. Font disamakan (Serif) & Warna Teks Cream */}
        <CardTitle className="flex items-center gap-2 font-serif text-xl font-bold tracking-wide text-[#FFF0C4]">
          <Sparkles className="h-5 w-5 text-[#8C1007]" />
          Upgrade to Unlock Full Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 3. Warna paragraf dibuat agak transparan (opacity 80%) */}
        <p className="mb-6 text-[#FFF0C4]/80">
          You are currently on the free plan. To add and manage more job
          applications, please upgrade to a premium plan.
        </p>
        <Link href="/pricing">
          {/* 4. Button merah (#8C1007) dengan hover effect yang sesuai */}
          <Button className="w-full bg-[#8C1007] font-bold tracking-widest text-[#FFF0C4] hover:bg-[#a31208] sm:w-auto">
            UPGRADE NOW
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};