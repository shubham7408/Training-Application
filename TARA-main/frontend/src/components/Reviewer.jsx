import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Reviewer = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [userAnnotations, setUserAnnotations] = useState([]);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState({});
  const [options, setOptions] = useState({});

  const [searchQuery, setSearchQuery] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const filteredUserAnnotations = selectedMember
    ? userAnnotations.filter((task) => task.USER_EMAIL === selectedMember)
    : userAnnotations;

  // New filtered tasks based on search query
  const searchedUserAnnotations = filteredUserAnnotations.filter((task) => {
    const taskIDMatch = task.TASK_ID.toString()
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const commentByDeveloperMatch = (task.COMMENT_BY_DEVELOPER || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const yourCommentMatch = (comments[task.TASK_ID] || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return taskIDMatch || commentByDeveloperMatch || yourCommentMatch;
  });

  const handleMemberSelect = (email) => {
    setSelectedMember(email === selectedMember ? null : email);
  };

  const handleOptionChange = (taskId, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [taskId]: value,
    }));
  };

  const handleCommentChange = (taskId, value) => {
    setComments((prevComments) => ({
      ...prevComments,
      [taskId]: value,
    }));
  };

  const handleUpdate = async (task) => {
    const body = {
      role: user.role,
      taskid: task.TASK_ID,
      status: options[task.TASK_ID] || task.STATUS,
      comment: comments[task.TASK_ID] || task.COMMENT,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/userAnnotation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Update successful:", data);

      // Remove the updated task if status is "Done"
      const updatedTasks = userAnnotations.filter(
        (t) =>
          t.TASK_ID !== task.TASK_ID ||
          (options[task.TASK_ID] !== "Done" && t.STATUS !== "Done")
      );
      setUserAnnotations(updatedTasks);

      // Clear the comment and option for the updated task
      setComments((prev) => {
        const newComments = { ...prev };
        delete newComments[task.TASK_ID];
        return newComments;
      });
      setOptions((prev) => {
        const newOptions = { ...prev };
        delete newOptions[task.TASK_ID];
        return newOptions;
      });

      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(`Error updating task: ${error.message}`);
    }
  };
  useEffect(() => {
    const fetchUserAnnotations = async () => {
      try {
        if (!user || !user.email || !user.role) {
          throw new Error("User information not found");
        }
        const response = await fetch(
          `${import.meta.env.VITE_URL}/api/reviewer?email=` + user.email,
          {
            credentials: "include",
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserAnnotations(data);
      } catch (error) {
        console.error("Error fetching user annotations:", error);
      }
    };

    const fetchMembers = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_URL}/api/userAnnotation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              role: user.role,
            }),
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setMembers(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMembers();
    fetchUserAnnotations();
  }, []);

  return (
    <div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Total Tasks: {userAnnotations.length}
        </h2>
        <h2 className="text-xl font-semibold mb-4">
          {user.email.split("@")[0].charAt(0).toUpperCase() +
            user.email.split("@")[0].slice(1)}
          's Team Members:
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search by Task ID, Developer Comment, or Your Comment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query state on change
            className="border p-2 rounded w-1/5 mx-auto"
          />
        </div>

        <div className="overflow-x-auto mb-2 noselect">
          {members
            .reduce((rows, m, index) => {
              if (index % 6 === 0) rows.push([]);
              rows[rows.length - 1].push(m);
              return rows;
            }, [])
            .map((row, rowIndex) => (
              <div key={rowIndex} className="flex space-x-4 mb-4">
                {row.map((m) => (
                  <div key={m.USER_EMAIL}>
                    <button
                      className={`text-blue-700 px-3 py-2 rounded-full ${
                        selectedMember === m.USER_EMAIL
                          ? "bg-blue-300"
                          : "bg-blue-100"
                      }`}
                      onClick={() => handleMemberSelect(m.USER_EMAIL)}
                    >
                      {m.USER_EMAIL}
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>

        <table className="w-full bg-blue-50 border border-blue-200">
          <thead>
            <tr className="bg-blue-100">
              <th className="py-2 px-4 border-b border-blue-200 text-left">
                Task ID
              </th>
              <th className="py-2 px-4 border-b border-blue-200 text-left">
                Assigned To
              </th>
              <th className="py-2 px-4 border-b border-blue-200 text-left">
                Project ID
              </th>
              <th className="py-2 px-4 border-b border-blue-200 text-left">
                Status
              </th>
              <th className="py-2 px-4 border-b border-blue-200 text-left">
                Updated Date
              </th>
              <th className="py-2 px-4 border-b border-blue-200 text-left">
                Comment from Developer
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
            {searchedUserAnnotations.length > 0 ? (
              searchedUserAnnotations.map((task) => (
                <tr
                  key={task.TASK_ID + task.USER_EMAIL}
                  className="text-center"
                >
                  <td className="py-2 px-4 border-b border-blue-200">
                    <a
                      href={`https://notlabel-studio.toloka-test.ai/projects/${task.PROJECT}/data?tab=13807&page=1&task=${task.TASK_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {task.TASK_ID}
                      {console.log(task)}
                    </a>
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {task.USER_EMAIL}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {task.PROJECT}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    <select
                      className="bg-white border border-blue-300 rounded px-2 py-1"
                      value={options[task.TASK_ID] || task.STATUS}
                      onChange={(e) =>
                        handleOptionChange(task.TASK_ID, e.target.value)
                      }
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Rewrite">Rewrite</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {new Date(task.UPDATED_AT).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    <textarea
                      className="w-full bg-white border border-blue-300 rounded px-2 py-1"
                      rows="3"
                      defaultValue={task.COMMENT_BY_DEVELOPER || ""}
                      disabled
                    />
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    <textarea
                      className="w-full bg-white border border-blue-300 rounded px-2 py-1"
                      rows="3"
                      onChange={(e) =>
                        handleCommentChange(task.TASK_ID, e.target.value)
                      }
                      value={comments[task.TASK_ID] || ""}
                      placeholder="Your comment here..."
                    />
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {task.LANGUAGE}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    <button
                      className="bg-blue-300 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleUpdate(task)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="py-2 px-4 border-b border-blue-200 text-center"
                >
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reviewer;
