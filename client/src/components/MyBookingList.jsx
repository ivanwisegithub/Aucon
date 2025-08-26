// client/src/components/MyBookingList.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, Badge, Button, Alert, Spinner, Select, TextInput, Modal } from 'flowbite-react';
import { HiCalendar, HiClock, HiUser, HiSearch, HiExclamationCircle, HiEye } from 'react-icons/hi';

export default function MyBookingList() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // Fetch user's own bookings
  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = currentUser?.accessToken || currentUser?.token;
      
      // Build query parameters for search and filtering
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'All') params.append('status', statusFilter.toLowerCase());
      
      // Use user-specific endpoint instead of admin endpoint
      const url = `/api/bookings/user/my-bookings${params.toString() ? `?${params.toString()}` : ''}`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `Failed to fetch bookings: ${res.status}`);
      }
      
      setBookings(data.bookings || []);
      
    } catch (err) {
      console.error('Error fetching my bookings:', err);
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const statusMap = {
      'pending': 'warning',
      'confirmed': 'success',
      'cancelled': 'failure',
      'completed': 'info'
    };
    
    const capitalizedStatus = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
    
    return (
      <Badge color={statusMap[normalizedStatus] || 'gray'} size="sm">
        {capitalizedStatus}
      </Badge>
    );
  };

  // Show booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Cancel booking function
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = currentUser?.accessToken || currentUser?.token;
      
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'cancelled'
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }
      
      // Update local state
      setBookings(bookings.map(b =>
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'No date';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
      booking.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Trigger refresh when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMyBookings();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
        <span className="ml-2">Loading your bookings...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
        <Button onClick={fetchMyBookings} color="gray" size="sm">Refresh</Button>
      </div>

      {error && (
        <Alert color="failure" className="mb-4">
          <span className="font-medium">Error:</span> {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <TextInput
              type="text"
              placeholder="Search by service type or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredBookings.length}
          </div>
          <div className="text-sm text-gray-500">Total Bookings</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredBookings.filter(b => b.status?.toLowerCase() === 'pending').length}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {filteredBookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-500">Confirmed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {filteredBookings.filter(b => b.status?.toLowerCase() === 'completed').length}
          </div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <HiCalendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            {searchTerm || statusFilter !== 'All' ? 'No matching bookings' : 'No bookings found'}
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'All' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'You haven\'t made any appointments yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Date & Time</Table.HeadCell>
              <Table.HeadCell>Service Type</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Created</Table.HeadCell>
              <Table.HeadCell>Notes</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredBookings.map((booking) => (
                <Table.Row key={booking._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <HiCalendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(booking.date)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <HiClock className="h-3 w-3 mr-1" />
                          {booking.time || 'No time specified'}
                        </div>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-medium">{booking.serviceType || 'General'}</span>
                  </Table.Cell>
                  <Table.Cell>{getStatusBadge(booking.status)}</Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(booking.createdAt)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="max-w-xs">
                      {booking.notes ? (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={booking.notes}>
                          {booking.notes}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-400">No notes</span>
                      )}
                      {booking.adminNotes && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 truncate" title={booking.adminNotes}>
                          <strong>Admin Note:</strong> {booking.adminNotes}
                        </p>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button
                        color="blue"
                        size="xs"
                        onClick={() => handleViewDetails(booking)}
                      >
                        <HiEye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {booking.status?.toLowerCase() === 'pending' && (
                        <Button
                          color="failure"
                          size="xs"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Booking Details Modal */}
      <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="text-center">
                <HiCalendar className="mx-auto mb-4 h-14 w-14 text-blue-400" />
                <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">
                  Booking Details
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Service Type:</span>
                  <span className="text-gray-900 dark:text-white">{selectedBooking.serviceType || 'General'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(selectedBooking.date)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Time:</span>
                  <span className="text-gray-900 dark:text-white">{selectedBooking.time || 'No time specified'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                  <span className="text-gray-900 dark:text-white">{formatDateTime(selectedBooking.createdAt)}</span>
                </div>
                
                {selectedBooking.notes && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Your Notes:</span>
                    <p className="text-gray-900 dark:text-white mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}
                
                {selectedBooking.adminNotes && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Admin Notes:</span>
                    <p className="text-blue-600 dark:text-blue-400 mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      {selectedBooking.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  color="gray"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}