import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../../contextapi/allcontext";
import { toast } from "react-toastify";
import axios from "axios";
import { FaArrowLeft, FaRegSave } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa";
import { GrClose } from "react-icons/gr";

const MemberSearch = ({
  members,
  onSelect,
  selectedMember: initialSelectedMember,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(
    initialSelectedMember || ""
  );

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

  useEffect(() => {
    setSelectedMember(initialSelectedMember || "");
  }, [initialSelectedMember]);

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
              placeholder="Search for a team lead..."
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
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
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

const NewProjectTracker = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { usersDetails, GetUser } = useProjectContext();

  const [formData, setFormData] = useState({
    project_name: "",
    team_lead: "",
  });

  useEffect(() => {
    if (!usersDetails || usersDetails.length === 0) {
      GetUser();
    } else {
      setMembers(usersDetails);
    }
  }, [usersDetails, GetUser]);

  const validate = () => {
    const newErrors = {};
    if (!formData.project_name?.trim()) {
      newErrors.project_name = "Project name is required";
    }
    if (!formData.team_lead) {
      newErrors.team_lead = "Team lead is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        project_name: formData.project_name.trim(),
        team_lead: formData.team_lead,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/createProjectTracker`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Project added successfully!");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.error ||
          "Error submitting the form. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-2/3 mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-aos="fade-right"
    >
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <FaArrowLeft className="h-5 w-5 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white">
              Create New Project
            </h1>
            <div className="w-24"></div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
                {errors.project_name && (
                  <div className="mt-1 text-sm text-red-600">
                    {errors.project_name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Lead
                </label>
                <MemberSearch
                  members={members}
                  selectedMember={formData.team_lead}
                  onSelect={(email) =>
                    setFormData((prev) => ({ ...prev, team_lead: email }))
                  }
                />
                {errors.team_lead && (
                  <div className="mt-1 text-sm text-red-600">
                    {errors.team_lead}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                  }`}
                >
                  <FaRegSave className="h-5 w-5 mr-2" />
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProjectTracker;
