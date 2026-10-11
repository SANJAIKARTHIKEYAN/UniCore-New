import React, { useState } from 'react';
import StudentSidebar from './StudentSidebar';
import StudentDashboard from '../../pages/student/StudentDashboard';
import StudentProfile from '../../pages/student/StudentProfile';
import StudentAttendance from '../../pages/student/StudentAttendance';
import StudentAcademicPerformance from '../../pages/student/StudentAcademicPerformance';
import StudentResults from '../../pages/student/StudentResults';
import StudentAdvisor from '../../pages/student/StudentAdvisor';
import StudentFees from '../../pages/student/StudentFees';
import StudentDocuments from '../../pages/student/StudentDocuments';
import StudentNotifications from '../../pages/student/StudentNotifications';

export default function StudentLayout({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboard onNavigate={setActiveTab} currentUser={currentUser} />;
      case 'profile':
        return <StudentProfile currentUser={currentUser} />;
      case 'attendance':
        return <StudentAttendance />;
      case 'academic':
        return <StudentAcademicPerformance />;
      case 'results':
        return <StudentResults />;
      case 'advisor':
      case 'risk':
        return <StudentAdvisor />;
      case 'fees':
        return <StudentFees />;
      case 'documents':
        return <StudentDocuments />;
      case 'notifications':
        return <StudentNotifications />;
      default:
        return <StudentDashboard onNavigate={setActiveTab} currentUser={currentUser} />;
    }
  };

  return (
    <div className="student-portal-layout">
      <StudentSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
      />
      <main className="student-portal-content">
        {renderPage()}
      </main>
    </div>
  );
}
