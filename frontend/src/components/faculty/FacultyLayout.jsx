import React, { useState, useEffect } from 'react';
import FacultySidebar from './FacultySidebar';
import FacultyDashboard from '../../pages/faculty/FacultyDashboard';
import FacultyCourses from '../../pages/faculty/FacultyCourses';
import FacultyCourseRoster from '../../pages/faculty/FacultyCourseRoster';
import FacultyAttendance from '../../pages/faculty/FacultyAttendance';
import FacultyAssessments from '../../pages/faculty/FacultyAssessments';
import FacultyRiskOverview from '../../pages/faculty/FacultyRiskOverview';
import FacultyProfile from '../../pages/faculty/FacultyProfile';

export default function FacultyLayout({ currentUser, onLogout, initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [previousTab, setPreviousTab] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleNavigate = (tab) => {
    setActiveTab((prev) => {
      if (prev !== tab) {
        setPreviousTab(prev);
      }
      return tab;
    });
  };

  const handleBackFromRisk = () => {
    const validTabs = ['dashboard', 'courses', 'roster', 'attendance', 'assessments', 'profile'];
    const target = (previousTab && validTabs.includes(previousTab) && previousTab !== 'risk')
      ? previousTab
      : 'dashboard';
    setActiveTab(target);
  };

  useEffect(() => {
    const handleFacultyNav = (e) => {
      if (e.detail?.tab) {
        handleNavigate(e.detail.tab);
      }
    };
    window.addEventListener('unicore:faculty-navigate', handleFacultyNav);
    return () => window.removeEventListener('unicore:faculty-navigate', handleFacultyNav);
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <FacultyDashboard
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
            currentUser={currentUser}
          />
        );
      case 'courses':
        return (
          <FacultyCourses
            selectedCourseId={selectedCourseId}
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'roster':
        return (
          <FacultyCourseRoster
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'attendance':
        return (
          <FacultyAttendance
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'assessments':
        return (
          <FacultyAssessments
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'risk':
        return (
          <FacultyRiskOverview
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
            onBack={handleBackFromRisk}
            onNavigate={handleNavigate}
            previousTab={previousTab}
          />
        );
      case 'profile':
        return <FacultyProfile currentUser={currentUser} />;
      default:
        return (
          <FacultyDashboard
            onNavigate={handleNavigate}
            onSelectCourse={handleSelectCourse}
            currentUser={currentUser}
          />
        );
    }
  };

  return (
    <div className="faculty-portal-layout student-portal-layout">
      <FacultySidebar
        activeTab={activeTab}
        onTabChange={handleNavigate}
        currentUser={currentUser}
      />
      <main className="faculty-portal-content student-portal-content">
        {renderPage()}
      </main>
    </div>
  );
}

