import { useState, useEffect } from 'react'
import { format, addDays, startOfDay } from 'date-fns'
import api from '../utils/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const PatientDashboard = () => {
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('slots')

  // Get date range for next 7 days
  const getDateRange = () => {
    const today = startOfDay(new Date())
    const from = format(today, 'yyyy-MM-dd')
    const to = format(addDays(today, 6), 'yyyy-MM-dd')
    return { from, to }
  }

  const fetchSlots = async () => {
    try {
      const { from, to } = getDateRange()
      const response = await api.get(`/slots?from=${from}&to=${to}`)
      setSlots(response.data.availableSlots || [])
    } catch (error) {
      toast.error('Failed to fetch available slots')
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await api.get('/my-bookings')
      setBookings(response.data.bookings || [])
    } catch (error) {
      toast.error('Failed to fetch your bookings')
    }
  }

  const bookSlot = async (slotId) => {
    setBookingLoading(true)
    try {
      await api.post('/book', { slotId })
      toast.success('Slot booked successfully!')
      fetchSlots()
      fetchBookings()
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to book slot'
      toast.error(errorMessage)
    } finally {
      setBookingLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchSlots(), fetchBookings()])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
        <p className="text-gray-600">Book appointments and view your booking history</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('slots')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'slots'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Slots ({slots.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
        </nav>
      </div>

      {/* Available Slots Tab */}
      {activeTab === 'slots' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Available Slots (Next 7 Days)</h2>
          {slots.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No available slots found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <div key={slot._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-2">
                    <p className="font-medium text-gray-900">
                      {format(new Date(slot.startAt), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(slot.startAt), 'h:mm a')} - {format(new Date(slot.endAt), 'h:mm a')}
                    </p>
                  </div>
                  <button
                    onClick={() => bookSlot(slot._id)}
                    disabled={bookingLoading}
                    className="btn-primary w-full text-sm"
                  >
                    {bookingLoading ? 'Booking...' : 'Book This Slot'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(booking.slot.startAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(booking.slot.startAt), 'h:mm a')} - {format(new Date(booking.slot.endAt), 'h:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(booking.createdAt), 'MMM d, yyyy h:mm a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PatientDashboard
