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
