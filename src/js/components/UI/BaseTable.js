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
  },

  emits: ['sort', 'retry', 'select-item', 'select-all'],

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
      'base-table__header-cell--hoverable': true // ← ДОБАВЛЯЕМ ХОВЕР ДЛЯ ВСЕХ
    }
  ]"
  @click="column.sortable && $emit('sort', column.key)"
  role="columnheader"
>
  <div class="header-cell-content">
    <span>{{ column.label }}</span>
    <div v-if="column.sortable" class="table-sort">
      <!-- иконки сортировки -->
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
            <div v-for="column in columns" :key="column.key" class="base-table__cell" role="cell">
              {{ row[column.key] }}
            </div>
          </div>
        </template>
      </div>
    </div>
  `,
}
