import { Sidebar } from 'flowbite-react';
import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
  HiCalendar,
  HiMap,
  HiClipboardList,
  HiUserGroup,
  HiChartBar,
  HiQuestionMarkCircle
} from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      await fetch('/api/user/signout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.warn('Signout failed:', err.message);
    } finally {
      dispatch(signoutSuccess());
    }
  };

  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          {/* Admin Dashboard */}
          {currentUser?.isAdmin && (
            <Link to="/dashboard?tab=dash">
              <Sidebar.Item
                active={tab === 'dash' || !tab}
                icon={HiChartPie}
                as="div"
              >
                Dashboard
              </Sidebar.Item>
            </Link>
          )}

          {/* Profile */}
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              active={tab === 'profile'}
              icon={HiUser}
              label={currentUser?.isAdmin ? 'Admin' : 'User'}
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>

          {/* Posts (Admin only) */}
          {currentUser?.isAdmin && (
            <Link to="/dashboard?tab=posts">
              <Sidebar.Item
                active={tab === 'posts'}
                icon={HiDocumentText}
                as="div"
              >
                Posts
              </Sidebar.Item>
            </Link>
          )}

          {/* Wellness Appointments */}
          <Sidebar.Collapse icon={HiCalendar} label="Wellness Appointments">
            <Link to="/dashboard?tab=bookings">
              <Sidebar.Item
                active={tab === 'bookings'}
                icon={HiCalendar}
                as="div"
                className="ml-4"
              >
                Book Counseling
              </Sidebar.Item>
            </Link>
            <Link to="/dashboard?tab=my-bookings">
              <Sidebar.Item
                active={tab === 'my-bookings'}
                icon={HiClipboardList}
                as="div"
                className="ml-4"
              >
                My Bookings
              </Sidebar.Item>
            </Link>
            {currentUser?.isAdmin && (
              <Link to="/dashboard?tab=admin-bookings">
                <Sidebar.Item
                  active={tab === 'admin-bookings'}
                  icon={HiUserGroup}
                  as="div"
                  className="ml-4"
                >
                  View All Bookings
                </Sidebar.Item>
              </Link>
            )}
          </Sidebar.Collapse>

          {/* Admin-only Tabs */}
          {currentUser?.isAdmin && (
            <>
              <Link to="/dashboard?tab=users">
                <Sidebar.Item
                  active={tab === 'users'}
                  icon={HiOutlineUserGroup}
                  as="div"
                >
                  Users
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=comments">
                <Sidebar.Item
                  active={tab === 'comments'}
                  icon={HiAnnotation}
                  as="div"
                >
                  Comments
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=heatmap">
                <Sidebar.Item
                  active={tab === 'heatmap'}
                  icon={HiMap}
                  as="div"
                >
                  Welfare Heatmap
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=chat-analytics">
                <Sidebar.Item
                  active={tab === 'chat-analytics'}
                  icon={HiChartBar}
                  as="div"
                >
                  Chat Analytics
                </Sidebar.Item>
              </Link>
              <Link to="/admin/faqs">
                <Sidebar.Item
                  icon={HiQuestionMarkCircle}
                  as="div"
                >
                  Manage FAQs
                </Sidebar.Item>
              </Link>
            </>
          )}

          {/* Sign Out */}
          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignout}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
