let searchTimeout = null

function handleSearch(searchValue, callback) {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    console.log('🔍 Поиск:', searchValue)
    if (callback) callback()
  }, 300)
}

function clearSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = null
}
