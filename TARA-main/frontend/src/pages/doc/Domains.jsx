import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { FaRegFileExcel } from "react-icons/fa";
import { FiChevronDown, FiChevronRight, FiFilter } from "react-icons/fi";
import ExpandableCell from "./ExpendedCell";

const Domains = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    activeView: "",
  });
  const [activeView, setActiveView] = useState("");
  const handleViewChange = (view) => {
    setActiveView(view);
    setFormData((prevData) => ({
      ...prevData,
      activeView: view,
    }));
  };
  const [selectedDomain, setSelectedDomain] = useState("Healthcare");
  const [isColumnVisibilityVisible, setColumnVisibilityVisible] =
    useState(false);
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [viewMode, setViewMode] = useState("default"); // "default" or "all"

  const [fileData, setFileData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    FILE_ID: true,
    FILE_NAME: true,
    LICENSE_URL: true,
    NUMBER_OF_IMAGES: true,
    NUMBER_OF_TABLES: true,
    LICENSE_NAME: true,
    NOTES: true,
    IMAGE_QUESTIONS: true,
    TEXT_QUESTIONS: true,
    TABLE_QUESTIONS: true,
  });
  useEffect(() => {
    if (viewMode === "all") {
      fetchAllFiles();
    } else {
      fetchFilesByDomain(selectedDomain);
    }
  }, [selectedDomain, viewMode]);

  const fetchAllFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/allfile`
      );
      setFileData(response.data);
    } catch (error) {
      console.error("Error fetching all files:", error);
      setError("Failed to fetch files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFilesByDomain(selectedDomain);
  }, [selectedDomain]);

  const fetchFilesByDomain = async (domain, type = activeView) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/allfile?domain=${domain}&type=${type}`
      );
      setFileData(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to fetch files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    setViewMode("default");
    setActiveView(""); // Reset activeView directly
    setFormData((prevData) => ({
      ...prevData,
      activeView: "", // Reset activeView in formData as well
    }));
    // Pass empty string as type explicitly to ensure it's cleared
    fetchFilesByDomain(domain, "");
  };
  const handleArrowClick = (e, domain) => {
    e.stopPropagation(); // Prevent triggering the parent div's onClick
    setExpandedDomain(expandedDomain === domain ? null : domain);
  };

  const handleMainSeeAll = () => {
    setViewMode("all");
    setExpandedDomain(null);
    setActiveView(""); // Reset activeView
    setFormData((prevData) => ({
      ...prevData,
      activeView: "", // Reset activeView in formData as well
    }));
  };

  const handleRowClick = (file) => {
    navigate(
      `/projects/DomainManagement/doc/domains/qapage?fileId=${
        file.FILE_ID
      }&domain=${file.DOCUMENT_DOMAIN}&fileName=${encodeURIComponent(
        file.FILE_NAME
      )}`,
      {
        state: { fileData: file },
      }
    );
  };
  const handleTypeClick = (domain, type) => {
    setSelectedDomain(domain);
    setActiveView(type);
    setFormData((prevData) => ({
      ...prevData,
      activeView: type,
    }));
    fetchFilesByDomain(domain, type);
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const domains = [
    { id: "Healthcare", label: "Healthcare" },
    { id: "Finance", label: "Finance" },
    { id: "Technology", label: "Technology" },
  ];

  const exportToExcel = () => {
    const table = document.getElementById("table-for-excel");
    const workbook = XLSX.utils.table_to_book(table);
    XLSX.writeFile(workbook, `${selectedDomain}-Report.xlsx`);
  };

  const toggleColumnVisibility = () => {
    setColumnVisibilityVisible(!isColumnVisibilityVisible);
  };

  return (
    <div className="flex flex-col h-screen bg-blue-50 ">
      <button
        type="button"
        className="absolute top-18 left-20 p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        onClick={() => navigate(-1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="flex flex-1 ">
        <div className="w-1/5 bg-blue-50 text-blue-800 font-medium text-lg p-4 pl-[12vw]">
          <div className="text-bold mb-5">
            Domains:
            <button
              onClick={handleMainSeeAll}
              className="ml-4 text-blue-500 px-3 py-1 mt-4 rounded text-12 hover:text-blue-900"
            >
              See All
            </button>
          </div>
          {domains.map((domain) => (
            <div key={domain.id} className="mb-4">
              <div
                className={`flex items-center py-2 px-2 cursor-pointer hover:bg-blue-200 rounded-md transition-colors duration-200 ${
                  selectedDomain === domain.id && viewMode === "default"
                    ? "font-bold bg-blue-100"
                    : ""
                }`}
              >
                <div
                  className="mr-2 cursor-pointer hover:bg-blue-300 rounded-full p-1 transition-colors duration-200"
                  onClick={(e) => handleArrowClick(e, domain.id)}
                >
                  {expandedDomain === domain.id ? (
                    <FiChevronDown className="w-4 h-4" />
                  ) : (
                    <FiChevronRight className="w-4 h-4" />
                  )}
                </div>
                <div
                  className="flex-grow"
                  onClick={() => handleDomainChange(domain.id)}
                >
                  {domain.label}
                </div>
              </div>

              {expandedDomain === domain.id && (
                <div className="ml-8 mt-2 flex flex-col space-y-2 bg-white rounded-md p-3 shadow-sm border border-blue-100">
                  <button
                    onClick={() => handleDomainChange(domain.id)}
                    className="flex items-center text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    <span className="w-20">See All</span>
                  </button>
                  <button
                    onClick={() => handleTypeClick(domain.id, "text")}
                    className="flex items-center text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    <span className="w-20">Text</span>
                  </button>
                  <button
                    onClick={() => handleTypeClick(domain.id, "image")}
                    className="flex items-center text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    <span className="w-20">Image</span>
                  </button>
                  <button
                    onClick={() => handleTypeClick(domain.id, "table")}
                    className="flex items-center text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors duration-200"
                  >
                    <span className="w-20">Table</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Main Content */}
        <div className="flex-1 p-6 bg-white border-l border-blue-200 overflow-x-auto">
          <div className="border border-blue-300 rounded-lg p-4">
            <div className="flex w-full justify-between items-center mb-2">
              <h2 className="mt-2 text-xl font-semibold mb-4">
                {selectedDomain} :
              </h2>
              <div className="flex flex-row">
                <button
                  onClick={() => exportToExcel()}
                  className="flex items-center bg-blue-500 hover:bg-blue-600 rounded-md p-2 text-white font-bold text-[1rem] mr-2"
                >
                  <span className="text-[1.5rem]">
                    <FaRegFileExcel />
                  </span>
                  &nbsp; Export to Excel
                </button>
                <div className="">
                  <button
                    className="flex items-center text-blue-600 bg-white border border-blue-300 rounded-md p-2 hover:bg-blue-100 font-bold text-[1rem]"
                    onClick={toggleColumnVisibility}
                  >
                    <span className="text-[1.5rem]">
                      <FiFilter />
                    </span>
                    &nbsp; Filter Columns
                  </button>

                  {isColumnVisibilityVisible && (
                    <div className="absolute bg-white shadow-lg mt-1 w-30 rounded-md border border-blue-300 z-10">
                      {Object.keys(visibleColumns).map((column) => (
                        <label key={column} className="block p-2">
                          <input
                            type="checkbox"
                            checked={visibleColumns[column]}
                            onChange={() => handleColumnToggle(column)}
                          />
                          <span className="ml-2">
                            {column.replace(/_/g, " ")}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-blue-500">{error}</div>
            ) : fileData.length === 0 ? (
              <div className="text-gray-500">No files found in this domain</div>
            ) : (
              <div className="overflow-x-auto">
                <table
                  className="bg-blue-50 border border-blue-100 w-full max-w-full"
                  id="table-for-excel"
                >
                  <thead>
                    <tr className="bg-blue-100">
                      {visibleColumns.FILE_ID && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          File ID
                        </th>
                      )}
                      {visibleColumns.FILE_NAME && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          File Name
                        </th>
                      )}
                      {visibleColumns.LICENSE_URL && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          License URL
                        </th>
                      )}
                      {visibleColumns.NUMBER_OF_IMAGES && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          Number of Images
                        </th>
                      )}
                      {visibleColumns.NUMBER_OF_TABLES && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          Number of Tables
                        </th>
                      )}
                      {visibleColumns.LICENSE_NAME && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          License Name
                        </th>
                      )}
                      {visibleColumns.NOTES && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          Notes
                        </th>
                      )}
                      {visibleColumns.IMAGE_QUESTIONS && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          Number of Questions in Image
                        </th>
                      )}
                      {visibleColumns.TEXT_QUESTIONS && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          Number of Questions in Text
                        </th>
                      )}
                      {visibleColumns.TABLE_QUESTIONS && (
                        <th className="py-2 px-4 border-b border-r border-blue-200 text-left">
                          Number of Questions in Table
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData
                    .slice() // Create a shallow copy to avoid mutating the original array
                    .sort((a, b) => a.FILE_ID - b.FILE_ID) // Sort in ascending order by FILE_ID
                    .map((file) => (
                      <tr
                        key={file.FILE_ID}
                        className="bg-white hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                        onClick={() => handleRowClick(file)}
                      >
                        {visibleColumns.FILE_ID && (
                          <td className="py-2 px-4 border-b border-r border-blue-200">
                            <ExpandableCell content={file.FILE_ID} />
                          </td>
                        )}
                        {visibleColumns.FILE_NAME && (
                          <td className="py-2 px-4 border-b border-r border-blue-200">
                            <ExpandableCell content={file.FILE_NAME} />
                          </td>
                        )}
                        {visibleColumns.LICENSE_URL && (
                          <td className="py-2 px-4 border-b border-r border-blue-200 break-words whitespace-normal">
                            <ExpandableCell content={file.LICENSE_URL} />
                          </td>
                        )}
                        {visibleColumns.NUMBER_OF_IMAGES && (
                          <td className="py-2 px-4 border-b border-r border-blue-200">
                            <ExpandableCell
                              content={file.NUMBER_OF_IMAGES?.toString()}
                            />
                          </td>
                        )}
                        {visibleColumns.NUMBER_OF_TABLES && (
                          <td className="py-2 px-4 border-b border-r border-blue-200">
                            <ExpandableCell
                              content={file.NUMBER_OF_TABLES?.toString()}
                            />
                          </td>
                        )}
                        {visibleColumns.LICENSE_NAME && (
                          <td className="py-2 px-4 border-b border-r border-blue-200">
                            <ExpandableCell content={file.LICENSE_NAME} />
                          </td>
                        )}
                        {visibleColumns.NOTES && (
                          <td className="py-2 px-4 border-b border-r border-blue-200">
                            <ExpandableCell content={file.NOTES} />
                          </td>
                        )}
                        {visibleColumns.IMAGE_QUESTIONS && (
                          <td className="py-2 px-4 border-b border-r border-blue-200">
                            <ExpandableCell
                              content={file.IMAGE_QUESTIONS?.toString()}
                            />
                          </td>
                        )}
                        {visibleColumns.TEXT_QUESTIONS && (
                          <td className="py-2 px-4 border-b border-r border-blue-200">
                            <ExpandableCell
                              content={file.TEXT_QUESTIONS?.toString()}
                            />
                          </td>
                        )}
                        {visibleColumns.TABLE_QUESTIONS && (
                          <td className="py-2 px-4 border-b border-r border-blue-200">
                            <ExpandableCell
                              content={file.TABLE_QUESTIONS?.toString()}
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Domains;
