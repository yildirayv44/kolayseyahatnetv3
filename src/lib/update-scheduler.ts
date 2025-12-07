/**
 * Content Update Scheduler
 * Tracks content age and suggests update schedules
 */

export interface UpdateSchedule {
  contentId: string;
  lastUpdated: Date;
  nextUpdateDue: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  suggestedChanges: string[];
  daysOverdue?: number;
}

export interface ContentFreshness {
  status: 'fresh' | 'aging' | 'stale' | 'outdated';
  daysSinceUpdate: number;
  recommendedUpdateInterval: number;
  nextUpdateDate: Date;
}

/**
 * Calculate content freshness based on age and type
 */
export function calculateFreshness(
  lastUpdated: Date,
  contentType: 'visa' | 'travel' | 'general' = 'general'
): ContentFreshness {
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

  // Different content types have different freshness requirements
  const updateIntervals: { [key: string]: number } = {
    visa: 90,      // 3 months - visa info changes frequently
    travel: 180,   // 6 months - travel info moderately stable
    general: 365,  // 1 year - general content stable
  };

  const recommendedUpdateInterval = updateIntervals[contentType] || updateIntervals.general;
  const nextUpdateDate = new Date(lastUpdated.getTime() + (recommendedUpdateInterval * 24 * 60 * 60 * 1000));

  let status: 'fresh' | 'aging' | 'stale' | 'outdated';
  if (daysSinceUpdate < recommendedUpdateInterval * 0.5) {
    status = 'fresh';
  } else if (daysSinceUpdate < recommendedUpdateInterval * 0.8) {
    status = 'aging';
  } else if (daysSinceUpdate < recommendedUpdateInterval) {
    status = 'stale';
  } else {
    status = 'outdated';
  }

  return {
    status,
    daysSinceUpdate,
    recommendedUpdateInterval,
    nextUpdateDate,
  };
}

/**
 * Determine update priority based on multiple factors
 */
export function determineUpdatePriority(
  freshness: ContentFreshness,
  pageViews: number = 0,
  hasDateReferences: boolean = false,
  hasPriceInfo: boolean = false
): 'low' | 'medium' | 'high' | 'urgent' {
  let priorityScore = 0;

  // Freshness factor
  if (freshness.status === 'outdated') priorityScore += 40;
  else if (freshness.status === 'stale') priorityScore += 25;
  else if (freshness.status === 'aging') priorityScore += 10;

  // Traffic factor
  if (pageViews > 1000) priorityScore += 30;
  else if (pageViews > 500) priorityScore += 20;
  else if (pageViews > 100) priorityScore += 10;

  // Content type factors
  if (hasDateReferences) priorityScore += 15;
  if (hasPriceInfo) priorityScore += 15;

  // Determine priority
  if (priorityScore >= 70) return 'urgent';
  if (priorityScore >= 50) return 'high';
  if (priorityScore >= 30) return 'medium';
  return 'low';
}

/**
 * Generate update schedule for content
 */
export function generateUpdateSchedule(
  contentId: string,
  lastUpdated: Date,
  contentType: 'visa' | 'travel' | 'general' = 'general',
  pageViews: number = 0,
  hasDateReferences: boolean = false,
  hasPriceInfo: boolean = false
): UpdateSchedule {
  const freshness = calculateFreshness(lastUpdated, contentType);
  const priority = determineUpdatePriority(freshness, pageViews, hasDateReferences, hasPriceInfo);

  const reasons: string[] = [];
  const suggestedChanges: string[] = [];

  // Build reason and suggestions based on status
  if (freshness.status === 'outdated') {
    reasons.push(`İçerik ${freshness.daysSinceUpdate} gündür güncellenmedi`);
    suggestedChanges.push('Tüm bilgileri güncelliğini kontrol edin');
  } else if (freshness.status === 'stale') {
    reasons.push('İçerik güncellenme zamanına yaklaştı');
    suggestedChanges.push('Tarih ve fiyat bilgilerini kontrol edin');
  }

  if (hasDateReferences) {
    suggestedChanges.push('Tarih referanslarını 2024/2025 olarak güncelleyin');
  }

  if (hasPriceInfo) {
    suggestedChanges.push('Ücret ve fiyat bilgilerini güncelleyin');
  }

  if (pageViews > 500) {
    reasons.push(`Yüksek trafik (${pageViews} görüntülenme)`);
    suggestedChanges.push('Popüler içerik - öncelikli güncelleme yapın');
  }

  if (contentType === 'visa') {
    suggestedChanges.push('Vize kuralları değişmiş olabilir');
    suggestedChanges.push('Evrak listesini kontrol edin');
  }

  const daysOverdue = freshness.daysSinceUpdate > freshness.recommendedUpdateInterval
    ? freshness.daysSinceUpdate - freshness.recommendedUpdateInterval
    : undefined;

  return {
    contentId,
    lastUpdated,
    nextUpdateDue: freshness.nextUpdateDate,
    priority,
    reason: reasons.join(', ') || 'Rutin güncelleme',
    suggestedChanges: suggestedChanges.length > 0 ? suggestedChanges : ['Genel içerik kontrolü yapın'],
    daysOverdue,
  };
}

/**
 * Get update reminder message
 */
export function getUpdateReminderMessage(schedule: UpdateSchedule): string {
  const emoji = {
    urgent: '🚨',
    high: '⚠️',
    medium: '📅',
    low: 'ℹ️',
  };

  const priorityText = {
    urgent: 'ACİL',
    high: 'YÜKSEK ÖNCELİK',
    medium: 'Orta Öncelik',
    low: 'Düşük Öncelik',
  };

  let message = `${emoji[schedule.priority]} ${priorityText[schedule.priority]}\n\n`;
  message += `📝 ${schedule.reason}\n\n`;
  
  if (schedule.daysOverdue) {
    message += `⏰ ${schedule.daysOverdue} gün gecikmiş\n\n`;
  }

  message += `Önerilen Değişiklikler:\n`;
  schedule.suggestedChanges.forEach((change, i) => {
    message += `${i + 1}. ${change}\n`;
  });

  return message;
}

/**
 * Batch analyze multiple content items
 */
export function batchAnalyzeUpdates(
  contents: Array<{
    id: string;
    lastUpdated: Date;
    type: 'visa' | 'travel' | 'general';
    pageViews?: number;
    hasDateReferences?: boolean;
    hasPriceInfo?: boolean;
  }>
): UpdateSchedule[] {
  return contents
    .map(content => generateUpdateSchedule(
      content.id,
      content.lastUpdated,
      content.type,
      content.pageViews,
      content.hasDateReferences,
      content.hasPriceInfo
    ))
    .sort((a, b) => {
      // Sort by priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}
