// src/App.tsx
import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/components/AuthForm'
import { ChatLayout } from '@/components/chat/ChatLayout'

const App = () => {
  const { user, loading } = useAuth()

  // Pokazuj loader podczas ładowania
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading ChatFlow...</p>
        </div>
      </div>
    )
  }

  // Jeśli użytkownik nie jest zalogowany, pokaż formularz logowania
  if (!user) {
    return <AuthForm />
  }

  // Jeśli użytkownik jest zalogowany, pokaż chat
  return <ChatLayout />
}

export default App
