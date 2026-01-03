import { WebVitalsDashboard } from '@/components/admin/WebVitalsDashboard';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics & Performance</h1>
        <p className="mt-2 text-sm text-slate-600">
          Monitor your website's Core Web Vitals and performance metrics
        </p>
      </div>

      <WebVitalsDashboard days={7} />
    </div>
  );
}
