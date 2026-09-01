import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ScrollToTop from "./ScrollToTop";
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { AlumniAuthProvider } from './context/AlumniAuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';

// Import NexusHub CSS
import './nexushub.css';

// Admin Page Routes
import AdminKaLogin from './pages/Admin/AdminKaLogin.jsx';
import AdminKaHome from './pages/Admin/AdminKaHome.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDirectory from './pages/Admin/AdminDirectory.jsx';
import AdminAddAlumni from './pages/Admin/AdminAddAlumni.jsx';
import AdminInternship from './pages/Admin/AdminInternship.jsx';
import AdminMentorship from './pages/Admin/AdminMentorship.jsx';
import AdminAlumniMeet from './pages/Admin/AdminAlumniMeet.jsx';
import AdminEvent from './pages/Admin/AdminEvent.jsx';

// Alumni Page Routes
import AlumniLogin from './pages/Alumni/AlumniLogin.jsx';
import AlumniKaHome from './pages/Alumni/AlumniKaHome.jsx';
import AlumniKaMentorship from './pages/Alumni/Mentorship.jsx'
import AlumniKaInternship from './pages/Alumni/Internship.jsx'
import AlumniKaFAQ from './pages/Alumni/FAQ.jsx'
import AlumniKaResources from './pages/Alumni/StudyResources.jsx'
import AlumniProtectedRoute from './components/alumniProtectedRoute.jsx';
import AlumniMeet from './pages/Alumni/AlumniMeet.jsx';
import AlumniEvent from './pages/Alumni/AlumniEvent.jsx';
import DonationPortal from './pages/Alumni/DonationPortal.jsx';

// NexusHub Page Routes
import NexusHubIndex from './pages/NexusHub/Index.jsx';
import NexusHubAlumni from './pages/NexusHub/Alumni.jsx';
import NexusHubHallOfFame from './pages/NexusHub/HallOfFame.jsx';
import NexusHubInternship from './pages/NexusHub/Internship.jsx';
import NexusHubMentorship from './pages/NexusHub/Mentorship.jsx';
import NexusHubNotFound from './pages/NexusHub/NotFound.jsx';
import NexusHubEvents from './pages/NexusHub/StudentEvent.jsx';
import Features from './pages/NexusHub/Features.jsx';
import GetStarted from './pages/NexusHub/About.jsx';

// Essential Pages Routes 
import TermsOfService from './pages/essential/TermsOfService.jsx';
import CookiePolicy from './pages/essential/CookiePolicy.jsx';
import PrivacyPolicy from './pages/essential/PrivacyPolicy.jsx';
import Accessibility from './pages/essential/Accessibility.jsx';
import FAQ from './pages/essential/FAQ.jsx';

import './index.css';



// Admin layout with context provider
const AdminLayout = () => {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
};

// Alumni layout with context provider
const AlumniLayout = () => {
  return (
    <AlumniAuthProvider>
      <Outlet />
    </AlumniAuthProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin-login" element={<AdminKaLogin />} />
      <Route path="/alumni-login" element={<AlumniLogin />} />
      <Route path="/not-found" element={<NexusHubNotFound />} />
      
      
      {/* NexusHub Routes */}
      <Route path="/NexusHub" element={<NexusHubIndex />} />
      <Route path="/NexusHub/alumni" element={<NexusHubAlumni />} />
      <Route path="/NexusHub/hall-Of-Fame" element={<NexusHubHallOfFame />} />
      <Route path="/NexusHub/internships" element={<NexusHubInternship />} />
      <Route path="/NexusHub/mentorship" element={<NexusHubMentorship />} />
      <Route path="/NexusHub/events" element={<NexusHubEvents />} />
      <Route path="/NexusHub/Features" element={<Features />} />
      <Route path="/NexusHub/GetStarted" element={<GetStarted />} />
      
      {/* Protected Alumni Routes */}
      <Route element={<AlumniLayout />}>
      <Route path="/alumni-home" element={<AlumniProtectedRoute><AlumniKaHome /></AlumniProtectedRoute>} />
      <Route path="/alumni-mentorship" element={<AlumniProtectedRoute><AlumniKaMentorship /></AlumniProtectedRoute>} />
      <Route path="/alumni-internship" element={<AlumniProtectedRoute><AlumniKaInternship /></AlumniProtectedRoute>} />
      <Route path="/alumni-faq" element={<AlumniProtectedRoute><AlumniKaFAQ /></AlumniProtectedRoute>} />
      <Route path="/alumni-studyresources" element={<AlumniProtectedRoute><AlumniKaResources /></AlumniProtectedRoute>} />
      <Route path="/alumni-meet" element={<AlumniProtectedRoute><AlumniMeet /></AlumniProtectedRoute>} />
      <Route path="/alumni-event" element={<AlumniProtectedRoute><AlumniEvent /></AlumniProtectedRoute>} />
      <Route path="/alumni-donation" element={<AlumniProtectedRoute><DonationPortal /></AlumniProtectedRoute>} />
      </Route>
      
      {/* Admin Routes under AdminAuthProvider context */}
      <Route element={<AdminLayout />}>
        <Route path="/admin-home" element={<ProtectedRoute><AdminKaHome /></ProtectedRoute>} />
        <Route path="/admin-Directory" element={<ProtectedRoute><AdminDirectory /></ProtectedRoute>} />
        <Route path="/admin-AddAlumni" element={<ProtectedRoute><AdminAddAlumni /></ProtectedRoute>} />
        <Route path="/admin-Internship" element={<ProtectedRoute><AdminInternship /></ProtectedRoute>} />
        <Route path="/admin-Mentorship" element={<ProtectedRoute><AdminMentorship /></ProtectedRoute>} />
        <Route path="/admin-alumni-meet" element={<ProtectedRoute><AdminAlumniMeet /></ProtectedRoute>} />
        <Route path="/admin-event" element={<ProtectedRoute><AdminEvent /></ProtectedRoute>} />
      </Route>

       {/* Essentail Routes */}
       <Route path="/TermsOfService" element={<TermsOfService />} />
       <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
       <Route path="/CookiePolicy" element={<CookiePolicy />} />
       <Route path="/Accessibility" element={<Accessibility />} />
       <Route path="/FAQ" element={<FAQ />} />

      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  </BrowserRouter>
);