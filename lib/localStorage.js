export const loadState = () => {
  if (!process.browser) return undefined
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

export const saveState = (state) => {  
  if (!process.browser) return
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  } catch (err) {
    // Ignore
    console.log('ERROR: Cannot save state: ', err)
  }
}
