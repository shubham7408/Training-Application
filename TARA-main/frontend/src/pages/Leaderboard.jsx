import React, { useEffect, useState } from "react";
import { useProjectContext } from "../contextapi/allcontext";

const Leaderboard = () => {
  const { fetchLeaderboardData } = useProjectContext();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_URL}/api/projects`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const projectData = await response.json();

        const filteredProjects = projectData.filter((project) =>
          [
            "PROJECT_P_CODING_EVALUATION",
            "Project_P_Pairwise_Evaluation_Long_SLA",
            "PROJECT_P_SCRATCHPAD_TASKS",
          ].includes(project.PROJECT_ROUTE)
        );

        setProjects(filteredProjects);

        if (filteredProjects.length > 0) {
          setSelectedProject(filteredProjects[0].PROJECT_ROUTE);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (!selectedProject) return;

      try {
        setLoading(true);
        setError(null);

        const data = await fetchLeaderboardData(selectedProject);
        console.log("Leaderboard data", data);
        if (!data || data.length === 0) {
          throw new Error("No leaderboard data found.");
        }
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
        setError("Failed to load leaderboard data.");
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
  }, [selectedProject, fetchLeaderboardData]);

  return (
    <div className="container mx-auto px-4 sm:px-8" data-aos="fade-right">
      <div className="py-8 ml-[12vw]">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Leaderboard - Top 10 Performers by Approval Rate
          </h2>
          <p className="mt-2 text-gray-600">
            A ranked list of employees based on task approval rates for each
            project.
          </p>
        </div>

        {/* Display error */}
        {error && (
          <div className="mb-4 text-red-600 font-semibold">{error}</div>
        )}

        {/* Project Buttons */}
        <div className="mb-4 flex space-x-6">
          {projects.map((project) => (
            <button
              key={project.PROJECT_ROUTE}
              className={`px-4 py-2 rounded transition-transform duration-300 ${
                selectedProject === project.PROJECT_ROUTE
                  ? "bg-blue-600 text-white scale-110"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setSelectedProject(project.PROJECT_ROUTE)}
            >
              {project.PROJECT_TITLE}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <p className="animate-pulse text-gray-600">Loading leaderboard...</p>
        )}

        {/* Leaderboard Table */}
        {!loading && (
          <div
            className="shadow rounded-lg overflow-hidden transition-opacity duration-500 ease-in-out animate-slideFadeIn"
            key={selectedProject} // Ensure animation on project change
          >
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wider w-16">
                      Rank
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wider w-[150px]">
                      User ID
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wider w-32">
                      Approved Tasks
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wider w-32">
                      Pending To Check
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wider w-32">
                      Pending To Complete
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wider w-32">
                      Total Rewrites
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wider w-32">
                      Rejected Tasks
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wider w-32">
                      Total Tasks
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wider w-28">
                      Approval Rate (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboardData.length > 0 ? (
                    leaderboardData.map((user, index) => (
                      <tr
                        key={user.email}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap truncate">
                          {user.email}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {user.approved}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {user.pendingCheck}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {user.pendingToComplete}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {user.rewrite}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {user.rejected}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {user.total}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.approvalRate > 70
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.approvalRate}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-3 py-2 text-center text-gray-500"
                      >
                        No leaderboard data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
