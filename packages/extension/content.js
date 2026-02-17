function getQueryFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get('q') || ''
}

const query = getQueryFromURL()

let lastQuery = getQueryFromURL()

const observer = new MutationObserver(() => {
  const currentQuery = getQueryFromURL()
  if (currentQuery !== lastQuery && currentQuery) {
    lastQuery = currentQuery
    handleNewSearch(currentQuery)
  }
})

observer.observe(document.body, { childList: true, subtree: true })

function handleNewSearch(query) {
  showSpinner()
  chrome.runtime.sendMessage({
    type: 'NEW_SEARCH',
    query: query
  })
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SEARCH_RESULTS') {
    hideSpinner()
    renderSidebar(message.data)
  }

  if (message.type === 'SEARCH_ERROR') {
    hideSpinner()
    showErrorState(message.error)
  }
})

function makeRoomForSidebar() {
  const mainContent = document.querySelector('#center_col')
  if (mainContent) {
    mainContent.style.marginRight = '380px'
    mainContent.style.transition = 'margin-right 0.3s ease'
  }
}