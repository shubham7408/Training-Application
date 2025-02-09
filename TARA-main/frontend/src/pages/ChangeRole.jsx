import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useProjectContext } from "../contextapi/allcontext";

const ChangeRole = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { usersDetails, GetUser } = useProjectContext();

  useEffect(() => {
    if (!usersDetails || usersDetails.length === 0) {
      GetUser(); // Fetch users only if `usersDetails` is empty
    } else {
      setMembers(usersDetails); // Set fetched users
    }
  }, [usersDetails, GetUser]);

  const filteredMembers = useMemo(() => {
    if (searchQuery.trim() === "") return members;
    return members.filter((member) =>
      member.USER_EMAIL.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, members]);

  const handleRoleChange = (e) => setRole(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMember || !role) {
      toast.error("Please select a member and a role");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/changeRole`,
        {
          memberEmail: selectedMember,
          role: role,
        }
      );

      if (response.status === 200) {
        toast.success("Role updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update role, try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-8" data-aos="fade-right">
      <div className="py-8">
        <div className="mb-6">
          <center>
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">
              Change User Role
            </h2>
          </center>
          <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="member"
                  className="block text-md font-semibold text-gray-700"
                >
                  Select Member:
                </label>
                <input
                  type="text"
                  id="member"
                  className="mt-1 block w-full p-3 border border-gray-900 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                  placeholder="Search a member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md shadow-sm">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <div
                        key={member.USER_EMAIL}
                        className={`p-3 cursor-pointer hover:bg-blue-200 ${
                          selectedMember === member.USER_EMAIL
                            ? "bg-blue-400"
                            : ""
                        }`}
                        onClick={() => setSelectedMember(member.USER_EMAIL)}
                      >
                        {member.USER_EMAIL}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">No members found</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-md font-semibold text-gray-700">
                  Role:
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="developer"
                      name="role"
                      value="Developer"
                      checked={role === "Developer"}
                      onChange={handleRoleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="developer"
                      className="ml-2 text-gray-700 text-lg"
                    >
                      Make Developer
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="reviewer"
                      name="role"
                      value="Reviewer"
                      checked={role === "Reviewer"}
                      onChange={handleRoleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="reviewer"
                      className="ml-2 text-gray-700 text-lg"
                    >
                      Make Reviewer
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 ${
                  loading ? "bg-gray-400" : "bg-blue-600"
                } text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeRole;
