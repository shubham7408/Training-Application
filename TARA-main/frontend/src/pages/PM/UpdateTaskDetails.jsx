import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendarAlt, FaPlus, FaArrowLeft } from "react-icons/fa";
import { FaSliders, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FiSearch, FiRotateCw } from "react-icons/fi";

const UpdateTaskDetails = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state || {};

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([]);

  // Status options
  const statusOptions = ["Not Started", "In Progress", "Completed"];

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 20;

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}/api/getTasks`
        );
        const projectTasks = response.data.filter(
          (task) => task.PROJECT_NAME === name
        );
        setTasks(projectTasks);
        setFilteredTasks(projectTasks);
      } catch (error) {
        toast.error("Failed to fetch tasks. Please try again.");
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [name]);

  useEffect(() => {
    let filtered = tasks;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.TASK_NAME.toLowerCase().includes(query) ||
          task.USER_EMAIL.toLowerCase().includes(query)
      );
    }

    if (selectedStatus.length > 0) {
      filtered = filtered.filter((task) =>
        selectedStatus.includes(task.TASK_STATUS)
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((task) =>
        isDateInRange(task.START_DATE, startDate, endDate)
      );
    }

    setFilteredTasks(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, startDate, endDate, tasks]);

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleEditClick = (task) => {
    navigate("/project-management/update-tracker/edit-task", {
      state: { name: name, task: task },
    });
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Started":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination logic
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
    setSelectedStatus([]);
    setFilteredTasks(tasks);
    setCurrentPage(1);
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <FaArrowLeft className="h-5 w-5 mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-med text-gray-900">
          {name} - Task Details
        </h1>
        <button
          onClick={() => {
            navigate("/project-management/update-tracker/add-task");
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <FaPlus className="h-5 w-5 mr-2" />
          Add Task
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

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors duration-200"
            >
              <FaSliders className="w-4 h-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm hover:bg-blue-200 hover:text-blue-800 transition-colors duration-200"
            >
              <FiRotateCw className="text-blue-800 w-4 h-4 mr-2" />
              Clear Filters
            </button>
          </div>

          {showFilters && (
            <div className="space-y-6 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusToggle(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          selectedStatus.includes(status)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Date Range
                    </label>
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
                    <div className="relative flex">
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
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          task.TASK_STATUS
                        )}`}
                      >
                        {task.TASK_STATUS}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {task.START_DATE}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{task.END_DATE}</td>
                    {/* <td className="px-6 py-4">
                      <button className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
              }`}
            >
              <FaChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>
            <div className="flex items-center space-x-2">
              {getPageNumbers().map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                currentPage === totalPages
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

export default UpdateTaskDetails;
