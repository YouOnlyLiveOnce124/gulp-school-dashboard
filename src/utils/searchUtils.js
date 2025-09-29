/**
 * Утилиты для поиска с дебаунсом
 */

let searchTimeout = null

// Поиск с задержкой (дебаунс)
function handleSearch(searchValue, callback) {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    console.log('🔍 Поиск:', searchValue)
    if (callback) callback()
  }, 300)
}

// Сброс поиска
function clearSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = null
}
