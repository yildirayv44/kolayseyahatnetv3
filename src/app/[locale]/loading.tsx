export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 mx-auto animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <div className="absolute inset-0 h-16 w-16 mx-auto animate-ping rounded-full bg-primary/20" />
        </div>
        <p className="text-slate-600">Yükleniyor...</p>
      </div>
    </div>
  );
}
