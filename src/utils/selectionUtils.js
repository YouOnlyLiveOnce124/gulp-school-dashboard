function handleSelectAll(selectedSchools, displayedSchools, isSelected) {
  if (isSelected) {
    const currentPageIds = displayedSchools.map((school) => school.uuid)
    return [...new Set([...selectedSchools, ...currentPageIds])]
  } else {
    const currentPageIds = displayedSchools.map((school) => school.uuid)
    return selectedSchools.filter((id) => !currentPageIds.includes(id))
  }
}

function handleSelectSchool(selectedSchools, schoolId, isSelected) {
  if (isSelected) {
    if (!selectedSchools.includes(schoolId)) {
      return [...selectedSchools, schoolId]
    }
  } else {
    return selectedSchools.filter((id) => id !== schoolId)
  }
  return selectedSchools
}
