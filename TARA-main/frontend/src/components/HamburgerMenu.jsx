import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { GoDatabase, GoDownload, GoProjectRoadmap } from "react-icons/go";
import { TiDocumentAdd } from "react-icons/ti";
import { RiLockPasswordLine } from "react-icons/ri";
import { MdOutlineLeaderboard, MdOutlineSecurity } from "react-icons/md";
import { TfiAnnouncement } from "react-icons/tfi";
import { LiaProjectDiagramSolid } from "react-icons/lia";
import { IoBugOutline } from "react-icons/io5";
import { GoTerminal } from "react-icons/go";

import { FaCheckDouble } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const HamburgerMenu = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    AOS.init();
  }, []);

  return (
    <div className="sticky z-10 top-16">
      <div
        className={`absolute left-0 w-65 bg-white rounded-md shadow-lg py-1 transition-transform duration-300`}
        style={{ height: `calc(100vh - 4rem)` }}
      >
        {user && user.role === "Admin" ? (
          <>
            <div
              className={`px-5 py-2 text-lg text-center font-bold ${
                user ? "text-blue-500" : "text-red-500"
              }`}
            >
              {user
                ? "Hi, " +
                  user.role +
                  " " +
                  user.email.split("@")[0].charAt(0).toUpperCase() +
                  user.email.split("@")[0].slice(1)
                : "Not logged in"}
            </div>

            <hr />
            <NavLink
              to="/"
              className={`cursor-pointer block px-5 py-2 mt-3 text-sm text-gray-700 hover:bg-blue-100 ${
                location.pathname === "/"
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex align-items items-center text-lg text-right">
                <GoProjectRoadmap className="mr-2" /> All Projects
              </div>
            </NavLink>
            <NavLink
              to="/all"
              className={`cursor-pointer block px-5 py-2 text-sm text-gray-700 hover:bg-blue-100 ${
                location.pathname === "/all"
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex align-items items-center text-lg">
                <GoDatabase className="mr-2" /> More Statistics
              </div>
            </NavLink>
            <NavLink
              to="/new"
              className={`cursor-pointer block px-5 py-2 text-sm text-gray-700 hover:bg-blue-100 ${
                location.pathname === "/new"
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex align-items items-center text-lg">
                <TiDocumentAdd className="mr-2" /> New Project
              </div>
            </NavLink>
            <NavLink
              to="/project-management"
              className={`cursor-pointer mt-1 block px-5 py-2 text-sm text-gray-700 select-none hover:bg-blue-100 ${
                window.location.pathname.startsWith("/project-management")
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex items-center text-lg">
                <LiaProjectDiagramSolid className="mr-3" /> Project Management
              </div>
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={`cursor-pointer block px-5 py-2 text-sm text-gray-700 hover:bg-blue-100 ${
                location.pathname === "/leaderboard"
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex align-items items-center text-lg">
                <MdOutlineLeaderboard className="mr-2" /> Leaderboard
              </div>
            </NavLink>
            <NavLink
              to="/reports"
              className={`cursor-pointer block px-5 py-2 text-sm text-gray-700 hover:bg-blue-100 ${
                location.pathname === "/reports"
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex align-items items-center text-lg">
                <GoDownload className="mr-2" /> Reports
              </div>
            </NavLink>
            <NavLink
              to="/announcement"
              className={`cursor-pointer block px-5 py-2 text-sm text-gray-700 hover:bg-blue-100 ${
                location.pathname === "/announcement"
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex align-items items-center text-lg">
                <TfiAnnouncement className="mr-2" />
                Announcement
              </div>
            </NavLink>
            <NavLink
              to="/logs"
              className={`cursor-pointer block px-5 py-2 text-sm text-gray-700 hover:bg-blue-100 ${
                location.pathname === "/logs"
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex align-items items-center text-lg">
                <GoTerminal className="mr-2" />
                Logs
              </div>
            </NavLink>
            <NavLink
              to="/change-role"
              className={`cursor-pointer block px-5 py-2 text-sm text-gray-700 hover:bg-blue-100 ${
                location.pathname === "/change-role"
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex align-items items-center text-lg">
                <MdOutlineSecurity className="mr-2" />
                Change Roles
              </div>
            </NavLink>
            <NavLink
              to="/project-management/approve-tasks"
              className={`cursor-pointer block px-5 py-2 mb-5 text-sm text-gray-700 hover:bg-blue-100 ${
                location.pathname === ""
                  ? "bg-blue-200 rounded-l-full border-white border-l-12"
                  : ""
              }`}
            >
              <div className="flex align-items items-center text-lg">
                <FaCheckDouble className="mr-2" />
                Approve Tasks
              </div>
            </NavLink>
          </>
        ) : (
          <>
            <div
              className={`px-5 py-2 text-lg text-center font-bold ${
                user ? "text-blue-500" : "text-red-500"
              }`}
            >
              {user ? "Hi, " + user.role : "Not logged in"}
            </div>

            <hr />
            {user ? (
              <>
                <NavLink
                  to="/project-management"
                  className={`cursor-pointer mt-1 block px-5 py-2 text-sm text-gray-700 select-none hover:bg-blue-100 ${
                    window.location.pathname.startsWith("/project-management")
                      ? "bg-blue-200 rounded-l-full border-white border-l-12"
                      : ""
                  }`}
                >
                  <div className="flex items-center text-lg">
                    <LiaProjectDiagramSolid className="mr-3" /> Project
                    Management
                  </div>
                </NavLink>
                <NavLink
                  to="/leaderboard"
                  className={`cursor-pointer block px-5 py-2 text-sm text-gray-700 hover:bg-blue-100 ${
                    location.pathname === "/leaderboard"
                      ? "bg-blue-200 rounded-l-full border-white border-l-12"
                      : ""
                  }`}
                >
                  <div className="flex items-center text-lg">
                    <MdOutlineLeaderboard className="mr-3" /> Leaderboard
                  </div>
                </NavLink>
                <NavLink
                  to="/change-password"
                  className={`cursor-pointer block px-5 py-2 text-sm text-gray-700 hover:bg-blue-100 ${
                    location.pathname === "/change-password"
                      ? "bg-blue-200 rounded-l-full border-white border-l-12"
                      : ""
                  }`}
                >
                  <div className="flex items-center text-lg">
                    <RiLockPasswordLine className="mr-3" /> Change Password
                  </div>
                </NavLink>
              </>
            ) : null}
          </>
        )}
        <a
          href="https://forms.gle/WxTZBPh6jdhGMK1x7"
          target="_blank"
          className="absolute bottom-0 left-0 w-full cursor-pointer block px-5 py-2 text-sm bg-blue-600 text-white font-bold hover:bg-blue-700"
        >
          <div className="flex items-center text-lg">
            <IoBugOutline className="mr-3 text-3xl" /> Report a Bug
          </div>
        </a>
      </div>
    </div>
  );
};

export default HamburgerMenu;
