import { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('cpdo_token') || sessionStorage.getItem('cpdo_token')
    if (!token) {
      setReady(true)
      return
    }

    api
      .get('/me')
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('cpdo_token')
        sessionStorage.removeItem('cpdo_token')
      })
      .finally(() => setReady(true))
  }, [])

  async function login(loginName, password, remember) {
    const { data } = await api.post('/login', {
      login: loginName,
      password,
      remember,
    })
    localStorage.removeItem('cpdo_token')
    sessionStorage.removeItem('cpdo_token')
    const store = remember ? localStorage : sessionStorage
    store.setItem('cpdo_token', data.token)
    setUser(data.user)
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch {
      // The local session still ends if the server token is already gone.
    }
    localStorage.removeItem('cpdo_token')
    sessionStorage.removeItem('cpdo_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
