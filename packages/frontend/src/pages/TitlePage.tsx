import React from 'react'

export const TitlePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">
          My Game
        </h1>
        <p className="text-xl text-blue-100">
          ソーシャルRPG
        </p>
      </div>
    </div>
  )
}