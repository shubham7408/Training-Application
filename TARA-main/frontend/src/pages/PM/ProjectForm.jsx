import React, { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { FiGrid } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { HiOutlineClock } from "react-icons/hi";


const ProjectForm = ({ isOpen, onClose, buttonRef }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, buttonRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-14 bg-white rounded-md shadow-lg w-72 py-2 z-30"
    >
      <div className="px-4 py-2">
        <h3 className="text-sm text-gray-500 font-medium">Recent</h3>
        <NavLink
          to="/project-management"
          className="flex items-center space-x-3 px-2 py-2 mt-1 hover:bg-gray-100 rounded-md"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
            <FiGrid className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">All Projects</p>
            <p className="text-xs text-gray-500">View all your projects</p>
          </div>
        </NavLink>
      </div>
      <div className="border-t border-gray-200 my-2" />
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-gray-500 font-medium">
            INCLUDED WITH YOUR PLAN
          </h3>
        </div>
        <button
          className="w-full flex items-center space-x-3 px-2 py-2 mt-1 hover:bg-gray-100 rounded-md"
          onClick={() => {
            /* Handle create project */
          }}
        >
          <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
            <AiOutlinePlus className="text-green-600" />
          </div>
          <div className="flex-1 text-left" onClick={() => navigate("/project-management/new")}>
            <p className="text-sm font-medium text-gray-900">
              Create new project
            </p>
            <p className="text-xs text-gray-500">Start from scratch</p>
          </div>
        </button>
        
      </div>
      
    </div>
  );
};

export default ProjectForm;
