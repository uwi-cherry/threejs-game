interface User {
  id: string
  username: string
  level: number
  isGuest?: boolean
  createdAt: string
}

interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

class AuthService {
  private static instance: AuthService
  private baseUrl = 'http://localhost:8000'
  private user: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  constructor() {
    // No need to restore from localStorage with session-based auth
  }

  // 既存セッションの検証
  async verifyExistingSession(): Promise<AuthResponse> {
    const isValid = await this.verifySession()
    if (isValid && this.user) {
      return {
        success: true,
        user: this.user
      }
    }

    return {
      success: false,
      error: 'Session verification failed'
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('AuthService.login called with:', { username, baseUrl: this.baseUrl })
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({ username, password }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (data.success && data.user) {
        this.user = data.user
        // No need to store anything in localStorage with session-based auth
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }
    }
  }

  async verifySession(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        credentials: 'include', // Include session cookies
      })

      const data = await response.json()

      if (data.valid && data.user) {
        this.user = data.user
        return true
      } else {
        await this.logout()
        return false
      }
    } catch (error) {
      console.error('Session verification failed:', error)
      await this.logout()
      return false
    }
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint to destroy session
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    }
    
    // Clear local user data
    this.user = null
  }

  isAuthenticated(): boolean {
    return this.user !== null
  }

  getUser(): User | null {
    return this.user
  }

  async getPlayerProfile(): Promise<any> {
    if (!this.user) {
      throw new Error('Not authenticated')
    }

    try {
      const response = await fetch(`${this.baseUrl}/player/profile`, {
        credentials: 'include', // Include session cookies
      })

      return await response.json()
    } catch (error) {
      throw new Error('Failed to fetch player profile')
    }
  }
}

export default AuthService.getInstance()