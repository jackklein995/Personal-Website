import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import CalendarPage from './components/CalendarPage'
import SportsPage from './components/SportsPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/sports" element={<SportsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
