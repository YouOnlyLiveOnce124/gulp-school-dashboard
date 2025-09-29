/**
 * Утилиты для пагинации
 */

// getDisplayedSchools - возвращает школы для текущей страницы (слайсит массив)
function getDisplayedSchools(
  filteredSchools,
  schools,
  searchValue,
  selectedStatus,
  filteredCurrentPage,
  selectedPageSize
) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    const startIndex = (filteredCurrentPage - 1) * selectedPageSize
    const endIndex = startIndex + selectedPageSize
    return filteredSchools.slice(startIndex, endIndex)
  } else {
    return schools
  }
}

// getTotalPages - вычисляет общее количество страниц для пагинатора
function getTotalPages(filteredSchools, totalPages, searchValue, selectedStatus, selectedPageSize) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    return Math.ceil(filteredSchools.length / selectedPageSize)
  } else {
    return totalPages
  }
}

// getCurrentPage - определяет какую страницу показывать в пагинаторе
function getCurrentPage(filteredCurrentPage, currentPage, searchValue, selectedStatus) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    return filteredCurrentPage
  } else {
    return currentPage
  }
}
