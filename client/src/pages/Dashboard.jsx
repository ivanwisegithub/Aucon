import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import DashPosts from '../components/DashPosts';
import DashUsers from '../components/DashUsers';
import DashComments from '../components/DashComments';
import DashboardComp from '../components/DashboardComp';
import BookingForm from '../components/BookingForm';
import FeedbackTracker from '../components/FeedbackTracker';
import WelfareHeatMap from '../components/WelfareHeatMap';
import AdminBookingList from '../components/AdminBookingList';
import MyBookingList from '../components/MyBookingList';
import ChatAnalytics from '../components/ChatAnalytics';
import { Alert, Spinner } from 'flowbite-react';

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('profile');
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const validTabs = [
    'profile',
    'posts',
    'users',
    'comments',
    'dash',
    'bookings',
    'tracker',
    'heatmap',
    'admin-bookings',
    'my-bookings',
    'chat-analytics' // ✅ New tab added here
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="md:w-60 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
        <DashSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 text-white">
        {/* Shared Tabs */}
        {tab === 'profile' && <DashProfile />}
        {tab === 'bookings' && !isAdmin && <BookingForm />}
        {tab === 'my-bookings' && !isAdmin && <MyBookingList />}
        {tab === 'tracker' && !isAdmin && <FeedbackTracker />}

        {/* Admin Tabs */}
        {isAdmin && tab === 'posts' && <DashPosts />}
        {isAdmin && tab === 'users' && <DashUsers />}
        {isAdmin && tab === 'comments' && <DashComments />}
        {isAdmin && tab === 'dash' && <DashboardComp />}
        {isAdmin && tab === 'admin-bookings' && <AdminBookingList />}
        {isAdmin && tab === 'heatmap' && <WelfareHeatMap />}
        {isAdmin && tab === 'chat-analytics' && <ChatAnalytics />} {/* ✅ New tab rendered here */}

        {/* Error Tab */}
        {tab === 'error' && (
          <div className="max-w-2xl mx-auto mt-6">
            <Alert color="failure">An error occurred while loading the dashboard.</Alert>
          </div>
        )}

        {/* Loading Placeholder */}
        {tab === 'loading' && (
          <div className="flex justify-center mt-10">
            <Spinner size="xl" />
          </div>
        )}

        {/* Fallbacks */}
        {!tab && (
          <div className="text-center mt-10 text-gray-500">
            Please select a tab from the sidebar.
          </div>
        )}
        {tab && !validTabs.includes(tab) && (
          <div className="text-center mt-10 text-red-400">
            Unknown tab: <strong>{tab}</strong>. Please select a valid tab.
          </div>
        )}
      </div>
    </div>
  );
}
