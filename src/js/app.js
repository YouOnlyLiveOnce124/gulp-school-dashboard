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
      const validatedType = window.validateSchoolType(newType)
      if (validatedType !== newType) {
        this.selectedType = validatedType
      }
    },
  },

  methods: {
    // API методы

    async fetchSchools(page = 1, count = 10, regionId = null, isAppend = false) {
      if (!isAppend && page === 1) {
        this.schools = []
      }

      this.loading = true
      this.error = null
      this.currentRegion = regionId

      try {
        const safePage = Math.max(1, Math.min(page, 100))
        // ИСПОЛЬЗУЕМ schoolsApi.js вместо дублирования
        const response = await window.getSchools(safePage, count, regionId)

        // ИСПОЛЬЗУЕМ schoolsApi.js вместо дублирования
        const newSchools = window.transformSchoolData(response.list || [])

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
      this.error = window.clearError()
    },

    // Обработчики UI
    handlePageSizeChange(newSize) {
      window.handlePageSizeChange(newSize, this.fetchSchools, this.currentRegion)
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
      await window.handlePageChange(
        page,
        this.fetchSchools,
        this.searchValue,
        this.selectedStatus,
        this.currentRegion,
        this.selectedPageSize
      )
    },

    async handleFirstPage() {
      this.clearError()
      await window.handleFirstPage(this.fetchSchools, this.selectedPageSize, this.currentRegion)
    },

    handleSearch() {
      window.handleSearch(this.searchValue, () => {
        this.filteredCurrentPage = 1
      })
    },

    async handleRetry() {
      this.clearError()
      await window.handleRetry(
        this.fetchSchools,
        this.currentPage,
        this.selectedPageSize,
        this.currentRegion
      )
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
      // ИСПОЛЬЗУЕМ schoolsApi.js вместо дублирования
      this.regions = await window.getRegions()
      console.log('✅ Регионы загружены:', this.regions.length, 'шт.')
    },

    async init() {
      await window.initApp(this.fetchSchools, this.loadRegions, this.selectedPageSize)
    },
  },

  mounted() {
    this.init()
  },

  template: `
  <div id="app">
  <!-- ВЕРХНЯЯ ЧЕРНАЯ ШАПКА -->
<header class="tech-header-group-1">
  <div class="tech-header">
    <div class="header-container">
      <div class="header-left">
        <img src="images/logo.png" alt="Логотип" class="logo">
      </div>
       <div class="header-right">
        <div class="logo-dark">School</div> <!-- ← CSS надпись -->
        <div class="contacts-block">
          <div>+7 (495) 123-45-67</div> <!-- ← Заглушка номер -->
          <div>info@schools-edu.ru</div> <!-- ← Заглушка email -->
          <div>schools-education.com</div> <!-- ← Заглушка сайт -->
        </div>
      </div>
    </div>
  </div>

  <div class="tech-head-container">
    <div class="tech-head-2xl">Тестовое задание</div>
  </div>
</header>

  <main class="main-content">
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
  </main>
</div>
  `,
}

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
}
