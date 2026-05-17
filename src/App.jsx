import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import Home from './components/Home'
import BoardPage from './components/BoardPage'
import BacklogPage from './components/BacklogPage'
import SportsPage from './components/SportsPage'
import CalendarPage from './components/CalendarPage'
import GoalsPage from './components/ProjectsPage'
import NotesPage from './components/NotesPage'
import LoginPage from './components/LoginPage'

function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Still checking auth
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#070d1f] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in
  if (!session) return <LoginPage />

  // Logged in
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070d1f] text-slate-100">
        <Navbar />
        <div className="pt-14">
          <Routes>
            <Route path="/"         element={<Home />}         />
            <Route path="/board"    element={<BoardPage />}    />
            <Route path="/backlog"  element={<BacklogPage />}  />
            <Route path="/sports"   element={<SportsPage />}   />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/goals"    element={<GoalsPage />}    />
            <Route path="/notes"    element={<NotesPage />}    />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
