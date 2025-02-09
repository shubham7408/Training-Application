import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProjectContext } from "../../contextapi/allcontext";
import { toast } from "react-toastify";
import { FaArrowLeft, FaRegSave, FaRegCalendarAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { GrClose } from "react-icons/gr";
import {
  FaRegUser,
} from "react-icons/fa";
import axios from "axios";

const MemberSearch = ({ members, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [user, setUser] = useState(null);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      member.USER_EMAIL &&
      member.USER_EMAIL.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (email) => {
    const member = members.find((m) => m.USER_EMAIL === email);
    if (member) {
      setSelectedMember(email);
      const details = {
        email: member.USER_EMAIL,
        otherEmail: member.OTHER_EMAIL,
      };
      setSelectedMemberDetails(details);
      // window.alert(`Other Email: ${member.OTHER_EMAIL}`);
      setSearchQuery("");
      setIsDropdownOpen(false);
      onSelect(details);
    }
  };

  const handleClear = () => {
    setSelectedMember("");
    setSearchQuery("");
    onSelect("");
  };

  return (
    <div className="space-y-4">
      {selectedMember && (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <FaRegUser className="h-5 w-5 text-blue-500" />
            <span className="text-blue-600 font-medium">{selectedMember}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-blue-100 rounded-full transition-colors"
          >
            <GrClose className="h-4 w-4 text-blue-600" />
          </button>
        </div>
      )}

      {!selectedMember && (
        <div className="relative">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a member..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {isDropdownOpen && searchQuery && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-10 overflow-y-auto">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div
                    key={member.USER_EMAIL}
                    className="p-2 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 flex items-center space-x-3"
                    onClick={() => handleSelect(member.USER_EMAIL)}
                  >
                    <FaRegUser className="h-4 w-4 text-gray-500" />
                    <span>{member.USER_EMAIL}</span>
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-center">
                  No members found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CreateTask = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const { usersDetails, GetUser } = useProjectContext();
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [formData, setFormData] = useState({
    user_email: "",
    task_name: "",
    task_status: "Not Started",
    start_date: "",
    end_date: "",
    project_name: name || "",
    create_date_time: new Date().toISOString(),
  });

  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL}/api/getProjectsTracker`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
        setFilteredProjects(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) =>
          project.PROJECT_NAME.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, projects]);

  const handleSelectProject = (projectName) => {
    setFormData((prevData) => ({
      ...prevData,
      project_name: projectName,
    }));
    setSearchTerm("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && formData.project_name) {
      setFormData((prevData) => ({ ...prevData, project_name: "" }));
    }
  };

  const handleProjectInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFormData((prevData) => ({
      ...prevData,
      project_name: value,
    }));
  };

  const handleClearInput = () => {
    setFormData((prevData) => ({
      ...prevData,
      project_name: "",
    }));
    setSearchTerm("");
  };

  const TASK_STATUSES = [
    "Not Started",
    "In Progress",
    "Completed(Submit for Admin Approval)",
  ];

  
  

  useEffect(() => {
    if (!usersDetails || usersDetails.length === 0) {
      GetUser();
    } else {
      setMembers(usersDetails);
    }
  }, [usersDetails, GetUser]);

  const validate = () => {
    const newErrors = {};
    if (!formData.user_email) {
      newErrors.user_email = "User email is required";
    }
    if (!formData.task_name?.trim()) {
      newErrors.task_name = "Task description is required";
    }
    if (!formData.task_status) {
      newErrors.task_status = "Task status is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (
      formData.start_date &&
      formData.end_date &&
      formData.start_date > formData.end_date
    ) {
      newErrors.end_date = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendMail = async (email,
    taskDescription,
    projectName,
    markedAs,
    assignedBy,
    startDate,
    endDate) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_URL}/api/sendMail`, {
        email,
        taskDescription,
        projectName,
        markedAs,
        assignedBy,
        startDate,
        endDate
      });

      if (response.status === 200) {
        toast.success('Mail notification sent successfully!');
        setMessage('');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send mail");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    const { task_name, project_name, task_status, start_date, end_date } = formData;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/createTrackerTasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.status === 200) {
        sendMail(selectedMemberDetails.otherEmail, task_name, project_name, task_status, user.email, start_date, end_date);
        toast.success("Task Added successfully!");
        navigate(-1);
      } else {
        throw new Error("Failed to create task");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-500 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <FaArrowLeft className="h-5 w-5 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white">Create New Task</h1>
            <div className="w-24"></div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 border-b border-blue-100">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
              <FaRegCalendarAlt className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-600">
                Created: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="project_name"
                      value={formData.project_name}
                      onChange={handleProjectInputChange}
                      disabled={isLoading}
                      className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-gray-50"
                      placeholder="Search project"
                    />
                    {formData.project_name && (
                      <button
                        onClick={handleClearInput}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        type="button"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    {searchTerm && (
                      <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg mt-1 z-10">
                        <ul className="max-h-48 overflow-y-auto">
                          {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                              <li
                                key={project.PROJECT_NAME}
                                onClick={() =>
                                  handleSelectProject(project.PROJECT_NAME)
                                }
                                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                              >
                                {project.PROJECT_NAME}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-2 text-gray-500">
                              No projects found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {error && <div className="text-red-500 mt-2">{error}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.start_date && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.start_date}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Description
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Task Description"
                    name="task_name"
                    value={formData.task_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.task_name && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.task_name}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Member
                  </label>
                  <MemberSearch
                    members={members}
                    onSelect={(selected) => {
                      setFormData((prev) => ({ ...prev, user_email: selected.email }));
                      setSelectedMemberDetails(selected);
                    }}
                  />
                  {errors.user_email && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.user_email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.end_date && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.end_date}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Status
                  </label>
                  <select
                    name="task_status"
                    value={formData.task_status}
                    onChange={handleChange}

                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >

                    {/* <option value="" >
                      
                    </option> */}

                    {TASK_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={
                          user?.role === "Admin" &&
                            status === "Completed(Submit for Admin Approval)"
                            ? "Completed"
                            : status ===
                              "Completed(Submit for Admin Approval)"
                              ? "Completed_1"
                              : status
                        }
                      >
                        {user?.role === "Admin" &&
                          status === "Completed(Submit for Admin Approval)"
                          ? "Completed"
                          : status}
                      </option>
                    ))}
                  </select>
                  {errors.task_status && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.task_status}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all ${isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                  }`}
              >
                <FaRegSave className="h-5 w-5 mr-2" />
                {isLoading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
