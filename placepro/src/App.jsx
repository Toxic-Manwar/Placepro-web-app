import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Modals from './components/Modals';

import PublicLanding from './portals/PublicLanding';
import StudentPortal from './portals/StudentPortal';
import IndustryPortal from './portals/IndustryPortal';
import AcademicianPortal from './portals/AcademicianPortal';
import InstitutionPortal from './portals/InstitutionPortal';
import AdminPortal from './portals/AdminPortal';

import {
  INITIAL_ASSESSMENT,
  INITIAL_OPPORTUNITIES,
  INITIAL_MOCK_TESTS,
  INITIAL_APPLICATIONS
} from './data/mockData';

export default function App() {
  const [currentRole, setCurrentRole] = useState('public');
  const [currentTab, setCurrentTab] = useState('student-dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  // Application Data State
  const [assessment, setAssessment] = useState(INITIAL_ASSESSMENT);
  const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
  const [mockTests] = useState(INITIAL_MOCK_TESTS);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

  // Switch Portal Role
  const handleRoleChange = (role) => {
    setCurrentRole(role);
    if (role === 'student') setCurrentTab('student-dashboard');
    else if (role === 'industry') setCurrentTab('industry-dashboard');
    else if (role === 'academician') setCurrentTab('academician-dashboard');
    else if (role === 'institution') setCurrentTab('institution-dashboard');
    else if (role === 'admin') setCurrentTab('admin-dashboard');
    else setCurrentTab('home');
  };

  // 1-Click Apply Handler
  const handleApply = (oppId) => {
    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp) return;

    // Update opportunity state
    setOpportunities((prev) =>
      prev.map((item) => (item.id === oppId ? { ...item, applied: true, status: 'under_review' } : item))
    );

    // Add to applications
    setApplications((prev) => [
      {
        id: `APP${Date.now()}`,
        opportunityId: opp.id,
        title: opp.title,
        company: opp.company,
        status: 'applied',
        date: 'Just Now',
        match: opp.matchScore
      },
      ...prev
    ]);

    alert(`Successfully applied for ${opp.title} at ${opp.company}! Your application is now live.`);
  };

  // Add Opportunity Handler (for Industry Portal)
  const handleAddOpportunity = (newOpp) => {
    setOpportunities((prev) => [newOpp, ...prev]);
  };

  // Filtered Opportunities based on Search
  const filteredOpportunities = opportunities.filter((o) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.title.toLowerCase().includes(term) ||
      o.company.toLowerCase().includes(term) ||
      o.skills.some((s) => s.toLowerCase().includes(term))
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
        onOpenModal={setActiveModal}
      />

      {/* Portal Container */}
      <div className="portal-container">
        {currentRole !== 'public' && (
          <Sidebar
            currentRole={currentRole}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            onOpenModal={setActiveModal}
          />
        )}

        <main className="portal-content">
          {currentRole === 'public' && (
            <PublicLanding
              onRoleChange={handleRoleChange}
              onOpenModal={setActiveModal}
            />
          )}

          {currentRole === 'student' && (
            <StudentPortal
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              assessment={assessment}
              setAssessment={setAssessment}
              opportunities={filteredOpportunities}
              onApply={handleApply}
              mockTests={mockTests}
              applications={applications}
              onOpenModal={setActiveModal}
            />
          )}

          {currentRole === 'industry' && (
            <IndustryPortal
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              onOpenModal={setActiveModal}
              onAddOpportunity={handleAddOpportunity}
            />
          )}

          {currentRole === 'academician' && <AcademicianPortal />}

          {currentRole === 'institution' && <InstitutionPortal />}

          {currentRole === 'admin' && <AdminPortal />}
        </main>
      </div>

      {/* Interactive Modals */}
      <Modals
        activeModal={activeModal}
        onCloseModal={() => setActiveModal(null)}
        onRoleChange={handleRoleChange}
      />
    </div>
  );
}
