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
