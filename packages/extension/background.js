chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NEW_SEARCH') {
    handleSearch(message.query, sender.tab.id)
    return true;
  }
})

async function handleSearch(query, tabId) {
  try {
    const detectedLang = await detectLanguage(query)

    const translations = await translateQuery(query, detectedLang)

    const [enResults, jaResults, deResults] = await Promise.all([
      fetchSearchResults(translations.en, 'en', 'com'),
      fetchSearchResults(translations.ja, 'ja', 'co.jp'),
      fetchSearchResults(translations.de, 'de', 'de')
    ])

    const aggregated = aggregateResults({ enResults, jaResults, deResults })

    const summary = await generateSummary(aggregated, detectedLang)

    const insights = await compareResults(enResults, jaResults, deResults)

    chrome.tabs.sendMessage(tabId, {
      type: 'SEARCH_RESULTS',
      data: {
        query,
        detectedLang,
        translations,
        results: aggregated,
        summary,
        insights
      }
    })

  } catch (error) {
    chrome.tabs.sendMessage(tabId, {
      type: 'SEARCH_ERROR',
      error: error.message
    })
  }
}