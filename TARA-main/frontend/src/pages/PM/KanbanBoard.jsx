import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineViewKanban } from "react-icons/md";
import { GrClose } from "react-icons/gr";
import { FiSearch, FiLayers } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

const ColumnSearch = ({ onSearch }) => (
  <div className="relative mb-3">
    <input
      type="text"
      placeholder="Search tasks..."
      onChange={(e) => onSearch(e.target.value)}
      className="w-full px-8 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <FiSearch className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
  </div>
);


const KanbanBoard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({
    notStarted: [],
    inProgress: [],
    completed: [],
  });

  const [selectedProject, setSelectedProject] = useState("all");
  const [filteredTasks, setFilteredTasks] = useState({
    notStarted: [],
    inProgress: [],
    completed: [],
  });


  const [draggingTask, setDraggingTask] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(() => {
    const saved = localStorage.getItem("selectedKanbanProjects");
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(
      "selectedKanbanProjects",
      JSON.stringify(selectedProjects)
    );
  }, [selectedProjects]);

  useEffect(() => {
    const fetchProjectsAndTasks = async () => {
      try {
        const tasksResponse = await axios.get(
          `${import.meta.env.VITE_URL}/api/getTasks`
        );
        const allTasks = tasksResponse.data;

        // Extract unique project names
        const projectNames = [...new Set(allTasks.map((task) => task.PROJECT_NAME))];

        // Organize tasks into columns
        const categorizedTasks = {
          notStarted: [],
          inProgress: [],
          completed: [],
        };

        allTasks.forEach((task) => {
          const columnKey =
            task.TASK_STATUS === "Not Started"
              ? "notStarted"
              : task.TASK_STATUS === "In Progress"
                ? "inProgress"
                : "completed";

          categorizedTasks[columnKey].push({
            id: task.TASK_ID,
            title: task.TASK_NAME,
            description: `${task.START_DATE} - ${task.END_DATE}`,
            project: task.PROJECT_NAME,
          });
        });

        setProjects(projectNames);
        setTasks(categorizedTasks);
        setFilteredTasks(categorizedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchProjectsAndTasks();
  }, []);



  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    setSelectedProject(projectName);

    if (projectName === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks({
        notStarted: tasks.notStarted.filter((task) => task.project === projectName),
        inProgress: tasks.inProgress.filter((task) => task.project === projectName),
        completed: tasks.completed.filter((task) => task.project === projectName),
      });
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProjects((prev) => [...prev, project]);
  };

  const handleProjectRemove = (project) => {
    setSelectedProjects((prev) => prev.filter((p) => p !== project));
  };

  const handleDragStart = (e, task, sourceColumn) => {
    setDraggingTask({ task, sourceColumn });
    e.target.classList.add("opacity-50", "scale-105");
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("opacity-50", "scale-105");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const column = e.currentTarget;
    column.classList.add("bg-opacity-70");
  };

  const handleDragLeave = (e) => {
    const column = e.currentTarget;
    column.classList.remove("bg-opacity-70");
  };

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-opacity-70");

    if (!draggingTask) return;

    const { task, sourceColumn } = draggingTask;
    if (sourceColumn === targetColumn) return;

    // Map column IDs to task statuses
    const statusMap = {
      notStarted: "Not Started",
      inProgress: "In Progress",
      completed: "Completed_1"
    };

    try {
      // Make API call to update task status
      await axios.put(`${import.meta.env.VITE_URL}/api/updateTaskStatus/${task.id}`, {
        taskStatus: statusMap[targetColumn]
      });

      // Update both tasks and filteredTasks states
      const updateStates = (prevState) => ({
        ...prevState,
        [sourceColumn]: prevState[sourceColumn].filter((t) => t.id !== task.id),
        [targetColumn]: [...prevState[targetColumn], task],
      });

      setTasks(updateStates);
      setFilteredTasks(updateStates);

    } catch (error) {
      console.error("Error updating task status:", error);
      // Optionally show an error message to the user
      alert("Failed to update task status. Please try again.");
    }

    setDraggingTask(null);
  };

  const handleAddTaskClick = (projectName) => {
    navigate("/project-management/update-tracker/add-task", {
      state: { name: projectName },
    });
  };

  const columns = {
    notStarted: {
      title: "Not Started",
      bgColor: "bg-red-200",
      borderColor: "border-red-400",
    },
    inProgress: {
      title: "In Progress",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-300",
    },
    completed: {
      title: "Completed",
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
    },
  };

  // Add new state for column searches
  const [columnSearches, setColumnSearches] = useState({
    notStarted: "",
    inProgress: "",
    completed: "",
  });

  // Add search handler for columns
  const handleColumnSearch = (columnId, searchTerm) => {
    setColumnSearches(prev => ({
      ...prev,
      [columnId]: searchTerm.toLowerCase()
    }));
  };

  const TaskCard = ({ task }) => (
    <div className="bg-white cursor-pointer p-4 rounded-lg shadow-md border border-gray-200 transform transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-102">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-800">{task.title}</h4>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {task.project}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2">{task.description}</p>
    </div>
  );

  const getFilteredTasks = (columnId) => {
    return filteredTasks[columnId]?.filter(
      (task) =>
        (selectedProjects.length === 0 || selectedProjects.includes(task.project)) &&
        (columnSearches[columnId] === "" ||
          task.title.toLowerCase().includes(columnSearches[columnId]) ||
          task.project.toLowerCase().includes(columnSearches[columnId]))
    ) || [draggingTask];
  };

  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle filtering logic
  useEffect(() => {
    if (searchTerm) {
      setFilteredProjects(
        projects.filter((project) =>
          project.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredProjects(projects); // Show all when input is empty
    }
  }, [searchTerm, projects]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="p-6"
      data-aos="fade-up"
      data-aos-duration="500"
      data-aos-easing="ease-in-out"
    >
      <h1 className="flex items-center justify-center text-2xl text-center font-med text-gray-800 mb-8 transition-all duration-300 ease-in-out transform">
        <MdOutlineViewKanban className="h-8 w-8 text-blue-600 mr-2" />
        Kanban Board
      </h1>

      {/* Search Dropdown */}
      <div className="mb-8 relative" ref={dropdownRef}>
      <label className="block text-base font-semibold text-gray-800 mb-2">
        Select Project
      </label>

      <input
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowDropdown(true)} 
        className="w-full px-4 py-2 mb-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {showDropdown && (
        <div className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project}
                onClick={() => {
                  handleProjectChange({ target: { value: project } });
                  setSearchTerm(project);
                  setShowDropdown(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {project}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
    

      {/* Unified Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(columns).map(([columnId, column]) => (
          <div
            key={columnId}
            className={`${column.bgColor} rounded-xl p-5 border-4 ${column.borderColor} transform transition-all duration-300 hover:shadow-lg hover:scale-101 flex flex-col h-[63vh]`} // Added flex flex-col and h-full
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, columnId)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 text-lg">
                {column.title}
              </h4>
              <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-600">
                {getFilteredTasks(columnId).length} tasks
              </span>
            </div>

            {/* Search input */}
            <ColumnSearch
              onSearch={(term) => handleColumnSearch(columnId, term)}
            />

            {/* Scrollable task container */}
            <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[70vh] pr-2">
              <div className="space-y-4">
                {getFilteredTasks(columnId).map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, columnId)}
                    onDragEnd={handleDragEnd}
                    className="transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                  >
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            </div>

            {/* Add task button */}
            {selectedProjects.length === 1 && (
              <button
                className="mt-4 w-full py-3 text-black rounded-lg shadow-sm transition-all duration-300 border-2 border-blue-400 bg-white transform hover:scale-105 hover:shadow-md"
                onClick={() => handleAddTaskClick(selectedProjects[0])}
              >
                + Add Task
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;