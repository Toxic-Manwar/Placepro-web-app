import React from 'react';
import {
  Globe,
  GraduationCap,
  Building2,
  Microscope,
  Landmark,
  Shield,
  Search,
  Bell,
  MessageSquare,
  Network
} from 'lucide-react';

export default function Navbar({
  currentRole,
  onRoleChange,
  searchTerm,
  onSearchChange,
  onOpenModal,
  currentUser
}) {
  const roles = [
    { id: 'public', label: 'Home', icon: Globe },
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'industry', label: 'Industry', icon: Building2 },
    { id: 'academician', label: 'Faculty', icon: Microscope },
    { id: 'institution', label: 'University', icon: Landmark },
    { id: 'admin', label: 'Admin', icon: Shield }
  ];

  return (
    <header className="top-header">
      <div className="brand-section" onClick={() => onRoleChange('public')}>
        <div className="brand-logo-icon">
          <Network size={22} />
        </div>
        <div>
          <div className="brand-title">PlacePro</div>
          <div className="brand-badge">Academia-Industry Portal</div>
        </div>
      </div>

      {/* Multi-Role Switcher with Crisp Lucide Icons */}
      <nav className="portal-switcher">
        {roles.map((r) => {
          const IconComponent = r.icon;
          return (
            <button
              key={r.id}
              className={`portal-btn ${currentRole === r.id ? 'active' : ''}`}
              onClick={() => onRoleChange(r.id)}
            >
              <IconComponent size={15} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Header Actions */}
      <div className="header-actions">
        <div className="header-search">
          <Search className="header-search-icon" size={15} />
          <input
            type="text"
            placeholder="Search roles, skills, tests..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button
          className="icon-btn"
          title="Notifications"
          onClick={() => onOpenModal('notifications')}
        >
          <Bell size={17} />
          <span className="badge-dot"></span>
        </button>

        <button
          className="icon-btn"
          title="Messages"
          onClick={() => onOpenModal('messages')}
        >
          <MessageSquare size={17} />
        </button>

        <div className="user-chip" onClick={() => onOpenModal('profile')}>
          <div className="user-avatar">
            {currentUser?.fullName ? currentUser.fullName.split(' ').map((n) => n[0]).join('') : 'JD'}
          </div>
          <div className="user-name-role">
            <span className="user-name">{currentUser?.fullName || 'John Developer'}</span>
            <span className="user-role-tag">
              {currentRole === 'student' ? 'Student Member' : currentRole === 'industry' ? 'Corporate Recruiter' : currentRole === 'institution' ? 'University TPO' : 'Faculty Member'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
