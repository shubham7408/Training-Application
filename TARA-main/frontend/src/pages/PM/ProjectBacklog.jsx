import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiLayers } from "react-icons/fi";
import { BsHourglassSplit } from "react-icons/bs";
import { MdOutlinePendingActions } from "react-icons/md";
import { GrClose } from "react-icons/gr";
import { FaRegUser } from "react-icons/fa";

const ProjectBacklog = () => {
  const [tasks, setTasks] = useState([]);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchTasks();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (tasks.length > 0) {
      const uniqueProjects = [
        ...new Set(tasks.map((task) => task.PROJECT_NAME)),
      ];
      setProjects(uniqueProjects);
      updateBacklog(tasks);
    }
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/getTasks`);
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const updateBacklog = (taskList) => {
    const currentDate = new Date();
    const backlog = taskList.filter((task) => {
      const endDate = new Date(task.END_DATE);
      return endDate < currentDate && task.TASK_STATUS !== "Completed";
    });
    setBacklogTasks(backlog);
  };

  const getFilteredTasks = () => {
    if (selectedProjects.length === 0) return backlogTasks;
    return backlogTasks.filter((task) =>
      selectedProjects.includes(task.PROJECT_NAME)
    );
  };

  const handleProjectSelect = (project) => {
    if (!selectedProjects.includes(project)) {
      setSelectedProjects([...selectedProjects, project]);
    }
    setSearchQuery("");
  };

  const handleProjectRemove = (project) => {
    setSelectedProjects(selectedProjects.filter((p) => p !== project));
  };

  const TaskCard = ({ task }) => (
    <div
      data-aos="fade-down"
      className="bg-white rounded-2xl shadow-lg p-6 mb-4 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2">
            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center space-x-1">
              <FiLayers className="w-4 mr-1" />
              {task.PROJECT_NAME}
            </span>
          </div>
          <h3 className="font-med text-xl text-gray-800">{task.TASK_NAME}</h3>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <BsHourglassSplit className="w-4 h-4 mr-2 text-gray-500" />
              {new Date(task.END_DATE).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <FaRegUser className="w-4 h-4 mr-2 text-gray-500" />
              {task.USER_EMAIL}
            </div>
          </div>
        </div>
        <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Exceeded End Date
        </span>
      </div>
    </div>
  );

  const SearchDropdown = ({
    projects = [],
    selectedProjects = [],
    onProjectSelect,
    onProjectRemove,
  }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getFilteredProjects = () => {
      return projects.filter(
        (project) =>
          project.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedProjects.includes(project)
      );
    };

    return (
      <div ref={dropdownRef} className="relative w-full max-w-[700px] mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Layer 1: Selected Projects */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {selectedProjects.map((project) => (
                <span
                  key={project}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <FiLayers className="w-4 h-4" />
                  {project}
                  <button
                    onClick={() => onProjectRemove(project)}
                    className="ml-1 hover:text-blue-600 focus:outline-none"
                  >
                    <GrClose className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {selectedProjects.length === 0 && (
                <span className="text-gray-400 text-sm">
                  No projects selected
                </span>
              )}
            </div>
          </div>

          {/* Layer 2: Search Input */}
          <div className="relative p-3 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => setIsDropdownOpen(true)}
                placeholder="Search projects..."
                className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <GrClose className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Layer 3: Dropdown List */}
          <div
            className={`${isDropdownOpen ? "max-h-40" : "max-h-0"
              } overflow-hidden transition-all duration-200`}
          >
            <div className="overflow-y-auto max-h-40">
              {" "}
              {/* Set max-height for scrollable content */}
              {getFilteredProjects().length > 0 ? (
                getFilteredProjects().map((project) => (
                  <button
                    key={project}
                    onClick={() => {
                      onProjectSelect(project);
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center space-x-2 transition-colors duration-150"
                  >
                    <FiLayers className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{project}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  {searchQuery
                    ? "No matching projects found"
                    : "No projects available"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6" data-aos="fade-down"
      data-aos-duration="500"
      data-aos-easing="ease-in-out">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center text-2xl font-med text-gray-900 mb-6">
            <MdOutlinePendingActions className="h-8 w-8 text-blue-600 mr-2" />
            Project Backlog
          </h1>
          <div className="mb-8 flex justify-center">
            <SearchDropdown
              projects={projects}
              selectedProjects={selectedProjects}
              onProjectSelect={handleProjectSelect}
              onProjectRemove={handleProjectRemove}
            />
          </div>
        </div>
        <div layout className="space-y-4">
          {getFilteredTasks().length > 0 ? (
            getFilteredTasks().map((task) => (
              <TaskCard key={task.TASK_ID} task={task} />
            ))
          ) : (
            <div
              data-aos="fade-down"
              className="text-center py-12 bg-white rounded-lg shadow-lg"
            >
              <p className="text-gray-600">No backlog tasks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectBacklog;
