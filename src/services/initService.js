async function initApp(fetchSchools, loadRegions, pageSize) {
  await Promise.all([fetchSchools(1, pageSize, null, false), loadRegions()])
}

// Загрузка регионов
async function loadRegionsData(getRegionsCallback) {
  try {
    const regions = await getRegionsCallback()
    console.log('Регионы загружены:', regions.length, 'шт.')
    return regions
  } catch (error) {
    console.error('Ошибка загрузки регионов:', error)
    return []
  }
}

console.log('initService загружен!')
