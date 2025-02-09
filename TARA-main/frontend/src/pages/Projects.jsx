import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaPlus } from "react-icons/fa";
import { RiLoader2Line } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";

const Projects = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const loadProjectData = async () => {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/projects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setData(data);
    };

    if (data && data.length <= 0) {
      loadProjectData();
    }
  }, [data]);

  useEffect(() => {
    const loadProjectData = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/task-summary`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data2 = await response.json();
      setData2(data2);
    };

    if (data2 && data2.length <= 0) {
      loadProjectData();
    }
  }, [data2]);

  const getTaskNumbers = (project) => {
    // Find matching summary data
    const summaryData = data2.find(
      (summary) =>
        project.PROJECT_ROUTE.replace(/[:\s]/g, "_").toUpperCase() ===
        summary.TABLE_NAME
    );

    if (summaryData) {
      return {
        completed: summaryData.COMPLETED_TASKS,
        total: summaryData.TOTAL_TASKS,
      };
    }

    // Fall back to project data if no match found
    return {
      completed: project.FINISHED_TASK_NUMBER,
      total: project.TASK_NUMBER,
    };
  };

  const filteredProjects = data.filter((project) =>
    project.PROJECT_TITLE.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RiLoader2Line className="text-blue-600 text-6xl animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="ml-[20rem] display-flex flex-items-center container mx-auto px-4 py-8 w-3/4 mb-0 pt-0"
      data-aos="fade-in"
    >
      <center>
        <div
          className="bg-white w-[20vw] flex items-center border border-gray-300 rounded-lg overflow-hidden mb-4 mt-4"
          data-aos="fade-down"
        >
          <input
            name="search"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 text-lg bg-transparent focus:outline-none flex-grow"
          />
          <IoIosSearch className="text-gray-400 h-6 w-6 mr-3" />
        </div>
      </center>
      <hr className="mb-2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredProjects.map((project, index) => {
          const taskNumbers = getTaskNumbers(project);
          return (
            <div
              key={index}
              className="bg-white cursor-pointer rounded-lg shadow-sm p-6 drop-shadow-lg flex flex-col justify-between h-[170px] relative"
              onClick={() =>
                navigate(
                  `/projects/${project.PROJECT_ROUTE}/${project.PROJECT_ID}`
                )
              }
              data-aos="flip-left"
              data-aos-duration="1000"
            >
              <div className="absolute top-2 right-2">
                {taskNumbers.completed === taskNumbers.total ? (
                  <FaCheck className="text-green-600 text-xl" />
                ) : (
                  <RiLoader2Line className="text-blue-600 text-xl" />
                )}
              </div>
              <h3 className="text-gray-600 text-lg font-med mb-2 line-clamp-3">
                {/* {project.PROJECT_TITLE} */}
                {project.PROJECT_TITLE === "Claude AI"
                  ? "STEM Data Plan"
                  : project.PROJECT_TITLE}
              </h3>
              <p className="text-gray-600 text-lg font-medium mt-auto">
                {taskNumbers.completed}/{taskNumbers.total}
              </p>
            </div>
          );
        })}
        <div
          className="bg-white cursor-pointer rounded-lg shadow-sm p-6 drop-shadow-lg flex flex-col justify-between h-[170px] relative"
          onClick={() => navigate(`/new`)}
          data-aos="flip-left"
          data-aos-duration="1000"
        >
          <div className="absolute top-2 right-2">
            <FaPlus className="text-gray-700 text-xl" />
          </div>
          <h3 className="text-gray-600 text-lg font-med mb-2 line-clamp-3">
            Add Project
          </h3>
          <p className="text-gray-600 text-lg font-medium mt-auto"></p>
        </div>
      </div>
    </div>
  );
};

export default Projects;
