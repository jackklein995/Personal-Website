import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { supabase } from '../supabaseClient'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
})

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { type: 'add', start, end } | { type: 'delete', event }
  const [newTitle, setNewTitle] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase.from('calendar_events').select('*')
    if (!error && data) {
      setEvents(
        data.map(e => ({
          id: e.id,
          title: e.title,
          start: new Date(e.start_time),
          end: new Date(e.end_time),
          description: e.description || '',
        }))
      )
    }
    setLoading(false)
  }

  const handleSelectSlot = useCallback(({ start, end }) => {
    setNewTitle('')
    setModal({ type: 'add', start, end })
  }, [])

  const handleSelectEvent = useCallback(event => {
    setModal({ type: 'delete', event })
  }, [])

  async function handleAddEvent() {
    if (!newTitle.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title: newTitle.trim(),
        start_time: modal.start.toISOString(),
        end_time: modal.end.toISOString(),
        description: '',
      })
      .select()
      .single()

    if (!error && data) {
      setEvents(prev => [
        ...prev,
        {
          id: data.id,
          title: data.title,
          start: new Date(data.start_time),
          end: new Date(data.end_time),
          description: data.description || '',
        },
      ])
    }
    setSaving(false)
    setModal(null)
  }

  async function handleDeleteEvent() {
    setSaving(true)
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', modal.event.id)

    if (!error) {
      setEvents(prev => prev.filter(e => e.id !== modal.event.id))
    }
    setSaving(false)
    setModal(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Weekly Calendar</h1>
      <p className="text-gray-400 mb-6 text-sm">
        Click a day or time slot to add an event. Click an event to delete it.
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-96 text-gray-500">
          Loading events...
        </div>
      ) : (
        <div className="rbc-dark">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 640 }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      )}

      {/* Add Event Modal */}
      {modal?.type === 'add' && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-1">Add Event</h2>
            <p className="text-gray-500 text-sm mb-5">
              {format(modal.start, 'EEEE, MMMM d, yyyy')}
            </p>
            <input
              type="text"
              placeholder="Event title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
              autoFocus
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-5 transition-colors"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={saving || !newTitle.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
              >
                {saving ? 'Saving...' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Event Modal */}
      {modal?.type === 'delete' && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-2">Delete Event?</h2>
            <p className="text-gray-400 mb-1">
              <span className="font-medium text-white">"{modal.event.title}"</span>
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {format(modal.event.start, 'EEEE, MMMM d, yyyy')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={saving}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
