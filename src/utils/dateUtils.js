function formatDateRange(selectedDateRange) {
  if (!selectedDateRange || !selectedDateRange.start || !selectedDateRange.end) {
    return 'Выберите период'
  }

  const start = new Date(selectedDateRange.start + 'T00:00:00')
  const end = new Date(selectedDateRange.end + 'T00:00:00')

  const format = (date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  return `${format(start)} - ${format(end)}`
}

function applyDateRange(range, callback) {
  if (callback) callback(range)
  console.log('📅 Выбран диапазон:', range.start, 'до', range.end)
}
