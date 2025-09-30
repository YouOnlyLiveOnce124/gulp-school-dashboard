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
        })
      }

      // Дни текущего месяца
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
          day: i,
          date: this.formatDateToLocal(this.currentYear, this.currentMonthIndex, i),
          isCurrentMonth: true,
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
      return date === this.selectedRange.start || date === this.selectedRange.end
    },

    isInRange(date) {
      if (!this.selectedRange.start || !this.selectedRange.end) return false
      return date > this.selectedRange.start && date < this.selectedRange.end
    },

    isFirstInRange(date) {
      return date === this.selectedRange.start
    },

    isLastInRange(date) {
      return date === this.selectedRange.end
    },

    selectDate(date) {
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
