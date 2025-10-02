function exportSchoolsToTxt(selectedSchools, allSchools) {
  if (selectedSchools.length === 0) {
    alert('Не выбрано ни одной школы для экспорта')
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

  alert(`Экспортировано ${selectedData.length} школ в TXT файл`)
}
