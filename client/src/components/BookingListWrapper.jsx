// client/src/components/BookingListWrapper.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import AdminBookingList from './AdminBookingList';
import MyBookingList from './MyBookingList';

export default function BookingListWrapper() {
  const { currentUser } = useSelector((state) => state.user);
  
  // Check if user is admin
  const isAdmin = currentUser?.isAdmin || false;
  
  // Render appropriate component based on user role
  return (
    <div>
      {isAdmin ? <AdminBookingList /> : <MyBookingList />}
    </div>
  );
}