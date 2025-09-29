const { ref } = Vue

const API_BASE_URL = 'https://schooldb.skillline.ru/api'

/**
 * Базовый HTTP-клиент для работы с API школ
 * Обрабатывает ошибки и преобразует ответы в единый формат
 */
async function apiRequest(endpoint, params = {}) {
  try {
    // Формируем URL с параметрами запроса
    const queryParams = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`

    console.log('🔄 API Request:', url) // Логируем для отладки

    const response = await fetch(url)

    // Проверяем HTTP статус ответа
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // API возвращает {status: boolean, message: string, data: any}
    // Проверяем успешность операции на стороне сервера
    if (!data.status) {
      throw new Error(data.message || 'API returned false status')
    }

    return data.data // Возвращаем только data часть ответа
  } catch (error) {
    console.error('❌ API Request failed:', error)
    throw error // Пробрасываем ошибку выше для обработки в компонентах
  }
}

/**
 * Получает список школ с пагинацией и фильтрацией
 * @param {number} page - Номер страницы (начинается с 1)
 * @param {number} count - Количество элементов на странице
 * @param {number} regionId - ID региона для фильтрации
 * @param {string} status - Статус для фильтрации (active/inactive)
 * @returns {Promise} Данные школ с метаинформацией о пагинации
 */
export async function getSchools(page = 1, count = 10, regionId = null, status = null) {
  const params = { page, count }
  if (regionId) {
    params.region_id = regionId
  }
  if (status && status !== 'all') {
    params.status = status
  }
  // УБИРАЕМ search - API его не поддерживает
  return await apiRequest('/schools', params)
}

/**
 * Получает список всех регионов для фильтрации
 * @returns {Promise} Массив регионов {id, name}
 */
export async function getRegions() {
  return await apiRequest('/regions')
}

/**
 * Получает список федеральных округов
 * @returns {Promise} Массив федеральных округов
 */
export async function getFederalDistricts() {
  return await apiRequest('/federalDistricts')
}

/**
 * Composition API хук для работы со школами
 * Предоставляет реактивные данные и методы для управления состоянием
 */
export function useSchools() {
  const schools = ref([]) // текущая страница
  const searchSchools = ref([]) // ← ОТДЕЛЬНЫЙ МАССИВ ТОЛЬКО ДЛЯ ПОИСКА
  const loading = ref(false)
  const error = ref(null)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const currentRegion = ref(null)

  const transformSchoolData = (schoolsData) => {
    return schoolsData.map((school) => ({
      uuid: school.uuid,
      name: school.edu_org?.full_name || 'Нет названия',
      region: school.edu_org?.region?.name || 'Не указан',
      address: school.edu_org?.contact_info?.post_address || 'Адрес не указан',
      education_level:
        school.supplements?.[0]?.educational_programs?.[0]?.edu_level?.name || 'Не указан',
      status: school.supplements?.[0]?.status?.name || 'Неизвестно',
    }))
  }

  const fetchSchools = async (page = 1, count = 10, regionId = null, isAppend = false) => {
    if (!isAppend && page === 1) {
      schools.value = []
    }

    loading.value = true
    error.value = null
    currentRegion.value = regionId

    try {
      const safePage = Math.max(1, Math.min(page, 100))
      const response = await getSchools(safePage, count, regionId)

      const newSchools = transformSchoolData(response.list || [])

      if (isAppend) {
        schools.value = [...schools.value, ...newSchools]
        searchSchools.value = [...searchSchools.value, ...newSchools]
      } else {
        schools.value = newSchools
        if (page === 1) {
          searchSchools.value = newSchools
        } else {
          searchSchools.value = [...searchSchools.value, ...newSchools]
        }
      }

      totalPages.value = Math.min(response.pages_count || 1, 100)
      currentPage.value = safePage

      console.log(
        `✅ Страница ${safePage} загружена. Для поиска: ${searchSchools.value.length} школ`
      )
    } catch (err) {
      console.log(`Ошибка загрузки страницы ${page}:`, err.message)
      error.value = `Страница ${page} временно недоступна. Попробуйте другую страницу.`
      if (!isAppend && page === 1) {
        schools.value = []
      }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    schools,
    searchSchools,
    loading,
    error,
    totalPages,
    currentPage,
    currentRegion,
    fetchSchools,
    clearError,
  }
}
