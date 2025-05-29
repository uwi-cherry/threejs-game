'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthService from '@/services/AuthService'

export default function TitlePage() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!username.trim()) return

    setIsLoading(true)
    try {
      const result = await AuthService.login(username.trim())
      if (result.success) {
        router.push('/loading')
      } else {
        alert(result.error || 'ログインに失敗しました')
      }
    } catch (error) {
      alert('ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setIsLoading(true)
    try {
      const result = await AuthService.loginAsGuest()
      if (result.success) {
        router.push('/loading')
      } else {
        alert(result.error || 'ゲストログインに失敗しました')
      }
    } catch (error) {
      alert('ゲストログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-wide">
            My Game
          </h1>
          <p className="text-xl text-purple-200">
            ソーシャルRPG
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20">
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-white text-sm font-medium mb-3">
                プレイヤー名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="名前を入力してください"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                maxLength={12}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                disabled={!username.trim() || isLoading}
                className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {isLoading ? 'ログイン中...' : 'ゲーム開始'}
              </button>

              <button
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
              >
                ゲストで始める
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}