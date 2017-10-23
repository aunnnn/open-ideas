import ReactGA from 'react-ga'

let isInitialized = false

export const initGA = () => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.initialize('UA-108480205-1')
    isInitialized = true
  }
}

export const logPageView = () => {
  if (!isInitialized) return
  const page = window.location.pathname
  ReactGA.set({ page })
  ReactGA.pageview(page)
}

export const logEvent = (category = '', action = '') => {
  if (!isInitialized) return
  if (category && action) {
    ReactGA.event({ category, action })
  }
}

export const logException = (description = '', fatal = false) => {
  if (!isInitialized) return
  if (description) {
    ReactGA.exception({ description, fatal })
  }
}
