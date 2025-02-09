import React, { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AiOutlineFileText, AiOutlineClockCircle } from "react-icons/ai";
import { BsHourglassSplit, BsSearch } from "react-icons/bs";
import { FaList, FaCheckDouble } from "react-icons/fa";
import { RiKanbanView2, RiArrowDownSLine } from "react-icons/ri";
import { FiGrid } from "react-icons/fi";
import { IoBugOutline } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi";
import ProjectForm from "./ProjectForm";
import "aos/dist/aos.css";
import { SiGoogleclassroom } from "react-icons/si";

const SideNav = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div
      className="w-60 bg-white shadow-lg h-full fixed left-0 top-16 py-1"
      // data-aos="fade-in"
      // data-aos-duration="500"
      // data-aos-easing="ease-in-out"
    >
      <div className="flex flex-col">
        <div className="text-blue-500 px-5 py-2 text-lg text-center">
          <span className="font-bold mb-2">
            Hi, {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}{" "}
            {user?.email.split("@")[0].charAt(0).toUpperCase() +
              user?.email.split("@")[0].slice(1)}
          </span>
        </div>

        <hr />
        
        {/* <div className="border-t border-gray-200 my-1" /> */}

        <NavLink
          to="/project-management"
          end
          className={({ isActive }) =>
            `mt-3 flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 ${
              isActive
                ? "bg-blue-100 text-blue-700 rounded-l-full border-blue-500 border-l-4 font-medium"
                : ""
            }`
          }
        >
          <FiGrid className="mr-3 text-blue-600" /> All Projects
        </NavLink>
        <NavLink
          to="/project-management/summary"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 ${
              isActive
                ? "bg-blue-100 text-blue-700 rounded-l-full border-blue-500 border-l-4 font-medium"
                : ""
            }`
          }
        >
          <AiOutlineFileText className="mr-3 text-blue-600" /> Summary
        </NavLink>
        <NavLink
          to="/project-management/timeline"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 ${
              isActive
                ? "bg-blue-100 text-blue-700 rounded-l-full border-blue-500 border-l-4 font-medium"
                : ""
            }`
          }
        >
          <AiOutlineClockCircle className="mr-3 text-blue-600" /> Timeline
        </NavLink>
        <NavLink
          to="/project-management/backlog"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 ${
              isActive
                ? "bg-blue-100 text-blue-700 rounded-l-full border-blue-500 border-l-4 font-medium"
                : ""
            }`
          }
        >
          <BsHourglassSplit className="mr-3 text-blue-600" /> Backlog
        </NavLink>
        <NavLink
          to="/project-management/list"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 ${
              isActive
                ? "bg-blue-100 text-blue-700 rounded-l-full border-blue-500 border-l-4 font-medium"
                : ""
            }`
          }
        >
          <FaList className="mr-3 text-blue-600" /> List
        </NavLink>
        <NavLink
          to="/project-management/board"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 ${
              isActive
                ? "bg-blue-100 text-blue-700 rounded-l-full border-blue-500 border-l-4 font-medium"
                : ""
            }`
          }
        >
          <RiKanbanView2 className="mr-3 text-blue-600" /> Board
        </NavLink>
        <NavLink
          to="/project-management/trainings"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 ${
              isActive
                ? "bg-blue-100 text-blue-700 rounded-l-full border-blue-500 border-l-4 font-medium"
                : ""
            }`
          }
        >
          <SiGoogleclassroom className="mr-3 text-blue-600" /> Trainings
        </NavLink>
        {user && user.role === "Admin" ? (
          <>
            <NavLink
              to="/project-management/approve-tasks"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-blue-700 rounded-l-full border-blue-500 border-l-4 font-medium"
                    : ""
                }`
              }
            >
              <FaCheckDouble className="mr-3 text-blue-600" /> Approve Tasks
            </NavLink>
          </>
        ) : (
          <></>
        )}
        <a
          href="https://forms.gle/WxTZBPh6jdhGMK1x7"
          target="_blank"
          className="absolute bottom-16 left-0 w-full cursor-pointer block px-5 py-2 text-sm bg-blue-600 text-white font-bold hover:bg-blue-700"
        >
          <div className="flex items-center text-lg">
            <IoBugOutline className="mr-4 text-2xl" /> Report a Bug
          </div>
        </a>
      </div>
    </div>
  );
};

const ProjectManagementLayout = ({ children }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const projectButtonRef = useRef(null);

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="fixed top-0 left-0 right-0 bg-blue-500 p-3 z-20 shadow-md h-16">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-white hover:text-blue-100 transition-colors duration-200 group"
            >
              <svg
                className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-4">
                <button className="px-3 py-1 text-white hover:bg-white/10 rounded-md transition-colors duration-200">
                  <div className="flex items-center">
                    Your Work
                    <RiArrowDownSLine className="ml-1" />
                  </div>
                </button>
                <div className="relative">
                  <button
                    ref={projectButtonRef}
                    className="px-3 py-1 text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                    onClick={() => setIsProjectFormOpen(!isProjectFormOpen)}
                  >
                    <div className="flex items-center">
                      Projects
                      <RiArrowDownSLine className="ml-1" />
                    </div>
                  </button>
                  <ProjectForm
                    isOpen={isProjectFormOpen}
                    onClose={() => setIsProjectFormOpen(false)}
                    buttonRef={projectButtonRef}
                  />
                </div>
                <button className="px-3 py-1 text-white hover:bg-white/10 rounded-md transition-colors duration-200">
                  <div className="flex items-center">
                    <HiOutlineUserGroup className="mr-1" />
                    Teams
                    <RiArrowDownSLine className="ml-1" />
                  </div>
                </button>
              </div>
              <div className="relative flex items-center">
                <BsSearch className="absolute left-3 text-white text-xl" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-1 rounded-md bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex">
            <button
              onClick={() => {
                navigate("/project-management/update-tracker/add-task");
              }}
              className="flex items-center mr-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              + Add Task
            </button>
            <button
              onClick={() => {
                navigate("/project-management/new");
              }}
              className="px-4 py-1.5 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors duration-200 font-medium"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
      <SideNav />
      <div className="ml-60 pt-16">
        <main className="p-6 bg-blue-50">{children}</main>
      </div>
    </div>
  );
};

export default ProjectManagementLayout;
