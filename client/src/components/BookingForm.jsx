// client/src/components/BookingForm.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Label, Select, TextInput, Textarea, Spinner } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

const BookingForm = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    const saved = localStorage.getItem('pendingBooking');
    if (saved && currentUser) {
      setFormData(JSON.parse(saved));
      localStorage.removeItem('pendingBooking');
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', content: '' });
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      if (!formData.appointmentType || !formData.preferredDate || !formData.preferredTime) {
        throw new Error('Please fill in all required fields.');
      }

      if (!currentUser) {
        localStorage.setItem('pendingBooking', JSON.stringify(formData));
        setMessage({ type: 'error', content: 'Redirecting to login...' });
        setTimeout(() => navigate('/sign-in'), 2000);
        return;
      }

      const bookingPayload = {
        studentId: currentUser._id,
        fullName: currentUser.username,
        email: currentUser.email,
        appointmentType: formData.appointmentType,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        additionalNotes: formData.additionalNotes || ''
      };

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ critical for cookie-based auth
        body: JSON.stringify(bookingPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');

      setMessage({
        type: 'success',
        content: 'Booking submitted successfully! You will receive a confirmation email shortly.'
      });

      setFormData({
        appointmentType: '',
        preferredDate: '',
        preferredTime: '',
        additionalNotes: ''
      });
    } catch (err) {
      setMessage({ type: 'error', content: err.message });
    } finally {
      setLoading(false);
    }
  };

  const appointmentTypes = [
    'Mental Health Support',
    'Academic Counseling',
    'Career Guidance',
    'Medical Consultation',
    'Counseling Session',
    'Other'
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
        Book a Wellness Appointment
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
        Schedule your counseling or medical appointment with our wellness team
      </p>

      {message.content && (
        <Alert color={message.type === 'error' ? 'failure' : 'success'} className="mb-4">
          {message.content}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="appointmentType" value="Appointment Type *" />
          <Select
            id="appointmentType"
            name="appointmentType"
            required
            value={formData.appointmentType}
            onChange={handleChange}
          >
            <option value="">Select appointment type</option>
            {appointmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preferredDate" value="Preferred Date *" />
            <TextInput
              type="date"
              name="preferredDate"
              id="preferredDate"
              min={getMinDate()}
              required
              value={formData.preferredDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="preferredTime" value="Preferred Time *" />
            <Select
              name="preferredTime"
              id="preferredTime"
              required
              value={formData.preferredTime}
              onChange={handleChange}
            >
              <option value="">Select time slot</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="additionalNotes" value="Additional Notes (Optional)" />
          <Textarea
            name="additionalNotes"
            id="additionalNotes"
            rows={4}
            maxLength={500}
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Any additional info or special requests..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.additionalNotes.length}/500 characters
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Submitting Booking...
            </>
          ) : (
            'Submit Booking Request'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Need immediate help? Contact our wellness team at{' '}
          <a
            href="mailto:wellness@africau.edu"
            className="text-blue-600 hover:underline"
          >
            wellness@africau.edu
          </a>{' '}
          or call our helpline.
        </p>
      </div>
    </div>
  );
};

export default BookingForm;
