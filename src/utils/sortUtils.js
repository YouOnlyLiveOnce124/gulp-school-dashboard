function sortSchools(schools, sortBy, sortDirection) {
  if (!sortBy || !sortDirection) {
    return schools
  }

  const sortedSchools = [...schools]

  sortedSchools.sort((a, b) => {
    const valueA = a[sortBy] || ''
    const valueB = b[sortBy] || ''

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB, 'ru')
        : valueB.localeCompare(valueA, 'ru')
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  return sortedSchools
}

function getNextSortDirection(currentSortBy, newSortBy, currentDirection) {
  if (currentSortBy !== newSortBy) {
    return 'asc'
  }

  if (currentDirection === 'asc') return 'desc'
  if (currentDirection === 'desc') return ''
  return 'asc'
}

window.sortSchools = sortSchools
window.getNextSortDirection = getNextSortDirection
