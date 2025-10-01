/**
 * Утилиты для сортировки таблицы
 */

// Основная функция сортировки
function sortSchools(schools, sortBy, sortDirection) {
  if (!sortBy || !sortDirection) {
    return schools // Возвращаем как есть если нет сортировки
  }

  // Создаем копию массива чтобы не мутировать оригинал
  const sortedSchools = [...schools]

  sortedSchools.sort((a, b) => {
    const valueA = a[sortBy] || ''
    const valueB = b[sortBy] || ''

    // Для строк используем localeCompare
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB, 'ru')
        : valueB.localeCompare(valueA, 'ru')
    }

    // Для чисел и других типов
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  return sortedSchools
}

// Функция для определения следующего направления сортировки
function getNextSortDirection(currentSortBy, newSortBy, currentDirection) {
  // Если кликнули на другую колонку - начинаем с возрастания
  if (currentSortBy !== newSortBy) {
    return 'asc'
  }

  // Цикл: asc -> desc -> сброс
  if (currentDirection === 'asc') return 'desc'
  if (currentDirection === 'desc') return ''
  return 'asc'
}

// Делаем функции доступными глобально
window.sortSchools = sortSchools
window.getNextSortDirection = getNextSortDirection

console.log('✅ sortUtils.js загружен')
