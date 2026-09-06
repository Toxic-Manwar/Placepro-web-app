import React from 'react';
import {
  BookOpenCheck,
  Lightbulb,
  Users2,
  ChevronRight
} from 'lucide-react';

export default function AcademicianPortal() {
  return (
    <div className="view-section active">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Academician & Faculty Portal</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Faculty development programs, industrial consultancy, and research collaboration.
        </p>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">
            <BookOpenCheck size={18} color="var(--primary-light)" />
            FDP Programs
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0 16px', lineHeight: 1.5 }}>
            Apply for industry immersion programs with NVIDIA, Google Cloud, and Microsoft Research.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => alert('Viewing 12 active FDP programs.')}>
            Explore FDP Bids <ChevronRight size={14} />
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            <Lightbulb size={18} color="var(--accent-amber)" />
            Industrial Consultancy
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0 16px', lineHeight: 1.5 }}>
            Provide expert consultancy on industrial R&D projects with verified compensation.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => alert('Browsing 8 industry consultancy RFPs.')}>
            View Open Projects <ChevronRight size={14} />
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            <Users2 size={18} color="var(--secondary)" />
            Student Mentorship
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0 16px', lineHeight: 1.5 }}>
            Guide and evaluate assigned student interns working across enterprise live projects.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={() => alert('Opening student mentorship schedule.')}>
            Manage Mentorships <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
