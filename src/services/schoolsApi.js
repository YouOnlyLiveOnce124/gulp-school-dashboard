const API_BASE_URL = 'https://schooldb.skillline.ru/api'

/**
 * Базовый HTTP-клиент для работы с API школ
 */
async function apiRequest(endpoint, params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`

    console.log('🔄 API Request:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.status) {
      throw new Error(data.message || 'API returned false status')
    }

    return data.data
  } catch (error) {
    console.error('❌ API Request failed:', error)
    throw error
  }
}

/**
 * Получает список школ с пагинацией и фильтрацией
 */
async function getSchools(page = 1, count = 10, regionId = null, status = null) {
  const params = { page, count }
  if (regionId) params.region_id = regionId
  if (status && status !== 'all') params.status = status
  return await apiRequest('/schools', params)
}

/**
 * Получает список всех регионов для фильтрации
 */
async function getRegions() {
  return await apiRequest('/regions')
}

/**
 * Получает список федеральных округов
 */
async function getFederalDistricts() {
  return await apiRequest('/federalDistricts')
}

/**
 * Трансформирует данные школы в нужный формат
 */
function transformSchoolData(schoolsData) {
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
