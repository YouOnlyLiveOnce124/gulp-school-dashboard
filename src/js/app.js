console.log('🎯 app.js загружен!')
console.log('Vue доступен:', typeof Vue !== 'undefined')

if (typeof Vue === 'undefined') {
  console.error('❌ Vue не загружен! Проверь подключение в HTML.')
} else {
  console.log('✅ Vue загружен! Создаем приложение...')

  const { createApp } = Vue

  const App = {
    data() {
      return {
        message: '🎉 VUE РАБОТАЕТ!',
        count: 0,
      }
    },
    template: `
  <div style="padding: 50px; background: red; color: white;">
    <h1>{{ message }}</h1>
    <p>Счетчик: {{ count }}</p>
    <button @click="count++">Тест кнопка</button>

    <!-- ИСПОЛЬЗУЙ BaseButton -->
    <BaseButton @click="count++" variant="primary">
      🎯 BaseButton компонент!
    </BaseButton>

    <BaseButton @click="count++" variant="secondary">
      Вторичная кнопка
    </BaseButton>
  </div>
`,
  }

  const app = createApp(App)

  // РЕГИСТРИРУЕМ КОМПОНЕНТ ЗДЕСЬ
  app.component('BaseButton', BaseButton)

  app.mount('#app')
  console.log('✅ Приложение смонтировано!')
}
