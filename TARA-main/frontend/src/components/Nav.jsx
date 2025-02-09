import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoIosNotificationsOutline } from "react-icons/io";
import axios from "axios";

const Nav = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_URL}/api/getAnnouncement`)
      .then((response) => {
        const fetchedNotifications = response.data;
        setNotifications(fetchedNotifications);
        setNotificationCount(fetchedNotifications.length);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      });
  }, []);

  const handleLogout = () => {
    onLogout();
    window.location.reload();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-500 sticky top-0 z-10">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/">
              <img
                className="h-10 w-auto ml-10"
                src="/Innosquares.jpg"
                alt="Logo"
              />
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <NavLink
                to="/"
                className="text-blue-100 hover:bg-blue-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </NavLink>
              <NavLink
                to="#"
                className="text-blue-100 hover:bg-blue-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Careers
              </NavLink>
              <NavLink
                to="#"
                className="text-blue-100 hover:bg-blue-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </NavLink>

              <div className="relative">
                {/* Notification Icon */}
                <button
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  className="text-white mr-4 text-3xl focus:outline-none "
                >
                  <IoIosNotificationsOutline />
                </button>

                {/* Notification Count */}
                {notificationCount > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      backgroundColor: "yellow",
                      color: "black",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {notificationCount}
                  </div>
                )}

                {/* Notification Panel */}
                {isNotificationOpen && notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Announcements
                      </h3>
                      <ul className="mt-2 text-gray-600">
                        {notifications.map((notification, index) => (
                          <li key={index} className="py-2 border-b">
                            <p className="font-semibold">
                              {notification.MESSAGE}
                            </p>
                            <small>
                              {new Date(notification.TIME).toLocaleString()}
                            </small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-grow"></div>
              {user ? (
                <div className="flex items-center ml-auto">
                  <span className="text-white mr-4">
                    Hi, {user.email.split("@")[0]}
                  </span>
                  <button
                    className="text-white bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-md text-sm font-medium"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-blue-500 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink
              to="/"
              className="text-gray-300 hover:bg-blue-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </NavLink>
            <NavLink
              to="#"
              className="text-gray-300 hover:bg-blue-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Careers
            </NavLink>
            <NavLink
              to="#"
              className="text-gray-300 hover:bg-blue-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              About
            </NavLink>
            {user ? (
              <>
                <div className="text-white top-0 right-0 mt-2 mr-2">
                  <span className="mr-4">
                    Hi, {user.role.charAt(0).toUpperCase() + user.role.slice(1)}{" "}
                    {user.email.split("@")[0].charAt(0).toUpperCase() +
                      user.email.split("@")[0].slice(1)}
                  </span>
                  <button
                    className="bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded-md text-sm font-medium"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
