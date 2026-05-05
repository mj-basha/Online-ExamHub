'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import Cookies from 'js-cookie'
import { createClient } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  number: string
  name: string
  role: 'student' | 'instructor'
  createdAt: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (number: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (data: Partial<Pick<User, 'name' | 'avatar'>>) => void
}

interface RegisterData {
  number: string
  password: string
  name: string
  role: 'student' | 'instructor'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = 'exam_platform_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const sessionId = Cookies.get(SESSION_KEY)
      if (sessionId) {
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', sessionId)
            .single()

          if (!error && data) {
            setUser({
              id: data.user_id,
              number: data.user_number,
              name: data.name,
              role: data.role === 'teacher' ? 'instructor' : 'student',
              createdAt: data.created_at,
            })
          } else {
            Cookies.remove(SESSION_KEY)
          }
        } catch (error) {
          console.error('Failed to load user:', error)
          Cookies.remove(SESSION_KEY)
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = useCallback(async (number: string, password: string) => {
    try {
      const supabase = createClient()
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_number', number)
        .single()

      if (error || !userData) {
        return { success: false, error: 'No account found with this number' }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userData.password)
      if (!isValidPassword) {
        return { success: false, error: 'Invalid password' }
      }

      const loggedInUser: User = {
        id: userData.user_id,
        number: userData.user_number,
        name: userData.name,
        role: userData.role === 'teacher' ? 'instructor' : 'student',
        createdAt: userData.created_at,
      }

      setUser(loggedInUser)
      Cookies.set(SESSION_KEY, userData.user_id, { expires: 7 })

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    try {
      const supabase = createClient()

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_number', data.number)
        .single()

      if (existingUser) {
        return { success: false, error: 'An account with this number already exists' }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10)

      // Map 'instructor' role to 'teacher' for database
      const dbRole = data.role === 'instructor' ? 'teacher' : 'student'

      // Insert new user
      const { data: newUserData, error } = await supabase
        .from('users')
        .insert({
          user_number: data.number,
          name: data.name,
          password: hashedPassword,
          role: dbRole,
        })
        .select()
        .single()

      if (error) {
        console.error('Registration error:', error)
        return { success: false, error: 'Registration failed. Please try again.' }
      }

      const newUser: User = {
        id: newUserData.user_id,
        number: newUserData.user_number,
        name: newUserData.name,
        role: data.role,
        createdAt: newUserData.created_at,
      }

      setUser(newUser)
      Cookies.set(SESSION_KEY, newUserData.user_id, { expires: 7 })

      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }, [])

  const updateUser = useCallback(async (data: Partial<Pick<User, 'name' | 'avatar'>>) => {
    if (!user) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('users')
        .update({ name: data.name })
        .eq('user_id', user.id)

      if (!error) {
        setUser((prev) => prev ? { ...prev, ...data } : null)
      }
    } catch (error) {
      console.error('Update user error:', error)
    }
  }, [user])

  const logout = useCallback(() => {
    setUser(null)
    Cookies.remove(SESSION_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
