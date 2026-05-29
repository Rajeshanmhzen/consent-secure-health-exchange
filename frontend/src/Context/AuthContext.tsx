import React, { createContext, useContext, useState } from 'react'
import type { AuthUser } from '../types/auth.types'

type AuthContextType = {
    user: AuthUser | null
    accessToken: string | null
    login: (user: AuthUser, accessToken: string, refreshToken: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const stored = localStorage.getItem('user')
            return stored ? JSON.parse(stored) : null
        } catch { return null }
    })

    const [accessToken, setAccessToken] = useState<string | null>(
        () => localStorage.getItem('accessToken')
    )

    const login = (user: AuthUser, accessToken: string, refreshToken: string) => {
        setUser(user)
        setAccessToken(accessToken)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
    }

    const logout = () => {
        setUser(null)
        setAccessToken(null)
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    }

    React.useEffect(() => {
        const handleFailure = () => {
            setUser(null)
            setAccessToken(null)
        }
        window.addEventListener('auth_failure', handleFailure)
        return () => window.removeEventListener('auth_failure', handleFailure)
    }, [])

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
