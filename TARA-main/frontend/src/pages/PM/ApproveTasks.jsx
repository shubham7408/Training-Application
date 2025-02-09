import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiCheckDoubleFill } from "react-icons/ri";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const ApproveTasks = () => {
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

  const statusOptions = ["Completed_1", "In Progress", "Not Started"];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL}/api/getTasksForAdmin`
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
    <>
      <div
        className="p-6 min-h-screen"
        data-aos="fade-down"
        data-aos-duration="500"
        data-aos-easing="ease-in-out"
      >
        <h1 className="flex items-center justify-center text-2xl text-center font-med text-gray-800 mb-8 transition-all duration-300 ease-in-out transform">
          <RiCheckDoubleFill className="h-8 w-8 text-blue-600 mr-2" />
          Approve Submitted Tasks
        </h1>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <span className="text-sm text-gray-600">
              Showing {indexOfFirstTask + 1} -{" "}
              {Math.min(indexOfLastTask, filteredTasks.length)} of{" "}
              {filteredTasks.length} tasks
            </span>
          </div>

          <div className="overflow-x-auto">
            {filteredTasks.length === 0 ? (
              <div className="px-6 py-4 text-center text-green-600 font-med">
                No tasks pending for approval.
              </div>
            ) : (
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
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${task.TASK_STATUS === "Completed_1"
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
                      <td className="px-6 py-4 text-gray-700">
                        {task.END_DATE}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {task.PROJECT_NAME}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
    </>
  );
};

export default ApproveTasks;
