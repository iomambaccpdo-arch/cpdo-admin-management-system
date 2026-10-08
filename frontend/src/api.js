import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

export function authToken() {
  return localStorage.getItem('cpdo_token') || sessionStorage.getItem('cpdo_token')
}

api.interceptors.request.use((config) => {
  const token = authToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    if (status === 401 && !url.includes('/login')) {
      localStorage.removeItem('cpdo_token')
      sessionStorage.removeItem('cpdo_token')
      const path = window.location.pathname
      if (path !== '/login' && path !== '/forgot-password') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data
  if (data?.errors) {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first) && first[0]) return first[0]
  }
  return data?.message || fallback
}

export default api
