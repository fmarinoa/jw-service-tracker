"use client";

import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <header className="flex justify-between items-center py-4 border-b border-border/40">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted rounded-md" />
          <div className="h-4 w-24 bg-muted rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-muted rounded-md hidden sm:block" />
          <div className="h-5 w-20 bg-muted rounded-md" />
          <div className="h-8 w-8 bg-muted rounded-md" />
        </div>
      </header>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stats Card Skeleton */}
        <div className="md:col-span-2 border border-border/80 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded-md" />
              <div className="h-12 w-28 bg-muted rounded-md" />
            </div>
            <div className="h-10 w-28 bg-muted rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-32 bg-muted rounded-md" />
              <div className="h-3 w-16 bg-muted rounded-md" />
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full" />
          </div>
        </div>

        {/* Summary Card Skeleton */}
        <div className="border border-border/80 rounded-xl p-6 space-y-4">
          <div className="h-4 w-20 bg-muted rounded-md mb-2" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded-full" />
                  <div className="h-4.5 w-24 bg-muted rounded-md" />
                </div>
                <div className="h-4 w-8 bg-muted rounded-md" />
              </div>
            ))}
          </div>
          <div className="h-10 w-full bg-muted rounded-md" />
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="border border-border/80 rounded-xl p-6 space-y-4">
        <div className="h-5 w-36 bg-muted rounded-md" />
        <div className="divide-y divide-border/60">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4 flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4.5 w-48 bg-muted rounded-md" />
                <div className="h-3.5 w-32 bg-muted rounded-md" />
                <div className="h-3.5 w-56 bg-muted rounded-md" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-muted rounded-md" />
                <div className="h-8 w-8 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
