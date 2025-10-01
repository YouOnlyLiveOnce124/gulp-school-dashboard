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
