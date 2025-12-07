/**
 * Content Optimizer - Readability, SEO, and Quality Analysis
 */

export interface ContentAnalysis {
  overallScore: number;
  readability: ReadabilityScore;
  seo: SEOScore;
  quality: QualityScore;
  suggestions: string[];
}

export interface ReadabilityScore {
  score: number;
  level: 'easy' | 'medium' | 'hard';
  avgSentenceLength: number;
  avgWordLength: number;
  complexWords: number;
  issues: string[];
}

export interface SEOScore {
  score: number;
  keywordDensity: number;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  headingStructure: boolean;
  internalLinks: number;
  externalLinks: number;
  imageAltTexts: number;
  issues: string[];
}

export interface QualityScore {
  score: number;
  wordCount: number;
  uniqueWords: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  tone: 'formal' | 'casual' | 'mixed';
  issues: string[];
}

/**
 * Calculate Flesch Reading Ease Score (Turkish adapted)
 */
export function calculateReadability(content: string): ReadabilityScore {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  const avgSentenceLength = words.length / Math.max(sentences.length, 1);
  const avgSyllablesPerWord = syllables / Math.max(words.length, 1);
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / Math.max(words.length, 1);

  // Flesch Reading Ease (adapted for Turkish)
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  const normalizedScore = Math.max(0, Math.min(100, fleschScore));

  // Count complex words (>3 syllables)
  const complexWords = words.filter(w => countSyllables(w) > 3).length;

  const issues: string[] = [];
  if (avgSentenceLength > 25) issues.push('Cümleler çok uzun (ort. ' + Math.round(avgSentenceLength) + ' kelime)');
  if (avgWordLength > 6) issues.push('Kelimeler çok uzun (ort. ' + Math.round(avgWordLength) + ' harf)');
  if (complexWords > words.length * 0.15) issues.push('Çok fazla karmaşık kelime (%' + Math.round((complexWords / words.length) * 100) + ')');

  let level: 'easy' | 'medium' | 'hard';
  if (normalizedScore >= 70) level = 'easy';
  else if (normalizedScore >= 50) level = 'medium';
  else level = 'hard';

  return {
    score: Math.round(normalizedScore),
    level,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    complexWords,
    issues,
  };
}

/**
 * Count syllables in a Turkish word (approximate)
 */
function countSyllables(word: string): number {
  const vowels = 'aeıioöuüAEIİOÖUÜ';
  let count = 0;
  let prevWasVowel = false;

  for (const char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevWasVowel) {
      count++;
    }
    prevWasVowel = isVowel;
  }

  return Math.max(1, count);
}

/**
 * Analyze SEO factors
 */
export function analyzeSEO(
  content: string,
  title?: string,
  metaDescription?: string,
  keywords?: string[]
): SEOScore {
  const issues: string[] = [];
  let score = 100;

  // Meta title check
  const hasMetaTitle = !!title && title.length >= 30 && title.length <= 60;
  if (!hasMetaTitle) {
    issues.push('Meta başlık eksik veya uygun uzunlukta değil (30-60 karakter)');
    score -= 15;
  }

  // Meta description check
  const hasMetaDescription = !!metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160;
  if (!hasMetaDescription) {
    issues.push('Meta açıklama eksik veya uygun uzunlukta değil (120-160 karakter)');
    score -= 15;
  }

  // Heading structure
  const h1Count = (content.match(/^#\s/gm) || []).length;
  const h2Count = (content.match(/^##\s/gm) || []).length;
  const headingStructure = h1Count >= 1 && h2Count >= 2;
  if (!headingStructure) {
    issues.push('Başlık yapısı zayıf (en az 1 H1 ve 2 H2 olmalı)');
    score -= 10;
  }

  // Keyword density
  let keywordDensity = 0;
  if (keywords && keywords.length > 0) {
    const contentLower = content.toLowerCase();
    const totalWords = content.split(/\s+/).length;
    const keywordCount = keywords.reduce((sum, kw) => {
      const regex = new RegExp(kw.toLowerCase(), 'g');
      return sum + (contentLower.match(regex) || []).length;
    }, 0);
    keywordDensity = (keywordCount / totalWords) * 100;

    if (keywordDensity < 0.5) {
      issues.push('Anahtar kelime yoğunluğu çok düşük (%' + keywordDensity.toFixed(2) + ')');
      score -= 10;
    } else if (keywordDensity > 3) {
      issues.push('Anahtar kelime yoğunluğu çok yüksek (%' + keywordDensity.toFixed(2) + ') - keyword stuffing');
      score -= 15;
    }
  }

  // Internal links
  const internalLinks = (content.match(/\[([^\]]+)\]\(\/[^\)]+\)/g) || []).length;
  if (internalLinks < 2) {
    issues.push('Çok az iç link (' + internalLinks + ' adet, en az 3-5 olmalı)');
    score -= 10;
  }

  // External links
  const externalLinks = (content.match(/\[([^\]]+)\]\(https?:\/\/[^\)]+\)/g) || []).length;

  // Image alt texts
  const images = (content.match(/!\[([^\]]*)\]/g) || []).length;
  const imageAltTexts = (content.match(/!\[([^\]]+)\]/g) || []).length;
  if (images > 0 && imageAltTexts < images) {
    issues.push('Bazı görsellerin alt text\'i eksik (' + imageAltTexts + '/' + images + ')');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    keywordDensity: Math.round(keywordDensity * 100) / 100,
    hasMetaTitle,
    hasMetaDescription,
    headingStructure,
    internalLinks,
    externalLinks,
    imageAltTexts,
    issues,
  };
}

/**
 * Analyze content quality
 */
export function analyzeQuality(content: string): QualityScore {
  const issues: string[] = [];
  let score = 100;

  const words = content.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Word count check
  if (wordCount < 300) {
    issues.push('İçerik çok kısa (' + wordCount + ' kelime, en az 500 olmalı)');
    score -= 20;
  } else if (wordCount < 500) {
    issues.push('İçerik kısa (' + wordCount + ' kelime, 1000+ ideal)');
    score -= 10;
  }

  // Unique words
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const uniqueRatio = uniqueWords / wordCount;
  if (uniqueRatio < 0.4) {
    issues.push('Kelime çeşitliliği düşük (%' + Math.round(uniqueRatio * 100) + ')');
    score -= 10;
  }

  // Sentiment analysis (simple)
  const positiveWords = ['harika', 'mükemmel', 'güzel', 'iyi', 'başarılı', 'kaliteli', 'özel', 'muhteşem'];
  const negativeWords = ['kötü', 'zor', 'problem', 'sorun', 'eksik', 'yetersiz', 'başarısız'];
  
  const contentLower = content.toLowerCase();
  const positiveCount = positiveWords.reduce((sum, w) => sum + (contentLower.match(new RegExp(w, 'g')) || []).length, 0);
  const negativeCount = negativeWords.reduce((sum, w) => sum + (contentLower.match(new RegExp(w, 'g')) || []).length, 0);
  
  let sentiment: 'positive' | 'neutral' | 'negative';
  if (positiveCount > negativeCount * 2) sentiment = 'positive';
  else if (negativeCount > positiveCount * 2) sentiment = 'negative';
  else sentiment = 'neutral';

  // Tone analysis (simple)
  const formalWords = ['dolayısıyla', 'nitekim', 'ancak', 'lakin', 'bilakis'];
  const casualWords = ['yani', 'işte', 'hani', 'falan', 'filan'];
  
  const formalCount = formalWords.reduce((sum, w) => sum + (contentLower.match(new RegExp(w, 'g')) || []).length, 0);
  const casualCount = casualWords.reduce((sum, w) => sum + (contentLower.match(new RegExp(w, 'g')) || []).length, 0);
  
  let tone: 'formal' | 'casual' | 'mixed';
  if (formalCount > casualCount * 2) tone = 'formal';
  else if (casualCount > formalCount * 2) tone = 'casual';
  else tone = 'mixed';

  // Check for repetitive phrases
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const repeatedPhrases = findRepeatedPhrases(sentences);
  if (repeatedPhrases.length > 0) {
    issues.push('Tekrarlayan ifadeler bulundu: ' + repeatedPhrases.slice(0, 2).join(', '));
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    wordCount,
    uniqueWords,
    sentiment,
    tone,
    issues,
  };
}

/**
 * Find repeated phrases in sentences
 */
function findRepeatedPhrases(sentences: string[]): string[] {
  const phrases: { [key: string]: number } = {};
  
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
  });

  return Object.entries(phrases)
    .filter(([_, count]) => count > 2)
    .map(([phrase]) => phrase);
}

/**
 * Analyze complete content
 */
export function analyzeContent(
  content: string,
  title?: string,
  metaDescription?: string,
  keywords?: string[]
): ContentAnalysis {
  const readability = calculateReadability(content);
  const seo = analyzeSEO(content, title, metaDescription, keywords);
  const quality = analyzeQuality(content);

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (readability.score * 0.3) +
    (seo.score * 0.4) +
    (quality.score * 0.3)
  );

  // Combine all suggestions
  const suggestions: string[] = [];
  
  if (readability.score < 70) {
    suggestions.push('📖 Okunabilirliği artırın: Daha kısa cümleler ve basit kelimeler kullanın');
  }
  
  if (seo.score < 70) {
    suggestions.push('🔍 SEO\'yu iyileştirin: ' + seo.issues[0]);
  }
  
  if (quality.score < 70) {
    suggestions.push('✨ Kaliteyi artırın: ' + quality.issues[0]);
  }

  if (readability.issues.length > 0) {
    suggestions.push(...readability.issues.slice(0, 2));
  }
  
  if (seo.issues.length > 0) {
    suggestions.push(...seo.issues.slice(0, 2));
  }
  
  if (quality.issues.length > 0) {
    suggestions.push(...quality.issues.slice(0, 2));
  }

  return {
    overallScore,
    readability,
    seo,
    quality,
    suggestions: suggestions.slice(0, 8), // Max 8 suggestions
  };
}
