import React, { useState, useEffect, useMemo } from "react";
import { FaCheckCircle, FaCalendarAlt, FaSearch } from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { CgInsertAfterO, CgProfile } from "react-icons/cg";
import { MdOutlinePendingActions } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, ArcElement, Legend } from "chart.js";
import { formatDistanceToNow } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(Title, Tooltip, ArcElement, Legend);

const isDateInRange = (dateStr, startDate, endDate) => {
  if (!dateStr) return false;
  try {
    const date = new Date(dateStr);
    return (
      date.getTime() >= new Date(startDate).getTime() &&
      date.getTime() <= new Date(endDate).getTime()
    );
  } catch (error) {
    console.warn("Invalid date:", dateStr);
    return false;
  }
};

const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (searchTerm.trim() === "") return options;
    return options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, options]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    onChange(project);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:w-72">
      <div className="relative">
        <input
          type="text"
          id="project"
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
                     text-md transition-all duration-200 z-100"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {isOpen && (
        <div
          data-aos="fade-down"
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
        >
          {filteredOptions.map((option) => (
            <div
              key={option}
              whileHover={{ backgroundColor: "#f3f4f6" }}
              className={`p-3 cursor-pointer transition-colors duration-150
                           ${selectedProject === option
                  ? "bg-blue-50 text-blue-600"
                  : ""
                }
                           hover:bg-gray-100`}
              onClick={() => handleProjectSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => (
  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
    <div className="relative w-full md:w-48">
      <DatePicker
        selected={startDate}
        onChange={onStartDateChange}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        placeholderText="Start Date"
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
                   transition-all duration-200 z-50"
      />
      <FaCalendarAlt className="z-50 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
    <span className="text-gray-500 hidden md:block">to</span>
    <div className="relative w-full md:w-48">
      <DatePicker
        selected={endDate}
        onChange={onEndDateChange}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        placeholderText="End Date"
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
                   transition-all duration-200"
      />
      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  </div>
);

const StatusCard = ({ icon: Icon, bgColor, iconColor, count, label }) => (
  <div
    data-aos="fade-down"
    className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl
               transition-all duration-300"
  >
    <div className="flex items-center space-x-4">
      <div className={`p-4 ${bgColor} rounded-full`}>
        <Icon className={`text-2xl ${iconColor}`} />
      </div>
      <div>
        <p className="text-3xl font-med text-gray-800" data-aos="fade-down">
          {count}
        </p>
        <p className="text-gray-600 font-medium">{label}</p>
      </div>
    </div>
  </div>
);

const StatusOverview = ({ tasks, selectedProject, startDate, endDate }) => {
  const getTaskCounts = (projectName) => {
    let filtered =
      projectName === "All Projects"
        ? [...tasks]
        : tasks.filter((task) => task.PROJECT_NAME === projectName);

    if (startDate && endDate) {
      filtered = filtered.filter((task) =>
        isDateInRange(task.CREATE_DATE_TIME, startDate, endDate)
      );
    }

    return {
      Total: filtered.length,
      Created: filtered.filter((task) => task.TASK_STATUS === "Not Started")
        .length,
      Updated: filtered.filter((task) => task.TASK_STATUS === "In Progress")
        .length,
      Pending: filtered.filter((task) => task.TASK_STATUS === "Completed")
        .length,
    };
  };

  const counts = getTaskCounts(selectedProject);

  const data = {
    labels: ["Created", "Updated", "Completed", "Pending"],
    datasets: [
      {
        data: [
          counts.Created,
          counts.Updated,
          counts.Pending,
          counts.Total - (counts.Created + counts.Updated + counts.Pending),
        ],
        backgroundColor: ["#ffcc00", "#3498db", "#2ecc71", "#e74c3c"],
        hoverBackgroundColor: ["#f1c40f", "#2980b9", "#27ae60", "#c0392b"],
      },
    ],
  };

  return (
    <div data-aos="fade-down" className="bg-white rounded-lg p-4">
      <div className="flex justify-center">
        <div className="w-[300px] h-[300px]">
          <Doughnut
            data={data}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                title: {
                  display: true,
                  text: "Task Status Distribution",
                  font: { size: 16 },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

const SummaryView = () => {
  const [tasks, setTasks] = useState([]);
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getFilteredTasks = () => {
    if (!tasks) return [];

    let filtered = [...tasks];

    if (projectFilter !== "All Projects") {
      filtered = filtered.filter((task) => task.PROJECT_NAME === projectFilter);
    }

    if (startDate && endDate) {
      filtered = filtered.filter((task) =>
        isDateInRange(task.CREATE_DATE_TIME, startDate, endDate)
      );
    }

    return filtered;
  };

  const getTaskCounts = () => {
    const filtered = getFilteredTasks();
    return {
      Completed: filtered.filter((task) => task.TASK_STATUS === "Completed")
        .length,
      Updated: filtered.filter((task) => task.TASK_STATUS === "In Progress")
        .length,
      Created: filtered.length,
      Due: filtered.filter((task) => task.TASK_STATUS === "Not Started").length,
    };
  };

  const projectNames = [
    "All Projects",
    ...new Set(tasks.map((task) => task.PROJECT_NAME)),
  ];
  const counts = getTaskCounts();

  return (
    <div className="">
      <div data-aos="fade-down" className="container mx-auto p-6">
        <h1 className="flex justify-center items-center text-center text-2xl font-med text-gray-800 mb-6">
          <TbReportAnalytics className="h-8 w-8 text-blue-600 mr-2" />
          Dashboard Overview
        </h1>
        <div
          
          className="bg-white rounded-xl shadow-lg p-6 mb-8 overflow-visible"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 z-1000">
            <div className="w-full lg:w-72">
              <SearchableDropdown
                options={projectNames}
                value={projectFilter}
                onChange={setProjectFilter}
                placeholder="Search projects..."
              />
            </div>
            {projectFilter && (
              <div className="hidden lg:block">
                <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-700 font-medium">
                    Selected: {projectFilter}
                  </span>
                </div>
              </div>
            )}
            <div className="w-full lg:w-auto ml-auto">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            icon={FaCheckCircle}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            count={counts.Completed}
            label="Completed Tasks"
          />
          <StatusCard
            icon={HiOutlinePencilSquare}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
            count={counts.Updated}
            label="In Progress"
          />
          <StatusCard
            icon={CgInsertAfterO}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
            count={counts.Created}
            label="Total Tasks"
          />
          <StatusCard
            icon={MdOutlinePendingActions}
            bgColor="bg-red-100"
            iconColor="text-red-600"
            count={counts.Due}
            label="Pending Tasks"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div
            data-aos="fade-down"
            className="bg-white rounded-xl shadow-lg p-6 overflow-auto"
          >
            <h3 className="text-xl font-med mb-6">Status Overview</h3>
            <StatusOverview
              tasks={tasks}
              selectedProject={projectFilter}
              startDate={startDate}
              endDate={endDate}
            />
          </div>

          <div
            data-aos="fade-down"
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-med mb-6">Recent Activity</h3>
            <div className="max-h-[400px] overflow-y-auto">
              {getFilteredTasks()
                .reverse()
                .slice(0, 10)
                .map((task) => (
                  <div
                    data-aos="fade-down"
                    key={task.TASK_ID}
                    className="bg-gray-50 rounded-lg p-4 mb-4 hover:bg-gray-100 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 shadow-md">
                        <CgProfile className="text-blue-600 text-2xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {task.USER_EMAIL?.split("@")[0]
                            ?.split(".")[0]
                            ?.toLowerCase()
                            ?.replace(/^\w/, (c) => c.toUpperCase()) || "User"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(
                            new Date(task.CREATE_DATE_TIME),
                            {
                              addSuffix: true,
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="ml-16 text-gray-700">
                      Updated "{task.TASK_NAME || "Untitled Task"}" to{" "}
                      <span
                        className={`font-medium ${task.TASK_STATUS === "Completed"
                          ? "text-green-600"
                          : task.TASK_STATUS === "In Progress"
                            ? "text-orange-600"
                            : "text-red-600"
                          }`}
                      >
                        {task.TASK_STATUS || "Unknown Status"}
                      </span>{" "}
                      in {task.PROJECT_NAME || "Unknown Project"}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;