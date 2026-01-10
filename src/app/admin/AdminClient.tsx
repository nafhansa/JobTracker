// 📁 src/app/admin/AdminClient.tsx
"use client"; // ✅ Ini Client Component

// Sesuaikan tipe data dengan yang kamu return di admin.ts
interface SubscriptionData {
  plan?: string;
  status?: string;
}

type UserData = {
  uid: string;
  email: string;
  subscription?: SubscriptionData | null;
  createdAt: string;
};

export default function AdminClient({ users }: { users: UserData[] }) {
  // Masukkan logic state/UI kamu di sini
  // Contoh:
  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-5">Admin Dashboard</h1>
      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.uid} className="bg-gray-800 p-4 rounded">
            <p className="font-bold">{user.email}</p>
            <p className="text-sm opacity-70">Plan: {user.subscription?.plan || "Free"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}