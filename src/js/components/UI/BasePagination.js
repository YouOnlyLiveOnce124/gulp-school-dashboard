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
    visiblePages() {
      const half = Math.floor(this.maxVisiblePages / 2)
      let start = Math.max(2, this.currentPage - half)
      let end = Math.min(this.totalPages - 1, start + this.maxVisiblePages - 1)

      if (end === this.totalPages - 1) {
        start = Math.max(2, end - this.maxVisiblePages + 1)
      }

      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },

    showStartEllipsis() {
      return this.visiblePages.length > 0 && this.visiblePages[0] > 2
    },

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

      <button
        class="base-pagination__nav"
        :disabled="disabled || currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
        aria-label="Предыдущая страница"
      >
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


        <span v-if="showEndEllipsis" class="base-pagination__ellipsis"> ... </span>


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


      <button
        class="base-pagination__nav"
        :disabled="disabled || currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
        aria-label="Следующая страница"
      >

      </button>
    </div>
  `,
}
