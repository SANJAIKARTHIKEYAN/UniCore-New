import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import AdminStudents from '../../pages/admin/AdminStudents';
import AdminFaculty from '../../pages/admin/AdminFaculty';
import AdminCourses from '../../pages/admin/AdminCourses';
import AdminEnrollments from '../../pages/admin/AdminEnrollments';
import AdminReports from '../../pages/admin/AdminReports';
import AdminDepartments from '../../pages/admin/AdminDepartments';

export default function AdminLayout({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setActiveTab} currentUser={currentUser} />;
      case 'students':
        return <AdminStudents />;
      case 'faculty':
        return <AdminFaculty />;
      case 'courses':
        return <AdminCourses />;
      case 'enrollments':
        return <AdminEnrollments />;
      case 'reports':
        return <AdminReports />;
      case 'departments':
        return <AdminDepartments />;
      default:
        return <AdminDashboard onNavigate={setActiveTab} currentUser={currentUser} />;
    }
  };

  return (
    <div className="admin-portal-layout faculty-portal-layout student-portal-layout">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
      />
      <main className="admin-portal-content student-portal-content">
        {renderPage()}
      </main>
    </div>
  );
}
