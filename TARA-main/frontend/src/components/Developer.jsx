import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactMarkdown from "react-markdown";

import DeveloperCharts from "./developerchart/developerCharts";
import { useProjectContext } from "../contextapi/allcontext";

const Developer = () => {
  const {
    user,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    comments,
    options,
    handleOptionChange,
    handleCommentChange,
    updateTask,
    fetchUserAnnotations,
  } = useProjectContext();

  const [insightsData, setInsightsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const userTasks = filteredTasks.filter(
    (task) => task.USER_EMAIL === user.email
  );

  const userId = user.user_id;

  useEffect(() => {
    if (user) {
      fetchUserAnnotations();
    }
  }, [user]);

  console.log("User IDDDD: ", user);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/insights`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // mode: "no-cors",
          body: JSON.stringify({
            insight: "dev",
            id: userId,
            token: 1,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setInsightsData(data.body);
        console.log("insight data ", insightsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="ml-60 text-[1.5rem] font-bold text-gray-600">
        Loading insights...
      </div>
    );
  }

  return (
    <div>
      <DeveloperCharts />

      <div>
        <div>
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-center text-lg font-semibold mb-4 text-gray-800">
              Suggestion to Developer to improve their task performance
            </h2>
            <div className="w-full max-w-[60vw] h-60 p-3 rounded-md mb-6 bg-white shadow-lg border border-gray-200 overflow-y-auto">
              <p className="text-lg font-medium text-gray-600">
                {insightsData ? (
                  <div>
                    {/* <p>
                      <strong>Total Rejected Tasks: </strong>
                      {insightsData.total_rejected_tasks}
                    </p> */}
                    <ReactMarkdown>{insightsData.insights}</ReactMarkdown>
                  </div>
                ) : (
                  <p>No suggestions available.</p>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="ml-36">
          <h2 className="text-xl font-semibold mb-4">
            Tasks assigned to you,{" "}
            {user.email.split("@")[0].charAt(0).toUpperCase() +
              user.email.split("@")[0].slice(1)}
          </h2>

          <h3 className="text-lg font-medium mb-8">
            Total Tasks: {userTasks.length}
          </h3>

          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Search by Task ID, Developer Comment, or Your Comment"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded w-1/5 mx-auto"
            />
          </div>

          <table className="w-full bg-blue-50 border border-blue-100">
            <thead>
              <tr className="bg-blue-100">
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Task ID
                </th>
                {/* <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Assigned To
                </th> */}
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Status
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Suggestion based on past task
                </th>
                {/* <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Similar tasks
                </th> */}
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Updated Date
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Comment from Reviewer
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Your Comment
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Language
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.map((task, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b border-blue-200">
                    <a
                      href={`https://notlabel-studio.toloka-test.ai/projects/${task.PROJECT}/data?tab=13807&page=1&task=${task.TASK_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {task.TASK_ID}
                    </a>
                  </td>
                  {/* <td className="py-2 px-4 border-b border-blue-200">
                    {task.USER_EMAIL}
                  </td> */}
                  <td className="py-2 px-4 border-b border-blue-200">
                    <select
                      className="bg-white border border-blue-300 rounded px-2 py-1"
                      value={options[task.TASK_ID] || task.STATUS}
                      onChange={(e) =>
                        handleOptionChange(task.TASK_ID, e.target.value)
                      }
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {/* Suggestion Box */}
                    <textarea
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1"
                      rows="2"
                      disabled
                    ></textarea>
                  </td>
                  {/* <td className="py-2 px-4 border-b border-blue-200">
                    
                    <textarea
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1"
                      rows="2"
                      disabled
                    ></textarea>
                  </td> */}
                  <td className="py-2 px-4 border-b border-blue-200">
                    {new Date(task.UPDATED_AT).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    <textarea
                      className="w-full bg-white border border-blue-300 rounded px-2 py-1"
                      rows="3"
                      defaultValue={task.COMMENT_BY_REVIEWER || ""}
                      disabled
                    />
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    <textarea
                      className="w-full bg-white border border-blue-300 rounded px-2 py-1"
                      rows="3"
                      value={comments[task.TASK_ID] || ""}
                      onChange={(e) =>
                        handleCommentChange(task.TASK_ID, e.target.value)
                      }
                      required
                    />
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {task.LANGUAGE}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => updateTask(task)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default Developer;
