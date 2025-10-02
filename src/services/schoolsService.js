async function handlePageChange(
  page,
  fetchCallback,
  searchValue,
  selectedStatus,
  currentRegion,
  selectedPageSize
) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    return page
  } else {
    if (fetchCallback) {
      await fetchCallback(page, selectedPageSize, currentRegion, false)
    }
    return page
  }
}

function handlePageSizeChange(newSize, fetchCallback, currentRegion) {
  if (fetchCallback) {
    fetchCallback(1, newSize, currentRegion, false)
  }
}

async function handleRetry(fetchCallback, page, pageSize, currentRegion) {
  if (fetchCallback) {
    await fetchCallback(page, pageSize, currentRegion, false)
  }
}

async function handleFirstPage(fetchCallback, pageSize, currentRegion) {
  if (fetchCallback) {
    await fetchCallback(1, pageSize, currentRegion, false)
  }
}
