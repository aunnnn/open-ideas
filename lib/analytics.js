import ReactGA from 'react-ga'

const isProduction = process.env.NODE_ENV === 'production'

export const initGA = () => {
  ReactGA.initialize('UA-108480205-1')
}

export const logPageView = () => {
  if (!isProduction) return
  const page = window.location.pathname
  ReactGA.set({ page })
  ReactGA.pageview(page)
}

export const logEvent = (category = '', action = '') => {
  if (!isProduction) return
  if (category && action) {
    ReactGA.event({ category, action })
  }
}

export const logException = (description = '', fatal = false) => {
  if (!isProduction) return
  if (description) {
    ReactGA.exception({ description, fatal })
  }
}
