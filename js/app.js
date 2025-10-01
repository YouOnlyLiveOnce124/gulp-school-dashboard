/**
 * Сервис инициализации приложения
 */

// Основная инициализация приложения
async function initApp(fetchSchools, loadRegions, pageSize) {
  await Promise.all([fetchSchools(1, pageSize, null, false), loadRegions()])
}

// Загрузка регионов
async function loadRegionsData(getRegionsCallback) {
  try {
    const regions = await getRegionsCallback()
    console.log('✅ Регионы загружены:', regions.length, 'шт.')
    return regions
  } catch (error) {
    console.error('❌ Ошибка загрузки регионов:', error)
    return []
  }
}

console.log('✅ initService загружен!')

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

/**
 * Сервис для работы со школами (API + состояние)
 */

// Обработчик смены страницы
async function handlePageChange(
  page,
  fetchCallback,
  searchValue,
  selectedStatus,
  currentRegion,
  selectedPageSize
) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    // Для фильтрованных данных просто меняем страницу
    return page
  } else {
    // Для нефільтрованных данных загружаем с API
    if (fetchCallback) {
      await fetchCallback(page, selectedPageSize, currentRegion, false)
    }
    return page
  }
}

// Обработчик смены размера страницы
function handlePageSizeChange(newSize, fetchCallback, currentRegion) {
  if (fetchCallback) {
    fetchCallback(1, newSize, currentRegion, false)
  }
}

// Обработчик повторной попытки загрузки
async function handleRetry(fetchCallback, page, pageSize, currentRegion) {
  if (fetchCallback) {
    await fetchCallback(page, pageSize, currentRegion, false)
  }
}

// Обработчик первой страницы
async function handleFirstPage(fetchCallback, pageSize, currentRegion) {
  if (fetchCallback) {
    await fetchCallback(1, pageSize, currentRegion, false)
  }
}

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

/**
 * Форматирует диапазон дат для отображения
 */
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

/**
 * Применяет выбранный диапазон дат
 */
function applyDateRange(range, callback) {
  if (callback) callback(range)
  console.log('📅 Выбран диапазон:', range.start, 'до', range.end)
}

/**
 * Утилита для экспорта данных в TXT
 */
function exportSchoolsToTxt(selectedSchools, allSchools) {
  if (selectedSchools.length === 0) {
    alert('❌ Не выбрано ни одной школы для экспорта')
    return
  }

  const selectedData = allSchools.filter((school) => selectedSchools.includes(school.uuid))

  let textContent = 'Экспорт школ\n\n'
  selectedData.forEach((school, index) => {
    textContent += `${index + 1}. ${school.name}\n`
    textContent += `   Регион: ${school.region}\n`
    textContent += `   Адрес: ${school.address}\n`
    textContent += `   Уровень образования: ${school.education_level}\n`
    textContent += `   Статус: ${school.status}\n`
    textContent += '─'.repeat(50) + '\n'
  })

  textContent += `\nВсего экспортировано: ${selectedData.length} школ`

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `schools_export_${new Date().toISOString().split('T')[0]}.txt`
  link.click()

  alert(`✅ Экспортировано ${selectedData.length} школ в TXT файл`)
}

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

/**
 * Утилиты для пагинации
 */

// getDisplayedSchools - возвращает школы для текущей страницы (слайсит массив)
function getDisplayedSchools(
  filteredSchools,
  schools,
  searchValue,
  selectedStatus,
  filteredCurrentPage,
  selectedPageSize
) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    // При поиске/фильтрации используем filteredSchools
    const startIndex = (filteredCurrentPage - 1) * selectedPageSize
    const endIndex = startIndex + selectedPageSize
    return filteredSchools.slice(startIndex, endIndex)
  } else {
    // БЕЗ поиска/фильтрации тоже слайсим schools для текущей страницы
    const startIndex = (filteredCurrentPage - 1) * selectedPageSize
    const endIndex = startIndex + selectedPageSize
    return schools.slice(startIndex, endIndex)
  }
}

// getTotalPages - вычисляет общее количество страниц для пагинатора
function getTotalPages(filteredSchools, totalPages, searchValue, selectedStatus, selectedPageSize) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    return Math.ceil(filteredSchools.length / selectedPageSize)
  } else {
    return totalPages
  }
}

// getCurrentPage - определяет какую страницу показывать в пагинаторе
function getCurrentPage(filteredCurrentPage, currentPage, searchValue, selectedStatus) {
  if (searchValue.trim() !== '' || selectedStatus !== 'all') {
    return filteredCurrentPage
  } else {
    return currentPage
  }
}

/**
 * Утилиты для поиска с дебаунсом
 */

let searchTimeout = null

// Поиск с задержкой (дебаунс)
function handleSearch(searchValue, callback) {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    console.log('🔍 Поиск:', searchValue)
    if (callback) callback()
  }, 300)
}

// Сброс поиска
function clearSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = null
}

/**
 * Утилиты для выбора школ (чекбоксы)
 */

// Выбрать/снять все школы на текущей странице
function handleSelectAll(selectedSchools, displayedSchools, isSelected) {
  if (isSelected) {
    const currentPageIds = displayedSchools.map((school) => school.uuid)
    return [...new Set([...selectedSchools, ...currentPageIds])]
  } else {
    const currentPageIds = displayedSchools.map((school) => school.uuid)
    return selectedSchools.filter((id) => !currentPageIds.includes(id))
  }
}

// Выбрать/снять конкретную школу
function handleSelectSchool(selectedSchools, schoolId, isSelected) {
  if (isSelected) {
    if (!selectedSchools.includes(schoolId)) {
      return [...selectedSchools, schoolId]
    }
  } else {
    return selectedSchools.filter((id) => id !== schoolId)
  }
  return selectedSchools
}

/**
 * Утилиты для сортировки таблицы
 */

// Основная функция сортировки
function sortSchools(schools, sortBy, sortDirection) {
  if (!sortBy || !sortDirection) {
    return schools // Возвращаем как есть если нет сортировки
  }

  // Создаем копию массива чтобы не мутировать оригинал
  const sortedSchools = [...schools]

  sortedSchools.sort((a, b) => {
    const valueA = a[sortBy] || ''
    const valueB = b[sortBy] || ''

    // Для строк используем localeCompare
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB, 'ru')
        : valueB.localeCompare(valueA, 'ru')
    }

    // Для чисел и других типов
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  return sortedSchools
}

// Функция для определения следующего направления сортировки
function getNextSortDirection(currentSortBy, newSortBy, currentDirection) {
  // Если кликнули на другую колонку - начинаем с возрастания
  if (currentSortBy !== newSortBy) {
    return 'asc'
  }

  // Цикл: asc -> desc -> сброс
  if (currentDirection === 'asc') return 'desc'
  if (currentDirection === 'desc') return ''
  return 'asc'
}

// Делаем функции доступными глобально
window.sortSchools = sortSchools
window.getNextSortDirection = getNextSortDirection

console.log('✅ sortUtils.js загружен')

const BaseButton = {
  name: 'BaseButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'accent'].includes(value),
    },
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
  template: `
    <button :class="['base-button', 'base-button--' + variant, { 'base-button--disabled': disabled }]"
            :disabled="disabled"
            @click="$emit('click')">
      <slot></slot>
    </button>
  `,
}

const BaseCalendar = {
  name: 'BaseCalendar',

  emits: ['save', 'cancel'],

  data() {
    const today = new Date()
    return {
      today: today,
      currentMonthIndex: today.getMonth(),
      currentYear: today.getFullYear(),
      selectedRange: {
        start: null,
        end: null,
      },
    }
  },

  computed: {
    currentMonthName() {
      const months = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
      ]
      return `${months[this.currentMonthIndex]} ${this.currentYear}`
    },

    calendarDays() {
      const days = []
      const firstDay = new Date(this.currentYear, this.currentMonthIndex, 1)
      const lastDay = new Date(this.currentYear, this.currentMonthIndex + 1, 0)

      // Дни предыдущего месяца
      const prevMonthLastDay = new Date(this.currentYear, this.currentMonthIndex, 0).getDate()
      const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayNumber = prevMonthLastDay - i
        days.push({
          day: dayNumber,
          date: this.formatDateToLocal(this.currentYear, this.currentMonthIndex - 1, dayNumber),
          isCurrentMonth: false,
          isDisabled: this.isDateDisabled(this.currentYear, this.currentMonthIndex - 1, dayNumber),
        })
      }

      // Дни текущего месяца
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
          day: i,
          date: this.formatDateToLocal(this.currentYear, this.currentMonthIndex, i),
          isCurrentMonth: true,
          isDisabled: this.isDateDisabled(this.currentYear, this.currentMonthIndex, i),
        })
      }

      // Дни следующего месяца
      const totalCells = 42
      const nextMonthDays = totalCells - days.length
      for (let i = 1; i <= nextMonthDays; i++) {
        days.push({
          day: i,
          date: this.formatDateToLocal(this.currentYear, this.currentMonthIndex + 1, i),
          isCurrentMonth: false,
          isDisabled: this.isDateDisabled(this.currentYear, this.currentMonthIndex + 1, i),
        })
      }

      return days
    },
  },

  methods: {
    formatDateToLocal(year, month, day) {
      const date = new Date(year, month, day)
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    },

    // НОВЫЙ МЕТОД: проверка disabled даты
    isDateDisabled(year, month, day) {
      const date = new Date(year, month, day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Отключаем только даты ПОСЛЕ сегодня (завтра и дальше)
      // Сегодня и все прошлые даты - доступны
      return date > today
    },

    canSelectDate(date) {
      const dateObj = new Date(date)
      const today = new Date()

      // Сравниваем только даты (без времени)
      const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      // Разрешаем все даты ДО сегодня включительно
      return dateOnly <= todayOnly
    },

    prevMonth() {
      if (this.currentMonthIndex === 0) {
        this.currentMonthIndex = 11
        this.currentYear--
      } else {
        this.currentMonthIndex--
      }
    },

    nextMonth() {
      if (this.currentMonthIndex === 11) {
        this.currentMonthIndex = 0
        this.currentYear++
      } else {
        this.currentMonthIndex++
      }
    },

    isSelected(date) {
      if (!this.selectedRange.start || !this.selectedRange.end) return false
      return date === this.selectedRange.start || date === this.selectedRange.end
    },

    isInRange(date) {
      if (!this.selectedRange.start || !this.selectedRange.end) return false

      // Преобразуем в timestamp для правильного сравнения
      const dateTs = new Date(date).getTime()
      const startTs = new Date(this.selectedRange.start).getTime()
      const endTs = new Date(this.selectedRange.end).getTime()

      return dateTs > startTs && dateTs < endTs
    },

    isFirstInRange(date) {
      if (!this.selectedRange.start) return false
      return date === this.selectedRange.start
    },

    isLastInRange(date) {
      if (!this.selectedRange.end) return false
      return date === this.selectedRange.end
    },

    selectDate(date) {
      // НОВАЯ ПРОВЕРКА: нельзя выбрать disabled дату
      if (!this.canSelectDate(date)) return

      if (!this.selectedRange.start || (this.selectedRange.start && this.selectedRange.end)) {
        this.selectedRange = { start: date, end: null }
      } else {
        if (date >= this.selectedRange.start) {
          this.selectedRange.end = date
        } else {
          this.selectedRange = { start: date, end: this.selectedRange.start }
        }
      }
    },

    handleSave() {
      this.$emit('save', this.selectedRange)
    },

    handleCancel() {
      this.$emit('cancel')
    },
  },

  template: `
    <div class="calendar">
      <div class="calendar-header">
        <h3>Выбрать период</h3>
      </div>

      <div class="calendar-divider"></div>

      <div class="calendar-nav">
        <button @click="prevMonth" class="nav-button" aria-label="Предыдущий месяц"></button>
        <div class="calendar-month">{{ currentMonthName }}</div>
        <button @click="nextMonth" class="nav-button" aria-label="Следующий месяц"></button>
      </div>

      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <div v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>

        <div class="calendar-days">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            :class="[
              'calendar-day',
              {
                'selected': isFirstInRange(day.date) || isLastInRange(day.date),
                'in-range': isInRange(day.date),
                'other-month': !day.isCurrentMonth,
                'disabled': day.isDisabled
              },
            ]"
            @click="selectDate(day.date)"
          >
            {{ day.day }}
          </div>
        </div>
      </div>

      <div class="calendar-actions">
        <button class="btn-cancel" @click="handleCancel">Отмена</button>
        <button
          class="btn-save"
          @click="handleSave"
          :disabled="!selectedRange.start || !selectedRange.end"
        >
          Сохранить
        </button>
      </div>
    </div>
  `,
}

const BaseInput = {
  name: 'BaseInput',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    type: { type: String, default: 'text' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  template: `
    <input
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
      class="base-input"
    />
  `,
}

const BasePagination = {
  name: 'BasePagination',

  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    maxVisiblePages: {
      type: Number,
      default: 5,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['page-change'],

  computed: {
    // Вычисляем диапазон отображаемых страниц
    visiblePages() {
      const half = Math.floor(this.maxVisiblePages / 2)
      let start = Math.max(2, this.currentPage - half) // Начинаем с 2, т.к. 1 всегда показываем
      let end = Math.min(this.totalPages - 1, start + this.maxVisiblePages - 1) // Заканчиваем предпоследней

      // Корректируем start если end достиг предела
      if (end === this.totalPages - 1) {
        start = Math.max(2, end - this.maxVisiblePages + 1)
      }

      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },

    // Нужно ли показывать многоточие в начале
    showStartEllipsis() {
      return this.visiblePages.length > 0 && this.visiblePages[0] > 2
    },

    // Нужно ли показывать многоточие в конце
    showEndEllipsis() {
      return (
        this.visiblePages.length > 0 &&
        this.visiblePages[this.visiblePages.length - 1] < this.totalPages - 1
      )
    },
  },

  methods: {
    handlePageChange(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.$emit('page-change', page)
      }
    },
  },

  template: `
    <div class="base-pagination" :class="{ 'base-pagination--disabled': disabled }">
      <!-- Кнопка "Назад" -->
      <button
        class="base-pagination__nav"
        :disabled="disabled || currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
        aria-label="Предыдущая страница"
      >
        <!-- Стрелка влево через CSS -->
      </button>

      <!-- Номера страниц -->
      <div class="base-pagination__pages">
        <!-- Первая страница -->
        <button
          v-if="totalPages > 0"
          :class="['base-pagination__page', { 'base-pagination__page--active': currentPage === 1 }]"
          @click="handlePageChange(1)"
          aria-label="Страница 1"
        >
          1
        </button>

        <!-- Многоточие после первой страницы -->
        <span v-if="showStartEllipsis" class="base-pagination__ellipsis"> ... </span>

        <!-- Основные страницы -->
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="[
            'base-pagination__page',
            { 'base-pagination__page--active': currentPage === page },
          ]"
          @click="handlePageChange(page)"
          :aria-label="'Страница ' + page"
        >
          {{ page }}
        </button>

        <!-- Многоточие перед последней страницей -->
        <span v-if="showEndEllipsis" class="base-pagination__ellipsis"> ... </span>

        <!-- Последняя страница (если больше 1) -->
        <button
          v-if="totalPages > 1"
          :class="[
            'base-pagination__page',
            { 'base-pagination__page--active': currentPage === totalPages },
          ]"
          @click="handlePageChange(totalPages)"
          :aria-label="'Страница ' + totalPages"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Кнопка "Вперед" -->
      <button
        class="base-pagination__nav"
        :disabled="disabled || currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
        aria-label="Следующая страница"
      >
        <!-- Стрелка вправо через CSS -->
      </button>
    </div>
  `,
}

const BaseSelect = {
  name: 'BaseSelect',

  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: 'Выберите вариант',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      isOpen: false,
    }
  },

  computed: {
    displayText() {
      if (!this.modelValue) return this.placeholder
      const selectedOption = this.options.find((opt) => opt.value === this.modelValue)
      return selectedOption ? selectedOption.label : this.placeholder
    },
  },

  methods: {
    toggleDropdown() {
      if (!this.disabled) {
        this.isOpen = !this.isOpen
      }
    },

    selectOption(option) {
      if (option.disabled) return
      this.$emit('update:modelValue', option.value)
      this.isOpen = false
    },

    clickOutsideHandler(event) {
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(event.target)) {
        this.isOpen = false
      }
    },
  },

  mounted() {
    document.addEventListener('click', this.clickOutsideHandler)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.clickOutsideHandler)
  },

  template: `
    <div
      class="base-select"
      ref="dropdownRef"
      :class="{ 'base-select--open': isOpen, 'base-select--disabled': disabled }"
    >
      <!-- Выбранное значение -->
      <div class="base-select__trigger" @click="toggleDropdown">
        <span class="base-select__value" :class="{ 'base-select__placeholder': !modelValue }">
          {{ displayText }}
        </span>
        <span class="base-select__arrow"></span>
      </div>

      <!-- Выпадающий список -->
      <div v-show="isOpen" class="base-select__dropdown">
        <div
          v-for="option in options"
          :key="option.value"
          class="base-select__option"
          :class="{
            'base-select__option--selected': option.value === modelValue,
            'base-select__option--disabled': option.disabled,
          }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>
  `,
}

const BaseTable = {
  name: 'BaseTable',

  props: {
    columns: {
      type: Array,
      required: true,
    },
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
    selectedItems: {
      type: Array,
      default: () => [],
    },
    isIndeterminate: {
      type: Boolean,
      default: false,
    },
    sortBy: {
      type: String,
      default: '',
    },
    sortDirection: {
      type: String,
      default: 'asc',
    },
  },

  emits: ['sort', 'retry', 'select-item', 'select-all'],

  methods: {
    handleSort(columnKey) {
      this.$emit('sort', columnKey)
    },

    getEducationTags(educationData) {
      if (!educationData) return []

      // Если данные приходят в виде массива
      if (Array.isArray(educationData)) {
        return educationData
      }

      // Если данные приходят в виде строки с разделителями
      if (typeof educationData === 'string') {
        return educationData
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      }

      return [educationData]
    },
  },

  template: `
    <!-- Обертка таблицы с семантическим тегом -->
    <div class="base-table" role="table" aria-label="Таблица учреждений">
      <!-- Заголовок таблицы с чекбоксом Select All -->
      <div class="base-table__header" role="rowgroup">
        <div class="base-table__header-row" role="row">
          <!-- Чекбокс для выбора всех строк -->
          <div class="base-table__header-cell base-table__checkbox-cell" role="columnheader">
            <input
              type="checkbox"
              :indeterminate="isIndeterminate"
              @change="$emit('select-all', $event.target.checked)"
              aria-label="Выбрать все строки"
            />
          </div>

          <!-- Заголовки колонок -->
          <div
            v-for="column in columns"
            :key="column.key"
            :class="[
              'base-table__header-cell',
              {
                'base-table__header-cell--sortable': column.sortable,
                'base-table__header-cell--hoverable': true
              }
            ]"
            @click="column.sortable && handleSort(column.key)"
            role="columnheader"
          >
            <div class="header-cell-content">
              <span>{{ column.label }}</span>
              <div v-if="column.sortable" class="table-sort">
                <div
                  :class="[
                    'table-sort__arrow table-sort__arrow--up',
                    { 'active': sortBy === column.key && sortDirection === 'asc' }
                  ]"
                ></div>
                <div
                  :class="[
                    'table-sort__arrow table-sort__arrow--down',
                    { 'active': sortBy === column.key && sortDirection === 'desc' }
                  ]"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Тело таблицы -->
      <div class="base-table__body" role="rowgroup">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="base-table__loading" role="row">
          <div v-for="n in 5" :key="n" class="base-table__skeleton-row" role="row">
            <div
              v-for="column in columns"
              :key="column.key"
              class="base-table__skeleton-cell"
              role="cell"
            >
              <div class="skeleton"></div>
            </div>
          </div>
        </div>

        <!-- Состояние ошибки -->
        <div v-else-if="error" class="base-table__error" role="row">
          <p>Произошла ошибка при загрузке данных</p>
          <BaseButton variant="primary" @click="$emit('retry')">Повторить попытку</BaseButton>
        </div>

        <!-- Пустое состояние -->
        <div v-else-if="data.length === 0" class="base-table__empty" role="row">
          <p>Данные не найдены</p>
        </div>

        <!-- Данные с чекбоксами в строках -->
        <template v-else>
          <div
            v-for="(row, index) in data"
            :key="row.uuid || index"
            class="base-table__row"
            role="row"
          >
            <!-- Чекбокс для выбора строки -->
            <div class="base-table__cell base-table__checkbox-cell" role="cell">
              <input
                type="checkbox"
                :checked="selectedItems.includes(row.uuid)"
                @change="$emit('select-item', row.uuid, $event.target.checked)"
                :aria-label="'Выбрать школу ' + row.name"
              />
            </div>

            <!-- Ячейки с данными -->
            <div
              v-for="column in columns"
              :key="column.key"
              class="base-table__cell"
              role="cell"
              :class="{ 'education-cell': column.key === 'education_level' }"
            >
              <template v-if="column.key === 'education_level' && row[column.key]">
                <div class="education-tags">
                  <span
                    v-for="(tag, tagIndex) in getEducationTags(row[column.key])"
                    :key="tagIndex"
                    class="education-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </template>
              <template v-else>
                {{ row[column.key] }}
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  `,
}

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
      sortBy: '',
      sortDirection: '',
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
        { key: 'region', label: 'Регион', sortable: true },
        { key: 'name', label: 'Название', sortable: true },
        { key: 'address', label: 'Адрес', sortable: true },
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
    startRecord() {
      let start
      if (this.searchValue.trim() !== '' || this.selectedStatus !== 'all') {
        start = (this.currentDisplayPage - 1) * this.selectedPageSize + 1
      } else {
        start = (this.currentPage - 1) * this.selectedPageSize + 1
      }

      // Не может быть больше общего количества записей
      const total =
        this.searchValue.trim() !== '' || this.selectedStatus !== 'all'
          ? this.filteredSchools.length
          : this.schools.length
      return Math.min(start, total)
    },

    endRecord() {
      let end
      if (this.searchValue.trim() !== '' || this.selectedStatus !== 'all') {
        end = this.currentDisplayPage * this.selectedPageSize
      } else {
        end = this.currentPage * this.selectedPageSize
      }

      const total =
        this.searchValue.trim() !== '' || this.selectedStatus !== 'all'
          ? this.filteredSchools.length
          : this.schools.length
      return Math.min(end, total)
    },

    displayedSchools() {
      // Сначала применяем сортировку
      const sortedData = window.sortSchools(this.filteredSchools, this.sortBy, this.sortDirection)

      // Потом пагинацию
      const startIndex = (this.filteredCurrentPage - 1) * this.selectedPageSize
      const endIndex = startIndex + this.selectedPageSize
      return sortedData.slice(startIndex, endIndex)
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

    handleSort(columnKey) {
      const newDirection = window.getNextSortDirection(this.sortBy, columnKey, this.sortDirection)

      this.sortBy = columnKey
      this.sortDirection = newDirection

      console.log(`🔄 Сортировка: ${columnKey}, направление: ${newDirection}`)
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
            <div class="logo-dark">School</div>
            <div class="contacts-block">
              <div>+7 (495) 123-45-67</div>
              <div>info@schools-edu.ru</div>
              <div>schools-education.com</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tech-head-container">
        <div class="tech-head-2xl">Тестовое задание</div>
      </div>
    </header>

    <main class="main-content">
      <!-- БЕЛАЯ ПОЛОСА МЕЖДУ ШАПКОЙ И КОНТЕНТОМ -->
      <div class="content-spacer"></div>

      <!-- ОСНОВНОЙ КОНТЕЙНЕР С СЕРЫМ ФОНОМ -->
      <div class="page-container">

        <!-- БЕЛЫЙ БЛОК С ТАБЛИЦЕЙ -->
        <section class="table-section">
          <!-- ВЕРХНЯЯ ПАНЕЛЬ С ЗАГОЛОВКОМ И КНОПКАМИ -->
          <div class="table-header">
            <h1 class="table-title">Таблица учреждений</h1>

            <div class="table-actions">
              <!-- ПОИСК -->
              <div class="table-search">
                <BaseInput
                  v-model="searchValue"
                  placeholder="Поиск"
                  @input="handleSearch"
                />
              </div>

              <!-- КНОПКА СКАЧИВАНИЯ -->
              <button class="download-btn-main" @click="handleExport" :disabled="selectedSchools.length === 0">
                <div class="download-icon"></div>
                <span>Скачать</span>
              </button>
            </div>
          </div>

          <!-- ВЕРХНИЕ ФИЛЬТРЫ -->
          <div class="filters-row">
            <!-- КАЛЕНДАРЬ -->
            <div class="filter-item">
              <div class="calendar-filter" @click="showCalendar = true">
                <div class="calendar-icon"></div>
                <span class="calendar-text">{{ dateRange || 'Выберите период' }}</span>
              </div>
            </div>

            <!-- ВСЕ РЕГИОНЫ -->
            <div class="filter-item filter-select">
              <BaseSelect
                v-model="selectedRegion"
                :options="[
                  { value: '', label: 'Все регионы' },
                  ...regions.map(r => ({ value: r.id, label: r.name }))
                ]"
                placeholder="Все регионы"
              />
            </div>

            <!-- ВСЕ ВИДЫ -->
            <div class="filter-item filter-select">
              <BaseSelect
                v-model="selectedType"
                :options="schoolTypes"
                placeholder="Все виды"
              />
            </div>

            <!-- ВСЕ СТАТУСЫ -->
            <div class="filter-item filter-select">
              <BaseSelect
                v-model="selectedStatus"
                :options="statusTypes"
                placeholder="Все статусы"
              />
            </div>
          </div>

          <!-- КАЛЕНДАРЬ -->
          <div v-if="showCalendar" class="calendar-overlay" @click="showCalendar = false">
            <div class="calendar-container" @click.stop>
              <BaseCalendar @save="applyDateRange" @cancel="showCalendar = false" />
            </div>
          </div>

          <!-- РЕЗУЛЬТАТЫ ПОИСКА -->
          <div v-if="searchValue.trim() !== ''" class="search-results-info">
            🔍 Найдено: <strong>{{ filteredSchools.length }}</strong> школ по запросу "{{ searchValue }}"
          </div>

          <!-- ОСНОВНОЕ СОДЕРЖИМОЕ -->
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
            <!-- ОБЕРТКА ДЛЯ ТАБЛИЦЫ С ДАННЫМИ -->
            <div class="table-data-container">
              <!-- ТАБЛИЦА С ДАННЫМИ -->
              <BaseTable
  :columns="tableColumns"
  :data="displayedSchools"
  :loading="loading"
  :selected-items="selectedSchools"
  :is-indeterminate="isIndeterminate"
  :sort-by="sortBy"
  :sort-direction="sortDirection"
  @select-all="handleSelectAll"
  @select-item="handleSelectSchool"
  @sort="handleSort"
/>
            </div>

            <!-- НОВЫЙ КОНТЕЙНЕР ПАГИНАЦИИ ВНИЗУ -->
<div class="table-pagination-container">
  <!-- ЛЕВАЯ ЧАСТЬ: ПАГИНАЦИЯ -->
  <div class="pagination-left">
    <BasePagination
      v-if="filteredTotalPages > 1"
      :current-page="currentPage"
      :total-pages="filteredTotalPages"
      @page-change="handlePageChange"
    />
  </div>

  <!-- ПРАВАЯ ЧАСТЬ: ИНФОРМАЦИЯ + "ПОКАЗЫВАТЬ ПО" -->
  <div class="pagination-right">
    <span class="pagination-info">
      Показывать {{ startRecord }}-{{ endRecord }} из {{ filteredSchools.length }} записей
    </span>

    <div class="page-size-control">
      <span class="page-size-label">Показывать</span>
      <BaseSelect
        v-model="selectedPageSize"
        :options="pageSizes.map((size) => ({ value: size, label: String(size) }))"
        @update:modelValue="handlePageSizeChange"
        class="page-size-select"
      />
    </div>
  </div>
</div>
          </div>
        </section>
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
