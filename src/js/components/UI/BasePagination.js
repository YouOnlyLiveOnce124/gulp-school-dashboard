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
      let start = Math.max(1, this.currentPage - half)
      let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1)

      // Корректируем start если end достиг предела
      start = Math.max(1, end - this.maxVisiblePages + 1)

      const pages = []
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < this.totalPages) {
          pages.push(i)
        }
      }
      return pages
    },

    // Нужно ли показывать многоточие в начале
    showStartEllipsis() {
      return (
        this.totalPages > this.maxVisiblePages &&
        this.currentPage > Math.floor(this.maxVisiblePages / 2) + 1
      )
    },

    // Нужно ли показывать многоточие в конце
    showEndEllipsis() {
      return (
        this.totalPages > this.maxVisiblePages &&
        this.currentPage < this.totalPages - Math.floor(this.maxVisiblePages / 2)
      )
    },
  },

  methods: {
    handlePageChange(page) {
      this.$emit('page-change', page)
    },
  },

  template: `
    <div class="base-pagination" :class="{ 'base-pagination--disabled': disabled }">
      <!-- Кнопка "Назад" -->
      <BaseButton
        variant="secondary"
        :disabled="disabled || currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
        class="base-pagination__nav"
      >
        ← Назад
      </BaseButton>

      <!-- Номера страниц -->
      <div class="base-pagination__pages">
        <!-- Первая страница -->
        <BaseButton
          v-if="totalPages > 0"
          variant="secondary"
          :class="['base-pagination__page', { 'base-pagination__page--active': currentPage === 1 }]"
          @click="handlePageChange(1)"
        >
          1
        </BaseButton>

        <!-- Многоточие после первой страницы -->
        <span v-if="showStartEllipsis" class="base-pagination__ellipsis"> ... </span>

        <!-- Основные страницы -->
        <BaseButton
          v-for="page in visiblePages"
          :key="page"
          variant="secondary"
          :class="[
            'base-pagination__page',
            { 'base-pagination__page--active': currentPage === page },
          ]"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </BaseButton>

        <!-- Многоточие перед последней страницей -->
        <span v-if="showEndEllipsis" class="base-pagination__ellipsis"> ... </span>

        <!-- Последняя страница (если больше 1) -->
        <BaseButton
          v-if="totalPages > 1"
          variant="secondary"
          :class="[
            'base-pagination__page',
            { 'base-pagination__page--active': currentPage === totalPages },
          ]"
          @click="handlePageChange(totalPages)"
        >
          {{ totalPages }}
        </BaseButton>
      </div>

      <!-- Кнопка "Вперед" -->
      <BaseButton
        variant="secondary"
        :disabled="disabled || currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
        class="base-pagination__nav"
      >
        Вперед →
      </BaseButton>
    </div>
  `,
}
