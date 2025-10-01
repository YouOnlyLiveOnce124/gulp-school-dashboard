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
