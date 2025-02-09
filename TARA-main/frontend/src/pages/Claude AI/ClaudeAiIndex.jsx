import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdAdd, MdSearch } from "react-icons/md";

const ClaudeAiIndex = () => {
  const [ids, setIds] = useState([]);
  const [filteredIds, setFilteredIds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination Logic
  const totalRows = filteredIds.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredIds.slice(startRow, startRow + rowsPerPage);

  useEffect(() => {
    fetchClaudeAiIds();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredIds(ids);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = ids.filter(
        (id) =>
          id.ID.toString().includes(lowercaseSearch) ||
          id.SUBJECT.toLowerCase().includes(lowercaseSearch) ||
          id.QUESTION.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredIds(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, ids]);

  const fetchClaudeAiIds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/claude-ai-ids`);
      const data = await response.json();
      setIds(data);
      setFilteredIds(data);
    } catch (error) {
      console.error("Error fetching IDs:", error);
      setError("Failed to fetch IDs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id) => {
    navigate(`/projects/ClaudeAI/${id}/${id}`);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      {/* Back Button */}
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

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-1/5 bg-blue-50 text-blue-800 font-medium text-lg p-4 pl-[12vw]">
          <div className="text-bold mb-5">STEM Data Plan Management:</div>
          <div className="py-2 font-bold bg-blue-100 pl-2">Questions List</div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 p-6 bg-white border-l border-blue-200">
          <div className="border border-blue-300 rounded-lg p-4 flex-1 flex flex-col">
            {/* Title Section */}
            

            {/* Add Question Button and Search Section */}
            <div className="flex justify-between items-center mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">STEM Data Plan Questions</h2>
            </div>

             

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>

              <button
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                onClick={() => navigate(`/projects/ClaudeAI/1/1`, { state: { showForm: true } })}
              >
                <MdAdd className="text-xl" />
                <span>Add New Question</span>
              </button>
            </div>

            {loading ? (
              <div className="text-gray-500 flex-1 flex items-center justify-center">
                Loading...
              </div>
            ) : error ? (
              <div className="text-red-500 flex-1 flex items-center justify-center">
                {error}
              </div>
            ) : filteredIds.length === 0 ? (
              <div className="text-gray-500 flex-1 flex items-center justify-center">
                {searchTerm ? "No matching results found" : "No Question IDs found"}
              </div>
            ) : (
              <div className="border border-blue-200 flex-1">
                <table className="table-auto w-full">
                  <thead className="bg-blue-100 overflow-auto sticky">
                    <tr>
                      <th className="py-2 px-4 border-b border-blue-200 text-left">
                        Question ID
                      </th>
                      <th className="py-2 px-4 border-b border-blue-200 text-left">
                        Subject
                      </th>
                      <th className="py-2 px-4 border-b border-blue-200 text-left">
                        Question
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((id) => (
                      <tr
                        key={id.ID}
                        className="hover:bg-blue-100 cursor-pointer transition-colors duration-150"
                        onClick={() => handleRowClick(id.ID)}
                      >
                        <td className="py-2 px-3 border-b border-blue-200">
                          <Link
                            to={`/projects/ClaudeAI/${id.ID}`}
                            className="text-blue-600 hover:underline"
                          >
                            {id.ID}
                          </Link>
                        </td>
                        <td className="py-2 px-3 border-b border-blue-200">
                          <Link
                            to={`/projects/ClaudeAI/${id.ID}`}
                            className="text-blue-600 hover:underline"
                          >
                            {id.SUBJECT}
                          </Link>
                        </td>
                        <td className="py-2 px-4 border-b border-blue-200">
                          <Link
                            to={`/projects/ClaudeAI/${id.ID}`}
                            className="hover:underline"
                          >
                            {id.QUESTION}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination and Rows Per Page Controls */}
          <div className="bg-white sticky bottom-0 left-0 right-0 border-t border-gray-200 py-4 px-6 flex justify-between items-center">
            {/* Rows Info */}
            <div className="text-gray-600">
              Showing {startRow + 1}-{Math.min(startRow + rowsPerPage, totalRows)} of{" "}
              {totalRows}
            </div>

            {/* Pagination Controls */}
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>

            {/* Rows Per Page */}
            <select
              className="p-2 border border-gray-300 rounded"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={40}>40 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaudeAiIndex;