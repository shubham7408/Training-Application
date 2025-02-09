import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../../contextapi/allcontext";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaRegSave,
  FaRegCalendarAlt,
  FaRegUser,
} from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { GrClose } from "react-icons/gr";

const MemberSearch = ({ members, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");

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
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
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
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div
                    key={member.USER_EMAIL}
                    className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 flex items-center space-x-3"
                    onClick={() => handleSelect(member.USER_EMAIL)}
                  >
                    <FaRegUser className="h-4 w-4 text-gray-500" />
                    <span>{member.USER_EMAIL}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center">
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

const Trainings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const { usersDetails, GetUser } = useProjectContext();
  const [errors, setErrors] = useState({});

  const TRAINING_STATUSES = ["Not Assigned", "Assigned"];

  const [formData, setFormData] = useState({
    user_email: "",
    training_id: "",
    status: "",
  });

  useEffect(() => {
    if (!usersDetails || usersDetails.length === 0) {
      GetUser();
    } else {
      setMembers(usersDetails);
    }

    // Fetch available trainings
    fetchTrainings();
  }, [usersDetails, GetUser]);

  const fetchTrainings = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/getCourseTrainings`
      );
      if (response.ok) {
        const data = await response.json();
        setTrainings(data);
      }
    } catch (error) {
      toast.error("Failed to fetch trainings");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.user_email) {
      newErrors.user_email = "User email is required";
    }
    if (!formData.training_id) {
      newErrors.training_id = "Training course is required";
    }
    if (!formData.status) {
      newErrors.status = "Status is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/assignTraining`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Training assigned successfully!");
        navigate(-1);
      } else {
        throw new Error("Failed to assign training");
      }
    } catch (error) {
      toast.error("Failed to assign training");
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

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" data-aos="fade-down"
      data-aos-duration="500"
      data-aos-easing="ease-in-out">
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
            <h1 className="text-2xl font-bold text-white">Assign Training</h1>
            <div className="w-24"></div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 border-b border-blue-100">
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
              <FaRegCalendarAlt className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-gray-600">Training Assignment Form</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Member
                </label>
                <MemberSearch
                  members={members}
                  onSelect={(email) =>
                    setFormData((prev) => ({ ...prev, user_email: email }))
                  }
                />
                {errors.user_email && (
                  <div className="mt-1 text-sm text-red-600">
                    {errors.user_email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Training
                </label>
                <select
                  name="training_id"
                  value={formData.training_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Training Course</option>
                  {trainings.map((training) => (
                    <option
                      key={training.TRAINING_ID}
                      value={training.TRAINING_ID}
                    >
                      {training.TRAINING_NAME}
                    </option>
                  ))}
                </select>
                {errors.training_id && (
                  <div className="mt-1 text-sm text-red-600">
                    {errors.training_id}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  {TRAINING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <div className="mt-1 text-sm text-red-600">
                    {errors.status}
                  </div>
                )}
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
                {isLoading ? "Sending..." : "Sending For Approval"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Trainings;
