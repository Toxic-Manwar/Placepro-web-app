import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Modals from './components/Modals';
import ToastContainer from './components/Toast';

import PublicLanding from './portals/PublicLanding';
import StudentPortal from './portals/StudentPortal';
import IndustryPortal from './portals/IndustryPortal';
import AcademicianPortal from './portals/AcademicianPortal';
import InstitutionPortal from './portals/InstitutionPortal';
import AdminPortal from './portals/AdminPortal';

import api from './services/apiClient';

export default function App() {
  const [currentRole, setCurrentRole] = useState('public');
  const [currentTab, setCurrentTab] = useState('student-dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  // In-App Non-Blocking Toast Notifications State
  const [toasts, setToasts] = useState([]);

  // Live Database States
  const [studentProfile, setStudentProfile] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [learningModules, setLearningModules] = useState([]);
  const [institutionAnalytics, setInstitutionAnalytics] = useState(null);

  // Show Toast Helper
  const showToast = useCallback((toastData) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, ...toastData }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper for opening modals with payload data
  const handleOpenModal = (modalName, data = null) => {
    setActiveModal(modalName);
    setModalData(data);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Load All Live Data from Database
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      // Ensure authenticated as demo student by default
      await api.auth.getDemoToken('STUDENT');

      const [profileRes, gapsRes, oppsRes, learningRes, analyticsRes] = await Promise.allSettled([
        api.student.getProfile(),
        api.student.getGaps(),
        api.opportunities.getAll(),
        api.student.getLearningPath(),
        api.institution.getAnalytics()
      ]);

      if (profileRes.status === 'fulfilled') {
        setStudentProfile(profileRes.value);
      }
      if (gapsRes.status === 'fulfilled') {
        setSkillGaps(gapsRes.value?.gaps || []);
      }
      if (oppsRes.status === 'fulfilled') {
        setOpportunities(oppsRes.value || []);
      }
      if (learningRes.status === 'fulfilled') {
        setLearningModules(learningRes.value?.modules || []);
      }
      if (analyticsRes.status === 'fulfilled') {
        setInstitutionAnalytics(analyticsRes.value);
      }
    } catch (err) {
      console.error('Error loading PlacePro live data:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Switch Portal Role
  const handleRoleChange = async (role) => {
    setCurrentRole(role);
    if (role === 'student') {
      await api.auth.getDemoToken('STUDENT');
      setCurrentTab('student-dashboard');
      fetchAllData();
    } else if (role === 'industry') {
      await api.auth.getDemoToken('INDUSTRY');
      setCurrentTab('industry-dashboard');
    } else if (role === 'academician') {
      await api.auth.getDemoToken('ACADEMICIAN');
      setCurrentTab('academician-dashboard');
    } else if (role === 'institution') {
      await api.auth.getDemoToken('INSTITUTION');
      setCurrentTab('institution-dashboard');
    } else if (role === 'admin') {
      setCurrentTab('admin-dashboard');
    } else {
      setCurrentTab('home');
    }
  };

  // 1-Click Apply Handler (Custom Non-Blocking PlacePro Toast)
  const handleApply = async (oppId) => {
    const opp = opportunities.find((o) => o.id === oppId);
    try {
      await api.opportunities.apply(oppId);
      showToast({
        type: 'success',
        title: 'Application Submitted',
        subtitle: opp?.title || 'Opportunity Application',
        company: opp?.company || 'PlacePro Partner',
        message: 'Your application is now live.',
        actionLabel: 'Track Applications',
        onAction: () => {
          handleRoleChange('student');
          setCurrentTab('student-applications');
        }
      });
      // Refresh opportunities and profile
      fetchAllData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Application Failed',
        subtitle: opp?.title,
        message: err.message || 'Could not submit application. Please try again.'
      });
    }
  };

  // Add Opportunity Handler (Industry Portal saves directly to Database)
  const handleAddOpportunity = async (newOppData) => {
    try {
      await api.opportunities.create(newOppData);
      showToast({
        type: 'success',
        title: 'Opportunity Published',
        subtitle: newOppData.title,
        message: 'The position has been posted and skill-matched to candidates.',
        actionLabel: 'View Candidate ATS',
        onAction: () => setCurrentTab('industry-candidates')
      });
      fetchAllData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Publishing Failed',
        message: err.message
      });
    }
  };

  // Update Candidate ATS Status (Industry Portal saves directly to Database)
  const handleStatusChange = async (appId, status) => {
    try {
      const res = await api.industry.updateStatus(appId, status);
      showToast({
        type: 'success',
        title: 'Candidate Status Updated',
        subtitle: `Status: ${status.replace('_', ' ')}`,
        message: res.message || 'Notification dispatched to candidate.'
      });
      fetchAllData();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Status Update Failed',
        message: err.message
      });
    }
  };

  // Filtered Opportunities based on Search
  const filteredOpportunities = opportunities.filter((o) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.title.toLowerCase().includes(term) ||
      o.company.toLowerCase().includes(term) ||
      (o.skills && o.skills.some((s) => s.toLowerCase().includes(term)))
    );
  });

  return (
    <div>
      {/* Ambient Atmospheric Glow */}
      <div className="ambient-glow">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
        <div className="glow-orb-3"></div>
      </div>

      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenModal={handleOpenModal}
        currentUser={studentProfile}
      />

      {/* Portal Container */}
      <div className="portal-container">
        {currentRole !== 'public' && (
          <Sidebar
            currentRole={currentRole}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            onOpenModal={handleOpenModal}
          />
        )}

        <main className="portal-content">
          {currentRole === 'public' && (
            <PublicLanding
              onRoleChange={handleRoleChange}
              onOpenModal={handleOpenModal}
            />
          )}

          {currentRole === 'student' && (
            <StudentPortal
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              studentProfile={studentProfile}
              skillGaps={skillGaps}
              opportunities={filteredOpportunities}
              onApply={handleApply}
              learningModules={learningModules}
              onRefreshData={fetchAllData}
              onOpenModal={handleOpenModal}
              onShowToast={showToast}
            />
          )}

          {currentRole === 'industry' && (
            <IndustryPortal
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              onOpenModal={handleOpenModal}
              onAddOpportunity={handleAddOpportunity}
              onRefreshData={fetchAllData}
              onStatusChange={handleStatusChange}
              onShowToast={showToast}
            />
          )}

          {currentRole === 'academician' && (
            <AcademicianPortal
              onRefreshData={fetchAllData}
              onShowToast={showToast}
            />
          )}

          {currentRole === 'institution' && (
            <InstitutionPortal
              analyticsData={institutionAnalytics}
              onRefreshData={fetchAllData}
              onShowToast={showToast}
            />
          )}

          {currentRole === 'admin' && <AdminPortal onShowToast={showToast} />}
        </main>
      </div>

      {/* Interactive Modals */}
      <Modals
        activeModal={activeModal}
        modalData={modalData}
        onCloseModal={handleCloseModal}
        onRoleChange={handleRoleChange}
        currentUser={studentProfile}
        onApply={handleApply}
        onStatusChange={handleStatusChange}
        onRefreshData={fetchAllData}
        onShowToast={showToast}
      />

      {/* Global Non-Blocking In-App Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
