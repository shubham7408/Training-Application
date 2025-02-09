import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { FaSliders } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa6";
import { GrClose } from "react-icons/gr";
import { FiSearch, FiRotateCw } from "react-icons/fi";
import { FaList, FaRegCalendarAlt } from "react-icons/fa";

const ProjectTaskTable = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 20;
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);

  const uniqueProjects = [...new Set(tasks.map((task) => task.PROJECT_NAME))];
  const filteredProjects = uniqueProjects.filter((project) =>
    project.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const statusOptions = ["Completed", "In Progress", "Not Started"];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL}/api/getTasks`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTasks(data);
        setFilteredTasks(data);
      } catch (error) {
        setError("Error fetching tasks. Please try again later.");
        console.error(error);
      }
    };
    fetchTasks();
  }, []);

  const handleProjectSelect = (project) => {
    if (!selectedProjects.includes(project)) {
      setSelectedProjects([...selectedProjects, project]);
    }
    setProjectSearch("");
    setShowProjectDropdown(false);
  };

  const removeProject = (project) => {
    setSelectedProjects(selectedProjects.filter((p) => p !== project));
  };

  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleStartDateChange = (date) => {
    setStartDate(date ? date.toISOString().split("T")[0] : "");
  };

  const handleEndDateChange = (date) => {
    setEndDate(date ? date.toISOString().split("T")[0] : "");
  };

  const isDateInRange = (dateStr, start, end) => {
    if (!dateStr || !start || !end) return true;
    const date = new Date(dateStr);
    const startDate = new Date(start);
    const endDate = new Date(end);
    return date >= startDate && date <= endDate;
  };

  useEffect(() => {
    let filtered = tasks;

    // search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.USER_EMAIL.toLowerCase().includes(query) ||
          task.TASK_NAME.toLowerCase().includes(query)
      );
    }

    // project filter
    if (selectedProjects.length > 0) {
      filtered = filtered.filter((task) =>
        selectedProjects.includes(task.PROJECT_NAME)
      );
    }

    // date range filter
    if (startDate && endDate) {
      filtered = filtered.filter((task) =>
        isDateInRange(task.START_DATE, startDate, endDate)
      );
    }

    // status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((task) =>
        statusFilter.includes(task.TASK_STATUS)
      );
    }

    setFilteredTasks(filtered);
    setCurrentPage(1);
  }, [tasks, searchQuery, selectedProjects, startDate, endDate, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setStatusFilter([]);
    setSelectedProjects([]);
    setProjectSearch("");
    setFilteredTasks(tasks);
    setCurrentPage(1);
  };

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const navigate = useNavigate("");

  const handleEditClick = (task) => {
    navigate("/project-management/update-tracker/edit-task", {
      state: { name: name, task: task },
    });
  };

  return (
    <div className="w-full mx-auto RiCheckDoubleFill-h-screen p-6" data-aos="fade-down"
      data-aos-duration="500"
      data-aos-easing="ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center justify-center w-full justify-center">
          <FaList className="h-6 w-6 text-blue-600 mr-3" />
          <h1 className="text-2xl font-med text-gray-800">All Task Details</h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute ml-[70vw] flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
        >
          <FaSliders className="w-4 h-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search tasks or emails..."
                className="w-full p-3 pl-10 pr-4 text-gray-900 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${statusFilter.includes(status)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {showFilters && (
            <div className="space-y-6 pt-4 border-t">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Project Filter
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search and select projects..."
                      className="w-full p-3 pl-4 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      value={projectSearch}
                      onChange={(e) => {
                        setProjectSearch(e.target.value);
                        setShowProjectDropdown(true);
                      }}
                      onFocus={() => setShowProjectDropdown(true)}
                    />
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

                    {showProjectDropdown && filteredProjects.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-20 overflow-y-auto">
                        {filteredProjects.map((project) => (
                          <button
                            key={project}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                            onClick={() => handleProjectSelect(project)}
                          >
                            {project}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProjects.map((project) => (
                      <span
                        key={project}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {project}
                        <button
                          onClick={() => removeProject(project)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <GrClose className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date Range
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex">
                      <DatePicker
                        selected={startDate ? new Date(startDate) : null}
                        onChange={handleStartDateChange}
                        placeholderText="Start date"
                        dateFormat="MMM d, yyyy"
                        className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <FaRegCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="relative flex-1">
                      <DatePicker
                        selected={endDate ? new Date(endDate) : null}
                        onChange={handleEndDateChange}
                        placeholderText="End date"
                        dateFormat="MMM d, yyyy"
                        minDate={startDate ? new Date(startDate) : null}
                        className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <FaRegCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                    <button
                      onClick={clearFilters}
                      className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm hover:bg-blue-200 hover:text-blue-800 transition-colors duration-200"
                    >
                      <FiRotateCw className="text-blue-800 w-4 h-4 mr-2" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <span className="text-sm text-gray-600">
              Showing {indexOfFirstTask + 1} -{" "}
              {Math.min(indexOfLastTask, filteredTasks.length)} of{" "}
              {filteredTasks.length} tasks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-500">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Sequence
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    User Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Task Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    End Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Project Name
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTasks.map((task) => (
                  <tr
                    onClick={() => handleEditClick(task)}
                    key={task.TASK_ID}
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {task.PROJECT_T_SEQ}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {task.USER_EMAIL}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {task.TASK_NAME}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${task.TASK_STATUS === "Completed"
                            ? "bg-green-100 text-green-800"
                            : task.TASK_STATUS === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {task.TASK_STATUS}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {task.START_DATE}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{task.END_DATE}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {task.PROJECT_NAME}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
                }`}
            >
              <FaChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>

            <div className="flex space-x-2">
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                    }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
                }`}
            >
              Next
              <FaChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTaskTable;
