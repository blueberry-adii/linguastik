async function detectLanguage(query) {
  if ('translation' in self && 'createDetector' in self.translation) {
    const detector = await self.translation.createDetector()
    const results = await detector.detect(query)
    return results[0]?.detectedLanguage || 'en'
  }
  return 'en'
}