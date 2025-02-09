import React, { useState } from "react";
import { toast } from "react-toastify";

const ReviewerModal = ({ isOpen, onClose, selectedDevelopers, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);

  if (!isOpen) return null;

  const handleMakeReviewer = async () => {
    if (!selectedDeveloper) {
      toast.warning("Please select a developer");
      return;
    }

    // Show confirmation toast
    setTimeout(() => {
      toast.info("Processing your request...", {
        autoClose: 1500,
      });
    }, 1000);

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/makeReviewer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            developers: [selectedDeveloper],
            adminEmail: user.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Show success toast with developer name
      setTimeout(() => {
        toast.success(
          <div>
            ✅ Reviewer assigned successfully!
            <br />
            <span className="font-semibold">
              {selectedDeveloper.USER_EMAIL.split("@")[0]}
            </span>{" "}
            is now a reviewer
          </div>,
          {
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }, 3000);

      // Close modal after successful assignment
      setTimeout(() => {
        onClose();
      }, 4000);
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      setTimeout(() => {
        toast.success(
          <div>
            ✅ Reviewer assigned successfully!
            <br />
            <span className="font-semibold">
              {selectedDeveloper.USER_EMAIL.split("@")[0]}
            </span>{" "}
            is now a reviewer
          </div>,
          {
            autoClose: 4000,
          }
        );
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assign Reviewer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold px-2"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Selected developer will be granted reviewer privileges. They will
            be able to review and approve other developers' work.
          </p>
        </div>

        <div className="max-h-60 overflow-y-auto mb-6 border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Select
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Location
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Skills
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {selectedDevelopers.map((dev) => (
                <tr key={dev.USER_ID} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="radio"
                      name="selectedDeveloper"
                      checked={selectedDeveloper?.USER_ID === dev.USER_ID}
                      onChange={() => {
                        setSelectedDeveloper(dev);
                        toast.info(
                          <div>
                            👤 Selected: <br />
                            <span className="font-semibold">
                              {dev.USER_EMAIL.split("@")[0]}
                            </span>
                          </div>,
                          {
                            autoClose: 2000,
                          }
                        );
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {dev.USER_ID}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {dev.USER_EMAIL}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {dev.LOCATION}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {dev.SKILLSETS ? (
                      <div className="flex flex-wrap gap-1">
                        {dev.SKILLSETS.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {dev.SKILLSETS.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            +{dev.SKILLSETS.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleMakeReviewer}
            disabled={isLoading || !selectedDeveloper}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Assigning...
              </span>
            ) : (
              "Confirm Assignment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewerModal;
