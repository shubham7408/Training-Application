import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReviewerModal from "./reviewermodal/Reviewer";
import { useProjectContext } from "../contextapi/allcontext";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import SyncLoader from "react-spinners/SyncLoader";
import AssignTasks from "./AssignTask";
import ErrorBoundary from "./ErrorBoundary";

const Admin = () => {
  const [projectInsightsData, setProjectInsightsData] = useState(null);
  const [error, setError] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState({
    pending: "asc",
    rejected: "asc",
    approved: "asc",
    approvePercent: "asc",
    total: "asc",
    done: "asc",
    pendingToComplete: "asc",
    PendingToCheck: "asc",
  });

  const [selectedDevelopers, setSelectedDevelopers] = useState([
    {
      USER_ID: "561",
      USER_EMAIL: "chinmayt@innoasr.com",
      LOCATION: "Pune",
      SKILLSETS: ["php", "python"],
    },
    {
      USER_ID: "576",
      USER_EMAIL: "vinodt@innoasr.com",
      LOCATION: "Pune",
      SKILLSETS: ["php", "python"],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const {
    filteredUserData,
    filteredUserData1,
    setFilteredUserData,
    selectedLocation,
    setSelectedLocation,
    languageCounts,
    totalTasks,
    setSearchQuery,
    user,
    individualTaskAssignments,
    globalTaskAssignment,
    handleIndividualTaskAssignment,
    handleGlobalTaskAssignment,
    assignTasks,
    isLoadingForTask,
    setSearchQuery1,
    developerByEmail,
    selectedLanguage1,
    selectedLocation1,
    setSelectedLocation1,
    setSelectedLanguage1,
  } = useProjectContext();
  const Location = useLocation();
  const project_id = location.pathname.split("/").pop();
  const refinedName =
    user.email.split("@")[0].charAt(0).toUpperCase() +
    user.email.split("@")[0].slice(1);

  // State to store user assignments with timestamps
  const [userAssignments, setUserAssignments] = useState({});

  const assignTask = (user, task, language) => {
    const today = new Date().toISOString().split("T")[0];
    if (userAssignments[user]) {
      const assignments = userAssignments[user];
      if (assignments.some((assignment) => assignment.date === today)) {
        toast.warning(`User ${user} already has tasks assigned today.`);
        return false;
      }
      if (assignments.some((assignment) => assignment.language !== language)) {
        toast.warning(
          `User ${user} is already assigned a task in another language.`
        );
        return false;
      }
    } else {
      userAssignments[user] = [];
    }

    setUserAssignments((prevAssignments) => ({
      ...prevAssignments,
      [user]: [...prevAssignments[user], { task, language, date: today }],
    }));
    toast.success(`Assigned ${language} task to user ${user}.`);
    return true;
  };

  const checkUserAssignment = (user) => {
    return userAssignments[user] || null;
  };

  const sortUserData = (developers, taskType) => {
    return [...developers].sort((a, b) => {
      let valueA = 0;
      let valueB = 0;

      switch (taskType) {
        case "pending":
          valueA =
            (a.TOTAL_TASKS || 0) -
            ((a.APPROVED_COUNT || 0) + (a.REJECTED_COUNT || 0));
          valueB =
            (b.TOTAL_TASKS || 0) -
            ((b.APPROVED_COUNT || 0) + (b.REJECTED_COUNT || 0));
          break;
        case "rejected":
          valueA = a.REJECTED_COUNT || 0;
          valueB = b.REJECTED_COUNT || 0;
          break;
        case "approved":
          valueA = a.APPROVED_COUNT || 0;
          valueB = b.APPROVED_COUNT || 0;
          break;
        case "approvePercent":
          valueA = a.APPROVED_PERCENTAGE || 0;
          valueB = b.APPROVED_PERCENTAGE || 0;
          break;
        case "done":
          valueA = a.TOTAL_TASKS || 0;
          valueB = b.TOTAL_TASKS || 0;
        case "pendingToComplete":
          valueA = a.PENDING_TO_COMPLETE || 0;
          valueB = b.PENDING_TO_COMPLETE || 0;
        case "PendingToCheck":
          valueA = a.PENDING_CHECK || 0;
          valueB = b.PENDING_CHECK || 0;
          break;
        default:
          return 0;
      }

      return sortOrder[taskType] === "asc" ? valueA - valueB : valueB - valueA;
    });
  };

  const sortTable = (taskType) => {
    setSortOrder((prevOrder) => ({
      ...prevOrder,
      [taskType]: prevOrder[taskType] === "asc" ? "desc" : "asc",
    }));

    const sortedData = sortUserData([...filteredUserData], taskType);
    setFilteredUserData(sortedData);
  };

  const makeReviewer = () => {
    if (selectedDevelopers.length === 0) {
      toast.warning("Please select at least one developer");
      return;
    }
    setIsReviewerModalOpen(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchForAssignilist = (e) => {
    setSearchQuery1(e.target.value);
  };

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(false);
      try {
        const response = await fetch(`/api/insights`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            insight: "project",
            id: 1033,
            token: 1,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProjectInsightsData(data.body);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(true);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="max-w-[full]">
      <h2 className="text-center text-lg font-semibold mb-4 text-gray-800">
        Suggestion to Admin about the project to improve task approval rate
      </h2>
      {isLoading ? (
        <div>
          <div className="flex flex-col items-center justify-center max-w-[80vw]">
            {
              <div className="w-full  h-60 p-3 rounded-md mb-6 bg-white shadow-lg border border-gray-200 overflow-y-auto">
                <div className="text-lg font-medium text-gray-600">
                  {projectInsightsData ? (
                    <div>
                      <ReactMarkdown>
                        {projectInsightsData.insights}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span>No suggestions available.</span>
                  )}
                </div>
              </div>
            }
          </div>
        </div>
      ) : (
        <div className="ml-[50%] mb-20 mt-20">
          <SyncLoader color="#2196F3" size="20px" />
        </div>
      )}
      <div className="flex w-full mt-8">
        <div className="" flex flex-row>
          <h3
            className="text-xl font-semibold mb-4 max-w-[70vw]"
            data-aos="fade-left"
          >
            {refinedName === "Jyotiv" ? "Jyoti Vaidya" : refinedName}
            <hr className="" />
          </h3>
          <div>
            <div className="flex">
              <h3 className="text-lg font-medium mb-2 py-2 max-w-[70vw]">
                Total Developers:{" "}
                <span className="font-semibold">{filteredUserData.length}</span>{" "}
              </h3>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-start items-end w-full m-5">
          <div className="mb-5 ml-5">
            <label htmlFor="locationFilter" className="mr-2 font-bold">
              Filter by Email:
            </label>
            <br />
            <input
              type="text"
              placeholder="🔍 Search by Email"
              className="border border-gray-300 rounded-md p-2  "
              onChange={handleSearch}
            />
          </div>
          <div className="mb-5 ml-5">
            <label htmlFor="locationFilter" className="mr-2 font-bold">
              Filter by Location:
            </label>
            <br />
            <select
              id="locationFilter"
              className="border border-gray-300 rounded-md p-2 mt-2 w-full"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Himachal">Himachal</option>
              <option value="Pune">Pune</option>
              <option value="Mexico">Una</option>
              <option value="wfh_dy">Dy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-start w-full">
        <div className="w-[90vw] max-w-1xl max-h-[94vh] top-16 overflow-y-auto">
          <table className="bg-white shadow-md rounded-lg mb-5">
            <thead
              className="sticky top-0 z-10 border-b border-stone-800 bg-blue-200 w-full"
              style={{ zIndex: isReviewerModalOpen ? 0 : 1 }}
            >
              <tr>
                <th className="px-4 text-left text-gray-600">Make Reviewer</th>
                <th className="text-left text-gray-600">Emp ID</th>
                <th className="px-4 pr-0 text-left text-gray-600">Developer</th>
                <th className="text-left text-gray-600">
                  <div className="flex">
                    Total Task Assigned
                    <button
                      onClick={() => sortTable("TOTAL_TASKS_ASSIGNED")}
                      className="ml-4"
                    >
                      <FaArrowUp
                        style={{
                          color:
                            sortOrder["PendingToCheck"] === "asc"
                              ? "blue"
                              : "#00000030",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => sortTable("PendingToCheck")}
                      className="ml-4"
                    >
                      <FaArrowDown
                        style={{
                          color:
                            sortOrder["PendingToCheck"] === "desc"
                              ? "red"
                              : "#00000030",
                        }}
                      />
                    </button>
                  </div>
                </th>
                <th className="text-left text-gray-600">
                  <div className="flex">
                    Pending to Check
                    <button
                      onClick={() => sortTable("PendingToCheck")}
                      className="ml-4"
                    >
                      <FaArrowUp
                        style={{
                          color:
                            sortOrder["PendingToCheck"] === "asc"
                              ? "blue"
                              : "#00000030",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => sortTable("PendingToCheck")}
                      className="ml-4"
                    >
                      <FaArrowDown
                        style={{
                          color:
                            sortOrder["PendingToCheck"] === "desc"
                              ? "red"
                              : "#00000030",
                        }}
                      />
                    </button>
                  </div>
                </th>
                <th className="text-left text-gray-600">
                  <div className="flex">
                    Pending to Complete
                    <button
                      onClick={() => sortTable("pendingToComplete")}
                      className="ml-4"
                    >
                      <FaArrowUp
                        style={{
                          color:
                            sortOrder["pendingToComplete"] === "asc"
                              ? "blue"
                              : "#00000030",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => sortTable("pendingToComplete")}
                      className="ml-4"
                    >
                      <FaArrowDown
                        style={{
                          color:
                            sortOrder["pendingToComplete"] === "desc"
                              ? "red"
                              : "#00000030",
                        }}
                      />
                    </button>
                  </div>
                </th>
                <th className="px-4 border-b border-stone-800 text-left text-gray-600">
                  <div className="flex">
                    Total Done
                    <button onClick={() => sortTable("done")} className="ml-4">
                      <FaArrowUp
                        style={{
                          color:
                            sortOrder["done"] === "asc" ? "blue" : "#00000030",
                        }}
                      />
                    </button>
                    <button onClick={() => sortTable("done")} className="ml-4">
                      <FaArrowDown
                        style={{
                          color:
                            sortOrder["done"] === "desc" ? "red" : "#00000030",
                        }}
                      />
                    </button>
                  </div>
                </th>

                <th className="py-3 px-4 border-b border-stone-800 text-left text-gray-600">
                  <div className="flex">
                    Rejected Tasks
                    <button
                      onClick={() => sortTable("rejected")}
                      className="ml-4"
                    >
                      <FaArrowUp
                        style={{
                          color:
                            sortOrder["rejected"] === "asc"
                              ? "blue"
                              : "#00000030",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => sortTable("rejected")}
                      className="ml-4"
                    >
                      <FaArrowDown
                        style={{
                          color:
                            sortOrder["rejected"] === "desc"
                              ? "red"
                              : "#00000030",
                        }}
                      />
                    </button>
                  </div>
                </th>

                <th className="py-3 px-4 border-b border-stone-800 text-left text-gray-600">
                  <div className="flex">
                    Approved Tasks
                    <button
                      onClick={() => sortTable("approved")}
                      className="ml-4"
                    >
                      <FaArrowUp
                        style={{
                          color:
                            sortOrder["approved"] === "asc"
                              ? "blue"
                              : "#00000030",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => sortTable("approved")}
                      className="ml-4"
                    >
                      <FaArrowDown
                        style={{
                          color:
                            sortOrder["approved"] === "desc"
                              ? "red"
                              : "#00000030",
                        }}
                      />
                    </button>
                  </div>
                </th>
                <th className="py-3 px-4 border-b border-stone-800 text-left text-gray-600">
                  <div className="flex">
                    Rewrites
                    <button
                      onClick={() => sortTable("approved")}
                      className="ml-4"
                    >
                      <FaArrowUp
                        style={{
                          color:
                            sortOrder["approved"] === "asc"
                              ? "blue"
                              : "#00000030",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => sortTable("approved")}
                      className="ml-4"
                    >
                      <FaArrowDown
                        style={{
                          color:
                            sortOrder["approved"] === "desc"
                              ? "red"
                              : "#00000030",
                        }}
                      />
                    </button>
                  </div>
                </th>

                <th className="py-3 px-4 text-left text-gray-600">
                  <div className="flex">
                    Language
                    <div className="mb-5"></div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUserData.map((d, index) => (
                <tr key={index} className="hover:bg-blue-50 bg-white">
                  <td
                    className="border-b border-stone-300 text-center"
                    id="makeReviewer"
                  >
                    <input type="checkbox" />
                  </td>
                  <td className="border-b border-stone-300" id="UserID">
                    {d.USER_ID}
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    {d.UPDATED_BY_MAIL?.split("@")[0] || "Unknown"}
                  </td>{" "}
                  <td className="py-3 px-4 border-b border-stone-300">
                    <span>
                      {d.TOTAL_TASKS_ASSIGNED !== 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {d.TOTAL_TASKS_ASSIGNED || "0"}
                        </span>
                      ) : (
                        0
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    <span>
                      {d.NULL_COUNT !== 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {d.NULL_COUNT || "0"}
                        </span>
                      ) : (
                        0
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    <span>
                      {d.PENDING_TO_COMPLETE !== 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {d.PENDING_TO_COMPLETE || "0"}
                        </span>
                      ) : (
                        0
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    <span>
                      {d.TOTAL_TASKS !== 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {d.TOTAL_TASKS || "0"}
                        </span>
                      ) : (
                        0
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    <span>
                      {d.REJECTED_COUNT !== 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {d.REJECTED_COUNT || "0"}
                        </span>
                      ) : (
                        0
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    <span>
                      {d.APPROVED_COUNT !== 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {d.APPROVED_COUNT || "0"}
                        </span>
                      ) : (
                        0
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    <span>
                      {d.REWRITES !== 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {d.REWRITES || "0"}
                        </span>
                      ) : (
                        0
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    <span>
                      {d.APPROVED_PERCENTAGE !== 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {d.APPROVED_PERCENTAGE || "0"}%
                        </span>
                      ) : (
                        0
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    <span>
                      {d.SKILLSETS.length !== 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {d.SKILLSETS.join(", ")}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={makeReviewer}
        >
          Make Reviewer
        </button>
      </div>
      {isReviewerModalOpen && (
        <ReviewerModal
          isOpen={isReviewerModalOpen}
          onClose={() => setIsReviewerModalOpen(false)}
          selectedDevelopers={selectedDevelopers}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Admin;
