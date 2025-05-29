'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthService from '../../services/AuthService'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/home'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('ユーザー名とパスワードを入力してください')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await AuthService.login(username.trim(), password.trim())
      if (result.success) {
        // クッキーにもトークンを保存（Middleware用）
        document.cookie = `auth_token=${result.token}; path=/; max-age=86400`
        router.push(redirectPath)
      } else {
        setError(result.error || 'ログインに失敗しました')
      }
    } catch (error) {
      setError('ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Game</h1>
          <p className="text-purple-200">ログインしてゲームを開始</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-white text-sm font-medium mb-2">
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ユーザー名を入力"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              テストアカウント: admin / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}