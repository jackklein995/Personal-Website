import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import BoardPage from './components/BoardPage'
import BacklogPage from './components/BacklogPage'
import SportsPage from './components/SportsPage'
import CalendarPage from './components/CalendarPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <div className="pt-14">
          <Routes>
            <Route path="/"         element={<Home />}       />
            <Route path="/board"    element={<BoardPage />}   />
            <Route path="/backlog"  element={<BacklogPage />} />
            <Route path="/sports"   element={<SportsPage />}  />
            <Route path="/calendar" element={<CalendarPage />}/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
