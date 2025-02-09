import { useState } from "react";

const SeeAll = () => {
  const [formData, setFormData] = useState({
    activeView: "image",
  });
  const [activeView, setActiveView] = useState("image");
  const handleViewChange = (view) => {
    setActiveView(view);
    setFormData((prevData) => ({
      ...prevData,
      activeView: view,
    }));
  };
  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 h-screen">
      {/* View Buttons */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => handleViewChange("image")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            formData.activeView === "image"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Image
        </button>
        <button
          onClick={() => handleViewChange("table")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            formData.activeView === "table"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Table
        </button>
        <button
          onClick={() => handleViewChange("text")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            formData.activeView === "text"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Text
        </button>
      </div>
    </div>
  );
};
export default SeeAll;
