import React from 'react';
import {
  LayoutDashboard,
  Target,
  Briefcase,
  Award,
  FileCheck2,
  FolderGit2,
  KanbanSquare,
  BookOpen,
  Building2,
  PlusCircle,
  Users,
  Microscope,
  Landmark,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ currentRole, currentTab, onTabChange, onOpenModal }) {
  const getNavItems = () => {
    switch (currentRole) {
      case 'student':
        return [
          { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'student-assessment', label: 'Skill Assessment', icon: Target, badge: 'New' },
          { id: 'student-internships', label: 'Internships', icon: Briefcase },
          { id: 'student-jobs', label: 'Jobs & Placements', icon: Award },
          { id: 'student-mock-tests', label: 'Mock Tests', icon: FileCheck2 },
          { id: 'student-portfolio', label: 'Digital Portfolio', icon: FolderGit2 },
          { id: 'student-applications', label: 'Track Applications', icon: KanbanSquare },
          { id: 'student-learning', label: 'Learning Resources', icon: BookOpen }
        ];
      case 'industry':
        return [
          { id: 'industry-dashboard', label: 'Company Overview', icon: Building2 },
          { id: 'industry-post-opportunity', label: 'Post Opportunity', icon: PlusCircle },
          { id: 'industry-candidates', label: 'Candidate ATS', icon: Users, badge: '12 New' }
        ];
      case 'academician':
        return [
          { id: 'academician-dashboard', label: 'Faculty Dashboard', icon: Microscope }
        ];
      case 'institution':
        return [
          { id: 'institution-dashboard', label: 'University Command', icon: Landmark }
        ];
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Platform Control', icon: Shield }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  if (navItems.length === 0) return null;

  return (
    <aside className="portal-sidebar">
      <div>
        <div className="nav-section-title">Navigation Menu</div>
        <ul className="sidebar-nav-list">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <div
                  className={`sidebar-link ${currentTab === item.id ? 'active' : ''}`}
                  onClick={() => onTabChange(item.id)}
                >
                  <span className="nav-icon">
                    <IconComponent size={17} />
                  </span>
                  <span>{item.label}</span>
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="card" style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.06)', borderColor: 'rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#a5b4fc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={14} /> Need Assistance?
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Contact the 24/7 university & industry support desk.
          </div>
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => onOpenModal('help')}>
            Support Desk
          </button>
        </div>
      </div>
    </aside>
  );
}
