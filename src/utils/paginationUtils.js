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
    const startIndex = (filteredCurrentPage - 1) * selectedPageSize
    const endIndex = startIndex + selectedPageSize
    return schools.slice(startIndex, endIndex)
  }
}

function getTotalPages(filteredSchools, totalPages, searchValue, selectedStatus, selectedPageSize) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    return Math.ceil(filteredSchools.length / selectedPageSize)
  } else {
    return totalPages
  }
}

function getCurrentPage(filteredCurrentPage, currentPage, searchValue, selectedStatus) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    return filteredCurrentPage
  } else {
    return currentPage
  }
}
