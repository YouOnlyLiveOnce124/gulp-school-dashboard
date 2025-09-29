console.log('🎯 App.js загружен!')

const App = {
  name: 'App',

  data() {
    return {
      // Данные из useSchools()
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
      if (!this.selectedDateRange || !this.selectedDateRange.start || !this.selectedDateRange.end) {
        return 'Выберите период'
      }

      const start = new Date(this.selectedDateRange.start + 'T00:00:00')
      const end = new Date(this.selectedDateRange.end + 'T00:00:00')

      const format = (date) => {
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}.${month}.${year}`
      }

      return `${format(start)} - ${format(end)}`
    },

    isIndeterminate() {
      if (this.displayedSchools.length === 0) return false
      const selectedOnCurrentPage = this.displayedSchools.filter((school) =>
        this.selectedSchools.includes(school.uuid)
      ).length
      return selectedOnCurrentPage > 0 && selectedOnCurrentPage < this.displayedSchools.length
    },

    filteredSchools() {
      const sourceArray = this.searchValue.trim() !== '' ? this.searchSchools : this.schools
      let filtered = sourceArray

      // Фильтрация по статусу
      if (this.selectedStatus !== 'all') {
        filtered = filtered.filter((school) => {
          const schoolStatus = school.status || 'Нет статуса'
          if (this.selectedStatus === 'active') {
            return schoolStatus === 'Действующее'
          } else if (this.selectedStatus === 'inactive') {
            return schoolStatus === 'Недействующее'
          }
          return false
        })
      }

      // Фильтрация по поиску
      if (this.searchValue.trim() !== '') {
        const searchTerm = this.searchValue.toLowerCase().trim()
        filtered = filtered.filter((school) => {
          return school.name.toLowerCase().includes(searchTerm)
        })
        console.log('🔍 Найдено школ:', filtered.length, 'из', this.searchSchools.length)
      }

      return filtered
    },

    displayedSchools() {
      if (this.searchValue.trim() !== '' || this.selectedStatus !== 'all') {
        const startIndex = (this.filteredCurrentPage - 1) * this.selectedPageSize
        const endIndex = startIndex + this.selectedPageSize
        return this.filteredSchools.slice(startIndex, endIndex)
      } else {
        return this.schools
      }
    },

    filteredTotalPages() {
      if (this.searchValue.trim() !== '' || this.selectedStatus !== 'all') {
        return Math.ceil(this.filteredSchools.length / this.selectedPageSize)
      } else {
        return this.totalPages
      }
    },

    currentDisplayPage() {
      if (this.searchValue.trim() !== '' || this.selectedStatus !== 'all') {
        return this.filteredCurrentPage
      } else {
        return this.currentPage
      }
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
    async fetchSchools(page = 1, count = 10, regionId = null, isAppend = false) {
      if (!isAppend && page === 1) {
        this.schools = []
      }

      this.loading = true
      this.error = null
      this.currentRegion = regionId

      try {
        const safePage = Math.max(1, Math.min(page, 100))
        const response = await window.getSchools(safePage, count, regionId)

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
      if (isSelected) {
        const currentPageIds = this.displayedSchools.map((school) => school.uuid)
        this.selectedSchools = [...new Set([...this.selectedSchools, ...currentPageIds])]
      } else {
        const currentPageIds = this.displayedSchools.map((school) => school.uuid)
        this.selectedSchools = this.selectedSchools.filter((id) => !currentPageIds.includes(id))
      }
    },

    handleSelectSchool(schoolId, isSelected) {
      if (isSelected) {
        if (!this.selectedSchools.includes(schoolId)) {
          this.selectedSchools.push(schoolId)
        }
      } else {
        const index = this.selectedSchools.indexOf(schoolId)
        if (index > -1) {
          this.selectedSchools.splice(index, 1)
        }
      }
    },

    handleExport() {
      if (this.selectedSchools.length === 0) return

      const selectedData = this.schools.filter((school) =>
        this.selectedSchools.includes(school.uuid)
      )

      let textContent = 'Экспорт школ\n\n'
      selectedData.forEach((school) => {
        textContent += `Название: ${school.name}\n`
        textContent += `Регион: ${school.region}\n`
        textContent += `Адрес: ${school.address}\n`
        textContent += `Уровень образования: ${school.education_level}\n`
        textContent += '─'.repeat(50) + '\n'
      })

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `schools_export.txt`
      link.click()

      alert(`✅ Экспортировано ${selectedData.length} школ в TXT файл`)
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
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.filteredCurrentPage = 1
        console.log('🔍 Поиск:', this.searchValue)
      }, 300)
    },

    async handleRetry() {
      this.clearError()
      await this.fetchSchools(this.currentPage, this.selectedPageSize, this.currentRegion, false)
    },

    clearSearch() {
      this.searchValue = ''
    },

    applyDateRange(range) {
      this.showCalendar = false
      this.selectedDateRange = range
      console.log('Выбран диапазон:', range.start, 'до', range.end)
    },

    async loadRegions() {
      try {
        this.regions = await window.getRegions()
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

console.log('✅ App компонент создан!')
