import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import Nav from "./components/Nav";
import HamburgerMenu from "./components/HamburgerMenu";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import Argos from "./pages/Argos";
import New from "./pages/New";
import Reports from "./pages/Reports";
import All from "./pages/All";
import Login from "./pages/Login";
import DocumentCollector from "./pages/doc/DocumentCollector";
import Domains from "./pages/doc/Domains";
import Qa from "./pages/qa/Qa";
import QaDashboard from "./pages/Argos pages/QaDashboard";
import QaPage from "./pages/doc/QaPage";
import ChangePass from "./pages/ChangePass";
import AddProjects from "./pages/AddProjects";
import Leaderboard from "./pages/Leaderboard";
import AllProjectsPage from "./pages/PM/AllProjectsPage";
import Announcement from "./pages/Announcement";
import ChangeRole from "./pages/ChangeRole";
import CreateTask from "./pages/PM/CreateTask";
import ClaudeAiIndex from "./pages/Claude AI/ClaudeAiIndex";
import NewProjectTracker from "./pages/PM/NewProjectTracker";
import ClaudeQuestion from "./pages/Claude AI/ClaudeQuestion";
import ClaudeCollection from "./pages/Claude AI/ClaudeCollection";
import { useProjectContext } from "./contextapi/allcontext";
import ProjectTaskTable from "./pages/PM/ProjectTaskTable";
import UpdateTaskDetails from "./pages/PM/UpdateTaskDetails";
import KanbanBoard from "./pages/PM/KanbanBoard";
import Timeline from "./pages/PM/Timeline";
import SummaryView from "./pages/PM/SummaryView";
import ProjectBacklog from "./pages/PM/ProjectBacklog";
import ProjectManagementLayout from "./pages/PM/ProjectManagementLayout";
import EditTaskComponent from "./pages/PM/EditTaskComponent";
import Trainings from "./pages/PM/Trainings";
import ApproveTasks from "./pages/PM/ApproveTasks";
import Logs from "./pages/Logs";

function App() {
  const { setUser, user } = useProjectContext();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize AOS animation library
    AOS.init();
    // Check localStorage for user data when component mounts
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user"); // Clear invalid data
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    // Store user data in localStorage
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const isProjectManagement = location.pathname.startsWith("/project-management");

  // Show loading state while checking stored user
  if (isLoading) {
    return null;
  }

  return (
    <>
      {!isProjectManagement && (
        <>
          <Nav user={user} onLogout={handleLogout} />
          <HamburgerMenu />
        </>
      )}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/"
          element={user ? <Projects /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/:PROJECT_ROUTE/:PROJECT_ID"
          element={user ? <Project /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/DomainManagement/:PROJECT_ID"
          element={user ? <Argos /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/DomainManagement/doc"
          element={user ? <DocumentCollector /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/DomainManagement/doc/domains"
          element={user ? <Domains /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/DomainManagement/doc/domains/qapage"
          element={user ? <QaPage user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/DomainManagement/:PROJECT_ID/projects/DomainManagement/doc/domains"
          element={user ? <Domains /> : <Navigate to="/login" />}
        />
        <Route
          path="/all"
          element={user ? <All /> : <Navigate to="/login" />}
        />
        <Route
          path="/new"
          element={user ? <New /> : <Navigate to="/login" />}
        />
        <Route
          path="/reports"
          element={user ? <Reports /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/DomainManagement/qa/:tableId"
          element={user ? <QaDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/change-password"
          element={user ? <ChangePass /> : <Navigate to="/login" />}
        />
        <Route
          path="/leaderboard"
          element={user ? <Leaderboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/announcement"
          element={user ? <Announcement /> : <Navigate to="/login" />}
        />
        <Route
          path="/logs"
          element={user ? <Logs /> : <Navigate to="/login" />}
        />
        <Route
          path="/change-role"
          element={user ? <ChangeRole /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/ClaudeAI/:id"
          element={user ? <ClaudeAiIndex /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/ClaudeAI/Collection"
          element={user ? <ClaudeCollection /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/ClaudeAI/:id/:id"
          element={user ? <ClaudeQuestion /> : <Navigate to="/login" />}
        />
        <Route
          path="/project-management/*"
          element={
            user ? (
              <ProjectManagementLayout>
                <Routes>
                  <Route index element={<AllProjectsPage />} />
                  <Route path="summary" element={<SummaryView />} />
                  <Route path="timeline" element={<Timeline />} />
                  <Route path="backlog" element={<ProjectBacklog />} />
                  <Route path="list" element={<ProjectTaskTable />} />
                  <Route path="board" element={<KanbanBoard />}/>
                  <Route path="new" element={<NewProjectTracker />} />
                  <Route path="update-tracker" element={<UpdateTaskDetails />} />
                  <Route path="update-tracker/add-task" element={<CreateTask />} />
                  <Route path="update-tracker/edit-task" element={<EditTaskComponent />} />
                  <Route path="trainings" element={<Trainings />} />
                  <Route path="approve-tasks" element={<ApproveTasks />} />
                </Routes>
              </ProjectManagementLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;