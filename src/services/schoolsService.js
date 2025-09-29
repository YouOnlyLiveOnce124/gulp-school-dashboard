/**
 * Сервис для работы со школами (API + состояние)
 */

// Обработчик смены страницы
async function handlePageChange(
  page,
  fetchCallback,
  searchValue,
  selectedStatus,
  currentRegion,
  selectedPageSize
) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    // Для фильтрованных данных просто меняем страницу
    return page
  } else {
    // Для нефільтрованных данных загружаем с API
    if (fetchCallback) {
      await fetchCallback(page, selectedPageSize, currentRegion, false)
    }
    return page
  }
}

// Обработчик смены размера страницы
function handlePageSizeChange(newSize, fetchCallback, currentRegion) {
  if (fetchCallback) {
    fetchCallback(1, newSize, currentRegion, false)
  }
}

// Обработчик повторной попытки загрузки
async function handleRetry(fetchCallback, page, pageSize, currentRegion) {
  if (fetchCallback) {
    await fetchCallback(page, pageSize, currentRegion, false)
  }
}

// Обработчик первой страницы
async function handleFirstPage(fetchCallback, pageSize, currentRegion) {
  if (fetchCallback) {
    await fetchCallback(1, pageSize, currentRegion, false)
  }
}
