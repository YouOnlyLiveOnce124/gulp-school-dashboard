console.log('🎯 app.js загрузка началась!')

// ========== APP КОМПОНЕНТ ==========
const App = {
  name: 'App',

  data() {
    return {
      // Данные школ
      schools: [],
      searchSchools: [],
      loading: false,
      error: null,
      totalPages: 1,
      currentPage: 1,
      currentRegion: null,

      // Поиск и фильтры
      searchValue: '',
      searchTimeout: null,
      errorPage: 1,
      regions: [],
      selectedRegion: '',
      filteredCurrentPage: 1,

      // Фильтры
      schoolTypes: [
        { value: 'all', label: 'Все виды' },
        { value: 'school', label: 'Школы' },
        { value: 'college', label: 'Колледжи' },
        { value: 'university', label: 'Университеты' },
      ],
      statusTypes: [
        { value: 'all', label: 'Все статусы' },
        { value: 'active', label: 'Активные' },
        { value: 'inactive', label: 'Неактивные' },
      ],
      selectedType: 'all',
      selectedStatus: 'all',

      // Пагинация
      pageSizes: [10, 25, 50],
      selectedPageSize: 10,

      // Календарь
      showCalendar: false,
      selectedDateRange: null,

      // Выбор школ
      selectedSchools: [],

      // Колонки таблицы
      tableColumns: [
        { key: 'name', label: 'Название', sortable: true },
        { key: 'region', label: 'Регион', sortable: true },
        { key: 'address', label: 'Адрес', sortable: false },
        { key: 'education_level', label: 'Уровень образования', sortable: true },
      ],
    }
  },

  computed: {
    dateRange() {
      return window.formatDateRange(this.selectedDateRange)
    },

    isIndeterminate() {
      if (this.displayedSchools.length === 0) return false
      const selectedOnCurrentPage = this.displayedSchools.filter((school) =>
        this.selectedSchools.includes(school.uuid)
      ).length
      return selectedOnCurrentPage > 0 && selectedOnCurrentPage < this.displayedSchools.length
    },

    filteredSchools() {
      return window.filterSchools(
        this.schools,
        this.searchSchools,
        this.searchValue,
        this.selectedStatus
      )
    },

    displayedSchools() {
      return window.getDisplayedSchools(
        this.filteredSchools,
        this.schools,
        this.searchValue,
        this.selectedStatus,
        this.filteredCurrentPage,
        this.selectedPageSize
      )
    },

    filteredTotalPages() {
      return window.getTotalPages(
        this.filteredSchools,
        this.totalPages,
        this.searchValue,
        this.selectedStatus,
        this.selectedPageSize
      )
    },

    currentDisplayPage() {
      return window.getCurrentPage(
        this.filteredCurrentPage,
        this.currentPage,
        this.searchValue,
        this.selectedStatus
      )
    },
  },

  watch: {
    selectedRegion(newRegionId) {
      this.currentPage = 1
      this.filteredCurrentPage = 1
      this.searchValue = ''
      const finalRegionId = newRegionId === '' ? null : newRegionId
      this.fetchSchools(1, this.selectedPageSize, finalRegionId, false)
    },

    selectedStatus(newStatus, oldStatus) {
      this.filteredCurrentPage = 1
      if (newStatus === 'all' && oldStatus !== 'all') {
        console.log('🔄 Возврат к "Все статусы"')
        this.currentPage = 1
        this.fetchSchools(1, this.selectedPageSize, this.currentRegion, false)
      }
    },

    selectedType(newType) {
      if (newType !== 'all') {
        alert(
          'Фильтрация по видам учреждений временно недоступна. API не поддерживает этот параметр.'
        )
        this.selectedType = 'all'
      }
    },
  },

  methods: {
    // API методы
    async apiRequest(endpoint, params = {}) {
      const API_BASE_URL = 'https://schooldb.skillline.ru/api'
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
    },

    async getSchools(page = 1, count = 10, regionId = null, status = null) {
      const params = { page, count }
      if (regionId) params.region_id = regionId
      if (status && status !== 'all') params.status = status
      return await this.apiRequest('/schools', params)
    },

    async getRegions() {
      return await this.apiRequest('/regions')
    },

    transformSchoolData(schoolsData) {
      return schoolsData.map((school) => ({
        uuid: school.uuid,
        name: school.edu_org?.full_name || 'Нет названия',
        region: school.edu_org?.region?.name || 'Не указан',
        address: school.edu_org?.contact_info?.post_address || 'Адрес не указан',
        education_level:
          school.supplements?.[0]?.educational_programs?.[0]?.edu_level?.name || 'Не указан',
        status: school.supplements?.[0]?.status?.name || 'Неизвестно',
      }))
    },

    async fetchSchools(page = 1, count = 10, regionId = null, isAppend = false) {
      if (!isAppend && page === 1) {
        this.schools = []
      }

      this.loading = true
      this.error = null
      this.currentRegion = regionId

      try {
        const safePage = Math.max(1, Math.min(page, 100))
        const response = await this.getSchools(safePage, count, regionId)

        const newSchools = this.transformSchoolData(response.list || [])

        if (isAppend) {
          this.schools = [...this.schools, ...newSchools]
          this.searchSchools = [...this.searchSchools, ...newSchools]
        } else {
          this.schools = newSchools
          if (page === 1) {
            this.searchSchools = newSchools
          } else {
            this.searchSchools = [...this.searchSchools, ...newSchools]
          }
        }

        this.totalPages = Math.min(response.pages_count || 1, 100)
        this.currentPage = safePage

        console.log(
          `✅ Страница ${safePage} загружена. Для поиска: ${this.searchSchools.length} школ`
        )
      } catch (err) {
        console.log(`Ошибка загрузки страницы ${page}:`, err.message)
        this.error = `Страница ${page} временно недоступна. Попробуйте другую страницу.`
        if (!isAppend && page === 1) {
          this.schools = []
        }
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },

    // Обработчики UI
    handlePageSizeChange(newSize) {
      this.selectedPageSize = newSize
      this.currentPage = 1
      this.fetchSchools(1, newSize, this.currentRegion, false)
    },

    handleSelectAll(isSelected) {
      this.selectedSchools = window.handleSelectAll(
        this.selectedSchools,
        this.displayedSchools,
        isSelected
      )
    },

    handleSelectSchool(schoolId, isSelected) {
      this.selectedSchools = window.handleSelectSchool(this.selectedSchools, schoolId, isSelected)
    },

    handleExport() {
      window.exportSchoolsToTxt(this.selectedSchools, this.schools)
    },

    async handlePageChange(page) {
      this.errorPage = page
      this.clearError()

      if (this.searchValue.trim() !== '' || this.selectedStatus !== 'all') {
        this.filteredCurrentPage = page
      } else {
        await this.fetchSchools(page, this.selectedPageSize, this.currentRegion, false)
      }
    },

    async handleFirstPage() {
      this.clearError()
      await this.fetchSchools(1, this.selectedPageSize, this.currentRegion, false)
    },

    handleSearch() {
      window.handleSearch(this.searchValue, () => {
        this.filteredCurrentPage = 1
      })
    },

    async handleRetry() {
      this.clearError()
      await this.fetchSchools(this.currentPage, this.selectedPageSize, this.currentRegion, false)
    },

    clearSearch() {
      window.clearSearch()
      this.searchValue = ''
      this.filteredCurrentPage = 1
    },

    applyDateRange(range) {
      window.applyDateRange(range)
      this.showCalendar = false
      this.selectedDateRange = range
    },

    async loadRegions() {
      try {
        this.regions = await this.getRegions()
        console.log('✅ Регионы загружены:', this.regions.length, 'шт.')
      } catch (error) {
        console.error('❌ Ошибка загрузки регионов:', error)
      }
    },

    async init() {
      await Promise.all([
        this.fetchSchools(1, this.selectedPageSize, null, false),
        this.loadRegions(),
      ])
    },
  },

  mounted() {
    this.init()
  },

  template: `
    <div id="app">
      <h1>Таблица учреждений</h1>

      <!-- ВЕРХНЯЯ СТРОКА ФИЛЬТРОВ -->
      <div class="top-filters">
        <div class="calendar-placeholder" @click="showCalendar = true">📅 {{ dateRange }}</div>

        <div class="filter-group">
          <BaseSelect v-model="selectedType" :options="schoolTypes" placeholder="Все виды" />
        </div>

        <div class="filter-group">
          <BaseSelect v-model="selectedStatus" :options="statusTypes" placeholder="Все статусы" />
        </div>
      </div>

      <div v-if="showCalendar" class="calendar-overlay" @click="showCalendar = false">
        <div class="calendar-container" @click.stop>
          <BaseCalendar @save="applyDateRange" @cancel="showCalendar = false" />
        </div>
      </div>

      <!-- ДЕЙСТВИЯ С ТАБЛИЦЕЙ -->
      <div class="table-actions">
        <BaseButton
          :disabled="selectedSchools.length === 0"
          @click="handleExport"
          variant="accent"
          class="download-btn"
        >
          📥 СКАЧАТЬ ({{ selectedSchools.length }})
        </BaseButton>

        <div class="records-info">
          <span class="records-text">Показывать по:</span>
          <BaseSelect
            v-model="selectedPageSize"
            :options="pageSizes.map((size) => ({ value: size, label: String(size) }))"
            @update:modelValue="handlePageSizeChange"
            class="page-size-select"
          />
        </div>
      </div>

      <!-- ФИЛЬТРЫ ПО РЕГИОНАМ -->
      <div class="filters-section">
        <div class="filter-group">
          <label class="filter-label">Регион:</label>
          <BaseSelect
            v-model="selectedRegion"
            :options="[
              { value: '', label: 'Все регионы' },
              ...regions.map((r) => ({ value: r.id, label: r.name })),
            ]"
            placeholder="Выберите регион"
          />
        </div>
      </div>

      <!-- ПОИСК -->
      <div class="search-section">
        <div class="search-with-clear">
          <BaseInput
            v-model="searchValue"
            placeholder="Поиск по названию школы..."
            @input="handleSearch"
          />
          <BaseButton
            v-if="searchValue"
            @click="clearSearch"
            variant="secondary"
            class="clear-search-btn"
          >
            ×
          </BaseButton>
        </div>
        <div v-if="searchValue.trim() !== ''" class="search-results-info">
          🔍 Найдено: <strong>{{ filteredSchools.length }}</strong> школ по запросу "{{ searchValue }}"
        </div>
      </div>

      <!-- СОДЕРЖИМОЕ -->
      <div v-if="loading" class="status-message">
        <div class="loading-spinner">Загрузка данных...</div>
      </div>

      <div v-else-if="error" class="status-message error">
        <div class="error-icon">⚠️</div>
        <h3>Временная проблема</h3>
        <p>Страница {{ errorPage }} временно недоступна</p>
        <p class="error-detail">Попробуйте выбрать другую страницу</p>

        <div class="button-group">
          <BaseButton @click="handleRetry" variant="primary">Повторить попытку</BaseButton>
          <BaseButton @click="handleFirstPage" variant="secondary">На первую страницу</BaseButton>
        </div>
      </div>

      <div v-else>
        <BaseTable
          :columns="tableColumns"
          :data="displayedSchools"
          :loading="loading"
          :selected-items="selectedSchools"
          :is-indeterminate="isIndeterminate"
          @select-all="handleSelectAll"
          @select-item="handleSelectSchool"
        />

        <BasePagination
          v-if="filteredTotalPages > 1"
          :current-page="currentDisplayPage"
          :total-pages="filteredTotalPages"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  `,
}

// ========== МОНТИРОВАНИЕ ПРИЛОЖЕНИЯ ==========
console.log('Vue доступен:', typeof Vue !== 'undefined')

// ДЕБАГ: Проверим, загрузились ли компоненты
console.log('BaseButton доступен:', typeof BaseButton !== 'undefined')
console.log('BaseInput доступен:', typeof BaseInput !== 'undefined')
console.log('BaseSelect доступен:', typeof BaseSelect !== 'undefined')
console.log('BaseTable доступен:', typeof BaseTable !== 'undefined')
console.log('BasePagination доступен:', typeof BasePagination !== 'undefined')
console.log('BaseCalendar доступен:', typeof BaseCalendar !== 'undefined')
console.log('App доступен:', typeof App !== 'undefined')

if (typeof Vue === 'undefined') {
  console.error('❌ Vue не загружен! Проверь подключение в HTML.')
} else {
  console.log('✅ Vue загружен! Создаем приложение...')

  const { createApp } = Vue

  const app = createApp(App)

  // РЕГИСТРИРУЕМ ВСЕ КОМПОНЕНТЫ
  const components = [
    ['BaseButton', BaseButton],
    ['BaseInput', BaseInput],
    ['BaseSelect', BaseSelect],
    ['BaseTable', BaseTable],
    ['BasePagination', BasePagination],
    ['BaseCalendar', BaseCalendar],
  ]

  components.forEach(([name, component]) => {
    if (typeof component !== 'undefined') {
      app.component(name, component)
      console.log(`✅ ${name} зарегистрирован!`)
    } else {
      console.error(`❌ ${name} НЕ найден!`)
    }
  })

  app.mount('#app')
  console.log('✅ Приложение смонтировано!')
}
