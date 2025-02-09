import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRegSave, FaRegClock } from "react-icons/fa";
import { useProjectContext } from "../../contextapi/allcontext";
import { FiSearch } from "react-icons/fi";
import { FaRegUser,FaTrashAlt } from "react-icons/fa";
import { GrClose } from "react-icons/gr";

const MemberSearch = ({ members, onSelect, initialEmail }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(initialEmail || "");

  const filteredMembers = members.filter(
    (member) =>
      member.USER_EMAIL &&
      member.USER_EMAIL.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (email) => {
    setSelectedMember(email);
    setSearchQuery("");
    setIsDropdownOpen(false);
    onSelect(email);
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

          {/* Dropdown */}
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

const EditTaskComponent = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      console.log("USER ROLE: ", user.role);
    }
  }, [user]);

  const navigate = useNavigate();
  const { task: initialTask, projectName } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const { usersDetails, GetUser } = useProjectContext();

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

  const validate = (values) => {
    const errors = {};
    if (!values.user_email) {
      errors.user_email = "User email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.user_email)) {
      errors.user_email = "Invalid email format";
    }
    if (!values.task_name?.trim())
      errors.task_name = "Task description is required";
    if (!values.task_status) errors.task_status = "Task status is required";
    if (!values.start_date) errors.start_date = "Start date is required";
    if (!values.end_date) errors.end_date = "End date is required";
    if (
      values.start_date &&
      values.end_date &&
      values.start_date > values.end_date
    ) {
      errors.end_date = "End date must be after start date";
    }
    return errors;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/updateTrackerTask`,
        {
          user_email: values.user_email,
          task_name: values.task_name,
          task_status: values.task_status,
          start_date: values.start_date,
          end_date: values.end_date,
          project_name: values.project_name,
          task_id: values.task_id,
        }
      );

      if (response.status === 200) {
        toast.success("Task updated successfully!");
        navigate(-1);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update task");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const initialValues = {
    user_email: initialTask?.USER_EMAIL || "",
    task_name: initialTask?.TASK_NAME || "",
    task_status: initialTask?.TASK_STATUS || "",
    start_date: initialTask?.START_DATE?.split("T")[0] || "",
    end_date: initialTask?.END_DATE?.split("T")[0] || "",
    project_name: initialTask?.PROJECT_NAME || "",
    task_id: initialTask?.TASK_ID || "",
  };

  const [isDeleting, setIsDeleting] = useState(false);
  
  //console.log("id ",initialValues.task_id);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`${import.meta.env.VITE_URL}/api/deleteTask/${initialValues.task_id}`, { method: "DELETE" });
      
      toast.success("Task deleted successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };


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
            <h1 className="text-2xl font-bold text-white">Edit Task</h1>
            <div className="w-24"></div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 border-b border-blue-200">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="font-medium text-gray-600 mr-2">Task ID:</span>
              <span className="text-blue-600">{initialTask?.TASK_ID}</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="font-medium text-gray-600 mr-2">Sequence:</span>
              <span className="text-blue-600">
                {initialTask?.PROJECT_T_SEQ}
              </span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
              <FaRegClock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-600">
                Created:{" "}
                {new Date(initialTask?.CREATE_DATE_TIME).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Formik
            initialValues={initialValues}
            validate={validate}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                      </label>
                      <Field
                        type="text"
                        name="project_name"
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <div className="relative">
                        <Field
                          type="date"
                          name="start_date"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <ErrorMessage
                        name="start_date"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Description
                      </label>
                      <Field
                        type="text"
                        name="task_name"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <ErrorMessage
                        name="task_name"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned Member
                      </label>
                      <MemberSearch
                        members={members}
                        onSelect={(email) => setFieldValue("user_email", email)}
                        initialEmail={initialValues.user_email}
                      />
                      <ErrorMessage
                        name="user_email"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <div className="relative">
                        <Field
                          type="date"
                          name="end_date"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <ErrorMessage
                        name="end_date"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Status
                      </label>
                      <Field
                        as="select"
                        name="task_status"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        
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
                      </Field>
                      <ErrorMessage
                        name="task_status"
                        component="div"
                        className="mt-1 text-sm text-red-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">

                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete} // Ensure you have this function in your component
                    className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all ${isDeleting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg"
                      }`}
                  >
                    <FaTrashAlt className="h-5 w-5 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Task"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all ${isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                      }`}
                  >
                    <FaRegSave className="h-5 w-5 mr-2" />
                    {isSubmitting ? "Updating..." : "Update Task"}
                  </button>
                  


                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default EditTaskComponent;
