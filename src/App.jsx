import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import BoardPage from './components/BoardPage'
import BacklogPage from './components/BacklogPage'
import SportsPage from './components/SportsPage'
import CalendarPage from './components/CalendarPage'
import GoalsPage from './components/ProjectsPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070d1f] text-slate-100">
        <Navbar />
        <div className="pt-14">
          <Routes>
            <Route path="/"         element={<Home />}       />
            <Route path="/board"    element={<BoardPage />}   />
            <Route path="/backlog"  element={<BacklogPage />} />
            <Route path="/sports"   element={<SportsPage />}  />
            <Route path="/calendar" element={<CalendarPage />}/>
            <Route path="/goals" element={<GoalsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
