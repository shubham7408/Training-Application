import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRegLightbulb,
  FaList,
  FaRegUser,
  FaRegBuilding,
} from "react-icons/fa";
import { FiPlusCircle, FiGrid, FiSearch } from "react-icons/fi";

const AllProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL}/api/getProjectsTracker`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.PROJECT_NAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.TEAM_LEAD.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectClick = (projectName) => {
    navigate("/project-management/update-tracker", {
      state: { name: projectName },
    });
  };

  const handleNewProject = () => {
    navigate("/project-management/new");
  };

  const getRandomColor = () => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-yellow-100 text-yellow-800",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getInitials = (projectName) => {
    return projectName.slice(0, 3).toUpperCase();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" data-aos="fade-down">
      {/* Header Section */}
      <div className="mb-8">
        <div className="w-full flex justify-center text-center mb-6">
          <h1 className="flex align-center text-2xl font-med text-gray-900 text-center">
            <FaRegLightbulb className="h-8 w-8 text-blue-600 mr-2" />
            All Projects
          </h1>
          <button
            onClick={handleNewProject}
            className="absolute ml-[70vw] flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiPlusCircle className="w-5 h-5" />
            <span>New&nbsp;Project</span>
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 mb-6"
          data-aos="fade-right"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects or team leads..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <FaList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-lg p-6 h-48">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div
              key={index}
              onClick={() => handleProjectClick(project.PROJECT_NAME)}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer"
              data-aos="flip-up"
              data-aos-duration="1000"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-med text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {project.PROJECT_NAME}
                  </h3>
                </div>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getRandomColor()}`}
                >
                  `KEY = {getInitials(project.PROJECT_NAME)}`
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <FaRegUser className="w-4 h-4 text-gray-400" />
                  <span className="ml-1 text-sm text-gray-600">Team Lead:</span>
                  <span className="text-sm text-gray-600">
                    {project.TEAM_LEAD}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Project Card */}
          <div
            onClick={handleNewProject}
            className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            data-aos="flip-up"
            data-aos-duration="1000"
          >
            <div className="p-3 rounded-full bg-blue-100">
              <FiPlusCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900">
              Create New Project
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          {filteredProjects.map((project, idx) => (
            <div
              key={idx}
              onClick={() => handleProjectClick(project.PROJECT_NAME)}
              className={`group p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                idx !== projects.length - 1 ? "border-b border-gray-100" : ""
              }`}
              data-aos="flip-up"
              data-aos-duration="1000"
            >
              <div className="flex items-center gap-4 flex-grow">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(project.PROJECT_NAME)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {project.PROJECT_NAME}
                  </h3>
                  <p className="text-sm text-gray-500">{project.TEAM_LEAD}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getRandomColor()}`}
                >
                  {getInitials(project.PROJECT_NAME)}
                </span>
                <FaRegBuilding className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProjectsPage;
