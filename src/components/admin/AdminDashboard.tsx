"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface Nominee {
  id: string;
  handle: string;
  name: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  followerCount: number | null;
  isFeatured: boolean | null;
  isApproved?: boolean | null;
  nominationCount: number;
}

export function AdminDashboard() {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [stats, setStats] = useState({ totalNominees: 0, totalNominations: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/nominees?limit=100&sort=nominations");
    const data = await res.json();
    setNominees(data.nominees);
    setStats(data.stats);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggleFeatured(id: string, featured: boolean) {
    await fetch("/api/admin/nominees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isFeatured: !featured }),
    });
    fetchData();
  }

  async function toggleApproved(id: string, approved: boolean) {
    await fetch("/api/admin/nominees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isApproved: !approved }),
    });
    fetchData();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-brand-red">
              #WomenToFollow
            </Link>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-brand-dark">
              {stats.totalNominees}
            </div>
            <div className="text-sm text-gray-500">Women Nominated</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl font-bold text-brand-dark">
              {stats.totalNominations}
            </div>
            <div className="text-sm text-gray-500">Total Nominations</div>
          </div>
        </div>

        {/* Nominees table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-brand-dark">All Nominees</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Profile</th>
                    <th className="px-6 py-3">Handle</th>
                    <th className="px-6 py-3">Nominations</th>
                    <th className="px-6 py-3">Featured</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {nominees.map((nominee) => (
                    <tr key={nominee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {nominee.profileImageUrl ? (
                            <Image
                              src={nominee.profileImageUrl}
                              alt={nominee.name ?? nominee.handle}
                              width={36}
                              height={36}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                              {nominee.handle[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-brand-dark">
                            {nominee.name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        @{nominee.handle}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {nominee.nominationCount}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            toggleFeatured(
                              nominee.id,
                              nominee.isFeatured ?? false
                            )
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                            nominee.isFeatured
                              ? "bg-brand-yellow/20 text-brand-dark"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {nominee.isFeatured ? "Featured" : "Not Featured"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <a
                            href={`https://x.com/${nominee.handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View on X
                          </a>
                          <button
                            onClick={() =>
                              toggleApproved(
                                nominee.id,
                                nominee.isApproved ?? true
                              )
                            }
                            className="text-xs text-gray-500 hover:text-brand-red cursor-pointer"
                          >
                            {nominee.isApproved !== false ? "Hide" : "Show"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
