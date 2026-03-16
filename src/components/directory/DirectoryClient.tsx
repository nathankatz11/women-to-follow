"use client";

import { useState, useEffect, useCallback } from "react";
import { NomineeCard } from "./NomineeCard";
import { Button } from "@/components/ui/button";
import type { NomineeProfile } from "@/types";

export function DirectoryClient({
  initialNominees,
  initialStats,
}: {
  initialNominees: NomineeProfile[];
  initialStats: { totalNominees: number; totalNominations: number };
}) {
  const [nominees, setNominees] = useState(initialNominees);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"nominations" | "recent" | "featured">(
    "nominations"
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialNominees.length === 24);

  const fetchNominees = useCallback(
    async (resetPage = false) => {
      setLoading(true);
      const p = resetPage ? 1 : page;
      const params = new URLSearchParams({
        sort,
        page: p.toString(),
        limit: "24",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/nominees?${params}`);
      const data = await res.json();

      if (resetPage) {
        setNominees(data.nominees);
        setPage(1);
      } else {
        setNominees((prev) =>
          p === 1 ? data.nominees : [...prev, ...data.nominees]
        );
      }
      setHasMore(data.nominees.length === 24);
      setLoading(false);
    },
    [search, sort, page]
  );

  useEffect(() => {
    fetchNominees(true);
  }, [search, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or handle..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition-all bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(["nominations", "recent", "featured"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                sort === s
                  ? "bg-brand-red text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {s === "nominations"
                ? "Most Nominated"
                : s === "recent"
                  ? "Recent"
                  : "Featured"}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        {initialStats.totalNominees} women nominated across{" "}
        {initialStats.totalNominations} nominations
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nominees.map((nominee) => (
          <NomineeCard key={nominee.id} nominee={nominee} />
        ))}
      </div>

      {nominees.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-500">
          {search
            ? "No women found matching your search."
            : "No nominations yet. Be the first!"}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => {
              setPage((p) => p + 1);
              fetchNominees();
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
