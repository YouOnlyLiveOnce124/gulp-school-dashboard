/**
 * Утилиты для фильтрации школ
 */

function filterSchools(schools, searchSchools, searchValue, selectedStatus) {
  const sourceArray = searchValue.trim() !== '' ? searchSchools : schools
  let filtered = sourceArray

  // Фильтрация по статусу
  if (selectedStatus !== 'all') {
    filtered = filtered.filter((school) => {
      const schoolStatus = school.status || 'Нет статуса'
      if (selectedStatus === 'active') {
        return schoolStatus === 'Действующее'
      } else if (selectedStatus === 'inactive') {
        return schoolStatus === 'Недействующее'
      }
      return false
    })
  }

  // Фильтрация по поиску
  if (searchValue.trim() !== '') {
    const searchTerm = searchValue.toLowerCase().trim()
    filtered = filtered.filter((school) => {
      return school.name.toLowerCase().includes(searchTerm)
    })
    console.log('🔍 Найдено школ:', filtered.length, 'из', searchSchools.length)
  }

  return filtered
}

console.log('✅ filterUtils загружен!')
