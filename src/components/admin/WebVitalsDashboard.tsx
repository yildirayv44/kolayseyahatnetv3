'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';

interface WebVitalMetric {
  metric: string;
  count: number;
  avg: number;
  p50: number;
  p75: number;
  p95: number;
  min: number;
  max: number;
  ratings: {
    good: number;
    'needs-improvement': number;
    poor: number;
  };
  deviceBreakdown: Array<{
    device: string;
    count: number;
    p75: number;
  }>;
  pageBreakdown: Array<{
    page: string;
    count: number;
    p75: number;
  }>;
}

interface CoreWebVitalStatus {
  metric: string;
  goodPercentage: number;
  isPassing: boolean;
}

interface WebVitalsData {
  summary: WebVitalMetric[];
  coreWebVitals: CoreWebVitalStatus[];
  totalSamples: number;
  dateRange: {
    from: string;
    to: string;
  };
}

interface WebVitalsDashboardProps {
  days?: number;
}

export function WebVitalsDashboard({ days = 7 }: WebVitalsDashboardProps) {
  const [data, setData] = useState<WebVitalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(days);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [selectedDays]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/web-vitals?days=${selectedDays}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching web vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (metric: string, value: number): string => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      LCP: { good: 2500, poor: 4000 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-slate-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricName = (metric: string): string => {
    const names: Record<string, string> = {
      CLS: 'Cumulative Layout Shift',
      FID: 'First Input Delay',
      LCP: 'Largest Contentful Paint',
      FCP: 'First Contentful Paint',
      TTFB: 'Time to First Byte',
      INP: 'Interaction to Next Paint',
    };
    return names[metric] || metric;
  };

  const formatValue = (metric: string, value: number): string => {
    if (metric === 'CLS') {
      return (value / 1000).toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.summary || data.summary.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <Activity className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <h3 className="mb-2 text-lg font-semibold text-slate-900">No Data Available</h3>
        <p className="text-sm text-slate-600">
          Web Vitals data will appear here once users start visiting your site.
        </p>
      </div>
    );
  }

  const selectedMetricData = selectedMetric
    ? data.summary.find((m) => m.metric === selectedMetric)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Web Vitals Dashboard</h2>
          <p className="text-sm text-slate-600">
            Core Web Vitals performance metrics • {data.totalSamples.toLocaleString()} samples
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={fetchMetrics}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Core Web Vitals Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Core Web Vitals Status</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {data.coreWebVitals.map((cwv) => {
            if (!cwv) return null;
            const isPassing = cwv.isPassing;

            return (
              <div
                key={cwv.metric}
                className={`rounded-lg border-2 p-4 transition-all ${
                  isPassing
                    ? 'border-green-200 bg-green-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{cwv.metric}</span>
                  {isPassing ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isPassing ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {cwv.goodPercentage}%
                </div>
                <p className="text-xs text-slate-600">
                  {isPassing ? 'Passing Core Web Vitals' : 'Needs improvement'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.summary.map((metric) => {
          const totalRatings =
            metric.ratings.good +
            metric.ratings['needs-improvement'] +
            metric.ratings.poor;
          const goodPercentage = Math.round((metric.ratings.good / totalRatings) * 100);
          const needsImprovementPercentage = Math.round(
            (metric.ratings['needs-improvement'] / totalRatings) * 100
          );
          const poorPercentage = Math.round((metric.ratings.poor / totalRatings) * 100);

          return (
            <div
              key={metric.metric}
              onClick={() => setSelectedMetric(metric.metric)}
              className={`cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                selectedMetric === metric.metric
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{metric.metric}</h3>
                  <p className="text-xs text-slate-500">{getMetricName(metric.metric)}</p>
                </div>
                <Activity className="h-5 w-5 text-primary" />
              </div>

              {/* P75 Value (Main Metric) */}
              <div className="mb-4">
                <div
                  className={`text-3xl font-bold ${getMetricColor(
                    metric.metric,
                    metric.p75
                  )}`}
                >
                  {formatValue(metric.metric, metric.p75)}
                </div>
                <p className="text-xs text-slate-500">75th percentile</p>
              </div>

              {/* Stats */}
              <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="font-semibold text-slate-900">
                    {formatValue(metric.metric, metric.avg)}
                  </div>
                  <div className="text-slate-500">Average</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {formatValue(metric.metric, metric.p95)}
                  </div>
                  <div className="text-slate-500">95th %ile</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{metric.count}</div>
                  <div className="text-slate-500">Samples</div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Distribution</span>
                  <span className="font-semibold text-green-600">{goodPercentage}% good</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="bg-green-500" style={{ width: `${goodPercentage}%` }} />
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${needsImprovementPercentage}%` }}
                  />
                  <div className="bg-red-500" style={{ width: `${poorPercentage}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Good: {metric.ratings.good}</span>
                  <span>Needs: {metric.ratings['needs-improvement']}</span>
                  <span>Poor: {metric.ratings.poor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View for Selected Metric */}
      {selectedMetricData && (
        <div className="space-y-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              {selectedMetricData.metric} - Detailed Analysis
            </h3>
            <button
              onClick={() => setSelectedMetric(null)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Close
            </button>
          </div>

          {/* Device Breakdown */}
          {selectedMetricData.deviceBreakdown.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Monitor className="h-4 w-4 text-primary" />
                Performance by Device
              </h4>
              <div className="space-y-2">
                {selectedMetricData.deviceBreakdown.map((device) => (
                  <div
                    key={device.device}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.device)}
                      <span className="text-sm font-medium capitalize text-slate-700">
                        {device.device}
                      </span>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${getMetricColor(
                          selectedMetricData.metric,
                          device.p75
                        )}`}
                      >
                        {formatValue(selectedMetricData.metric, device.p75)}
                      </div>
                      <div className="text-xs text-slate-500">{device.count} samples</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Slowest Pages */}
          {selectedMetricData.pageBreakdown.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Globe className="h-4 w-4 text-primary" />
                Top 10 Slowest Pages
              </h4>
              <div className="space-y-2">
                {selectedMetricData.pageBreakdown.map((page, index) => (
                  <div
                    key={page.page}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {page.page || '/'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${getMetricColor(
                          selectedMetricData.metric,
                          page.p75
                        )}`}
                      >
                        {formatValue(selectedMetricData.metric, page.p75)}
                      </div>
                      <div className="text-xs text-slate-500">{page.count} samples</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
