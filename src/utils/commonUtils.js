/**
 * Общие утилиты
 */

// Валидация типа школы
function validateSchoolType(newType) {
  if (newType !== 'all') {
    alert('Фильтрация по видам учреждений временно недоступна. API не поддерживает этот параметр.')
    return 'all'
  }
  return newType
}

// Очистка ошибки
function clearError() {
  return null
}
