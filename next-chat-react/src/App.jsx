import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SharedHeader from './components/SharedHeader';
import Navbar from './components/General/Navbar';
import Footer from './components/General/Footer';
import Home from './components/General/Home';
import About from './components/General/About';
import Help from './components/General/Help';
import Contact from './components/General/Contact';
import Register from './components/General/Register';
import AdminSidebar from './components/Admin/AdminSidebar';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import AdminRooms from './components/Admin/AdminRooms';
import AdminGroups from './components/Admin/AdminGroups';
import AdminContactMessages from './components/Admin/AdminContactMessages';
import AdminLogin from './components/Admin/AdminLogin';
import UserSidebar from './components/User/UserSidebar';
import ChatPanel from './components/User/ChatPanel';
import GroupsPanel from './components/User/GroupsPanel';
import CallsPanel from './components/User/CallsPanel';
import UserDashboard from './components/User/UserDashboard';
import UserLogin from './components/User/UserLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { clearNotifications, loadNotifications, saveNotifications } from './utils/notifications';
import { SocketProvider } from './context/SocketContext';

function App() {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => loadNotifications());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdminZone = location.pathname.startsWith('/admin') && !['/admin/login', '/adminlogin'].includes(location.pathname);
  const isUserZone = location.pathname.startsWith('/user') && location.pathname !== '/user/login';
  const isGeneralZone = !isAdminZone && !isUserZone && !['/admin/login', '/adminlogin', '/user/login'].includes(location.pathname);

  const toggleNotif = () => setNotifOpen(!notifOpen);
  const closeNotif = () => setNotifOpen(false);

  useEffect(() => {
    if (!notifOpen) return;
    // Mark as read when panel is opened
    const next = notifications.map(n => ({ ...n, read: true }));
    setNotifications(next);
    saveNotifications(next);
  }, [notifOpen]);

  useEffect(() => {
    const handler = (e) => setNotifications(e.detail || []);
    window.addEventListener("nc:notifications", handler);
    return () => window.removeEventListener("nc:notifications", handler);
  }, []);

  useEffect(() => {
    // Close panel on navigation to avoid “stuck open”
    setNotifOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const getHeaderInfo = () => {
    if (isAdminZone) {
      const titles = {
        '/admin': { title: 'Dashboard', sub: 'Welcome back, Super Admin' },
        '/admin/dashboard': { title: 'Dashboard', sub: 'Welcome back, Super Admin' },
        '/admin/users': { title: 'User Management', sub: 'Manage system users' },
        '/admin/groups': { title: 'Groups', sub: 'Manage group chats' },
        '/admin/rooms': { title: 'Rooms', sub: 'Manage direct chats' },
        '/admin/contact-messages': { title: 'Contact Messages', sub: 'Review contact form submissions' },
        '/admin/login': { title: 'Admin Sign In', sub: 'Authorised personnel only' }
      };
      return { ...(titles[location.pathname] || { title: 'Admin Panel', sub: 'Management' }), type: 'admin' };
    }
    if (isUserZone) {
      const titles = {
        '/user': { title: 'Messages', sub: 'Stay connected' },
        '/user/dashboard': { title: 'Dashboard', sub: 'Welcome back' },
        '/user/groups': { title: 'Groups', sub: 'Manage your rooms' },
        '/user/calls': { title: 'Calls', sub: 'Stay connected' },
        '/user/login': { title: 'Sign In', sub: 'Welcome back' }
      };
      return { ...(titles[location.pathname] || { title: 'User Panel', sub: 'Messages' }), type: 'user' };
    }
    return null;
  };

  const headerInfo = getHeaderInfo();

  return (
    <SocketProvider>
      <div className="nc-app">
        {isGeneralZone && <Navbar />}

        <div className={isAdminZone || isUserZone ? 'd-flex' : ''}>
          <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}></div>
          
          {isAdminZone && <AdminSidebar className={sidebarOpen ? 'open' : ''} />}
          {isUserZone && <UserSidebar className={sidebarOpen ? 'open' : ''} />}

          <div className={(isAdminZone || isUserZone) ? 'nc-main flex-grow-1' : ''}>
            {(isAdminZone || isUserZone) && headerInfo && (
              <SharedHeader 
                title={headerInfo.title} 
                sub={headerInfo.sub} 
                type={headerInfo.type} 
                onToggleNotif={toggleNotif}
                onCloseNotif={closeNotif}
                onClearNotif={() => { clearNotifications(); setNotifOpen(false); }}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                notifOpen={notifOpen}
                notifications={notifications}
                unreadCount={unreadCount}
              />
            )}

            <Routes>
              {/* General Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<UserLogin isShared />} />
              <Route path="/register" element={<Register />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute isAdmin><AdminDashboard isShared /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute isAdmin><AdminDashboard isShared /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute isAdmin><UserManagement isShared /></ProtectedRoute>} />
              <Route path="/admin/groups" element={<ProtectedRoute isAdmin><AdminGroups isShared /></ProtectedRoute>} />
              <Route path="/admin/rooms" element={<ProtectedRoute isAdmin><AdminRooms isShared /></ProtectedRoute>} />
              <Route path="/admin/contact-messages" element={<ProtectedRoute isAdmin><AdminContactMessages isShared /></ProtectedRoute>} />
              <Route path="/admin/login" element={<AdminLogin isShared />} />
              <Route path="/adminlogin" element={<AdminLogin isShared />} />

              {/* User Routes */}
              <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard isShared /></ProtectedRoute>} />
              <Route path="/user" element={<ProtectedRoute><ChatPanel isShared /></ProtectedRoute>} />
              <Route path="/user/groups" element={<ProtectedRoute><GroupsPanel isShared /></ProtectedRoute>} />
              <Route path="/user/calls" element={<ProtectedRoute><CallsPanel isShared /></ProtectedRoute>} />
              <Route path="/user/login" element={<UserLogin isShared />} />
            </Routes>
          </div>
        </div>

        {isGeneralZone && <Footer />}
      </div>
    </SocketProvider>
  );
}

export default App;
