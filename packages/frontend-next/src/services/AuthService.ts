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
  token?: string
  error?: string
}

class AuthService {
  private static instance: AuthService
  private baseUrl = 'http://localhost:8000'
  private token: string | null = null
  private user: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  constructor() {
    // ローカルストレージからトークンを復元
    this.token = localStorage.getItem('auth_token')
  }

  async login(username: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (data.success && data.token) {
        this.token = data.token
        this.user = data.user
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }
    }
  }

  async loginAsGuest(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success && data.token) {
        this.token = data.token
        this.user = data.user
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Guest login failed'
      }
    }
  }

  async verifyToken(): Promise<boolean> {
    if (!this.token) return false

    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })

      const data = await response.json()

      if (data.valid && data.user) {
        this.user = data.user
        return true
      } else {
        this.logout()
        return false
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      this.logout()
      return false
    }
  }

  logout(): void {
    this.token = null
    this.user = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  isAuthenticated(): boolean {
    return this.token !== null
  }

  getUser(): User | null {
    if (!this.user && this.token) {
      // ローカルストレージから復元を試行
      const userData = localStorage.getItem('user_data')
      if (userData) {
        try {
          this.user = JSON.parse(userData)
        } catch (error) {
          console.error('Failed to parse user data:', error)
        }
      }
    }
    return this.user
  }

  getToken(): string | null {
    return this.token
  }

  async getPlayerProfile(): Promise<any> {
    if (!this.token) {
      throw new Error('Not authenticated')
    }

    try {
      const response = await fetch(`${this.baseUrl}/player/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })

      return await response.json()
    } catch (error) {
      throw new Error('Failed to fetch player profile')
    }
  }
}

export default AuthService.getInstance()