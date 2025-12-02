import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      {/* Animated loader */}
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20" />
      </div>
      
      {/* Loading text */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Sayfa Yükleniyor
        </h2>
        <p className="text-sm text-slate-600">
          Lütfen bekleyiniz...
        </p>
      </div>

      {/* Skeleton content preview */}
      <div className="w-full max-w-4xl space-y-4 px-4 pt-8">
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        </div>

        {/* Hero skeleton */}
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
          <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="flex gap-4 pt-4">
            <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
          <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
