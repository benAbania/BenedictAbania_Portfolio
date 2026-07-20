import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Portfolio from './pages/Portfolio'
import Admin from './pages/Admin'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* The public portfolio page */}
        <Route path="/" element={<Portfolio />} />
        
        {/* We removed the Navigate redirect! Now it will load the Admin component, which will show the Login screen if you aren't logged in. */}
        <Route path="/admin" element={<Admin session={session} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App