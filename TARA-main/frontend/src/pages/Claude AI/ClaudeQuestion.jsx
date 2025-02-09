import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation  } from "react-router-dom";
import { MdAddCircle } from "react-icons/md";
import ClaudeCollection from "./ClaudeCollection";
import { HiOutlineDocumentText } from "react-icons/hi2";


const ClaudeQuestion = () => {
  const { id } = useParams();
  const [questionData, setQuestionData] = useState(null);

  const [ids, setIds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  // Pagination Logic
  const totalRows = ids.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const currentRows = ids.slice(startRow, startRow + rowsPerPage);

  useEffect(() => {
    fetchClaudeAiIds();
  }, []);

  const location = useLocation(); // Access the state passed during navigation
  
  useEffect(() => {
    // Set showForm to true if state contains it
    if (location.state?.showForm) {
      setShowForm(true);
    }
  }, [location.state]);

  const fetchClaudeAiIds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/claude-ai-ids`);
      const data = await response.json();
      setIds([...data]);
    } catch (error) {
      console.error("Error fetching IDs:", error);
      setError("Failed to fetch IDs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch question data including the correct answer
    fetch(`${import.meta.env.VITE_URL}/api/claude-ai-question/${id}`)
      .then((res) => res.json())
      .then((data) => setQuestionData(data))
      .catch((error) => console.error("Error fetching question:", error));
  }, [id]);



  const handleForm = () => {
    setShowForm(prev => !prev);
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

  const [selectedRowIndex, setSelectedRowIndex] = useState(null);



  if (!questionData)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="flex h-full w-full  bg-gray-100">
      {/* Sidebar */}

      <div className=" flex flex-col h-screen w-full bg-gray-50">
        <div className="flex flex-1 p-6 ">
          <div className="w-full  grid grid-cols-10 p-6 bg-white rounded-lg shadow-lg gap-6 border-l border-gray-200">
          <div className=" col-span-1">
          </div>  
            
            {/* Indexes */}
            <div className="col-span-3 border border-gray-300 rounded-lg p-6 bg-gray-100 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">STEM Data Plan Questions</h2>
                <button
                  className="text-3xl p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                  onClick={handleForm}
                >
                  {showForm ? (

                    <HiOutlineDocumentText title="Show Document" size={40} />
                  ) : (
                    <MdAddCircle title="Add New Entry" size={40} />
                  )}

                </button>
              </div>

              <div className="border border-blue-300 rounded-lg p-4">
                {loading ? (
                  <div className="text-gray-500">Loading...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : ids.length === 0 ? (
                  <div className="text-gray-500">No Question IDs found</div>
                ) : (
                  <div className="overflow-y-auto h-screen border border-blue-200">
                    <table className="w-full table-auto bg-red-50 border border-red-100">
                      <thead>
                        <tr className="bg-blue-100">
                          <th className="py-2 px-4 border-b border-blue-200 text-left">
                            Question ID
                          </th>
                          <th className="py-2 px-4 border-b border-blue-200 text-left">
                            Subject
                          </th>
                          <th className="py-2 px-4 border-b border-blue-200 text-center">
                            Question
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRows.map((id, index) => (
                          <tr
                            key={index}
                            // className="hover:bg-blue-100 cursor-pointer transition-colors duration-150"
                            className={`cursor-pointer transition-colors duration-150 ${selectedRowIndex === index ? "bg-blue-200" : "hover:bg-blue-100"
                              }`}
                            onClick={() => {
                              setSelectedRowIndex(index);
                              setShowForm(false);
                            }}

                          >
                            <td className="py-2 px-4 border-b border-blue-200">
                              <Link
                                to={`/projects/ClaudeAI/${id.ID}`}
                                className="text-blue-600 hover:underline"
                              >
                                {id.ID}
                              </Link>
                            </td>
                            <td className="py-2 px-4 border-b ">
                              <Link
                                to={`/projects/ClaudeAI/${id.ID}`}
                                className="hover:underline"
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
              <div className="flex justify-end items-center mt-4 space-x-4">
                {/* Current Rows Display */}
                <div className="text-gray-600">
                  Showing {startRow + 1}-{Math.min(startRow + rowsPerPage, totalRows)} of{" "}
                  {totalRows}
                </div>

                {/* Pagination Buttons */}
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

                {/* Rows Per Page Dropdown */}
                <select
                  className="p-2 border border-gray-300 rounded"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                >

                  <option value={30}>30 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>

            {/* Main Content */}
            <div className="border col-span-6  rounded-sm  bg-gray-50 overflow-y-auto">
              {showForm ? (
                <div className="w-full h-full bg-white shadow-lg rounded-lg">
                  <ClaudeCollection />
                </div>
              ) : (
                <div className="w-full h-full max-w-8xl flex flex-1 justify-center ">
                  <div className="w-full h-full max-w-8xl flex flex-1 justify-center p-2">
                    <div className="w-full h-full bg-white shadow-lg rounded-lg">

                      <div className="bg-white p-6 m-3 rounded-lg shadow-lg border border-gray-200 mb-8">

                        <h1 className="flex justify-center text-2xl font-semibold underline  mb-4">
                          {questionData.SUBJECT}
                        </h1><br />

                        <h1 className="flex justify-center text-2xl font-bold text-blue-600  mb-4">
                          Question ID: {id}
                        </h1><br />

                        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
                          {questionData.QUESTION}
                        </h2><br />
                      </div>
                      <div
                        className="w-full p-6 space-y-8"
                        style={{ maxHeight: "100vh", overflowY: "auto" }}
                      >
                        {/* Row 1 */}
                        <div className="flex flex-wrap gap-4 mb-8">
                          {/* STEP 1: Correct Answer */}
                          {questionData.ANSWER && (
                            <div className="flex-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                              <h1 className="text-2xl font-bold text-blue-600 text-center mb-6">
                                Answer from Domain SME
                              </h1>
                              <div className="space-y-4">
                                {[1, 2, 3, 4].map((num) => (
                                  <div
                                    key={num}
                                    className="relative group bg-gray-50 p-4 rounded-lg border border-gray-300 hover:bg-blue-50 transition-all duration-200 ease-in-out"
                                  >
                                    <span className="text-gray-700 text-lg group-hover:text-blue-600 transition-colors duration-200">
                                      {questionData[`OPTION${num}`]}
                                    </span>
                                  </div>
                                ))}
                                {/* Correct Answer Display */}
                                <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
                                  <p className="font-medium">Correct Answer:</p>
                                  <p className="text-lg font-semibold">{questionData.ANSWER}</p>
                                </div>
                              </div>
                            </div>
                          )}


                          {/* STEP 3: ChatGPT's Answer */}
                          {questionData.WRONGANSBYGPT && (
                            <div className="flex-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                              <h1 className="text-2xl font-bold text-blue-600 text-center mb-6">
                                Answer from GenAI(ChatGPT 4.0)
                              </h1>
                              <div className="flex flex-col space-y-4">
                                <div className="bg-gray-100 p-4 rounded-lg shadow-lg max-w-xs self-end animate-chat-message">
                                  <h2 className="text-lg font-semibold text-gray-800">
                                    {questionData.QUESTION}
                                  </h2>
                                  <div className="space-y-3">
                                    {[1, 2, 3, 4].map((num) => (
                                      <div
                                        key={num}
                                        className="bg-white p-4 rounded-lg shadow-lg max-w-xs self-start animate-chat-message"
                                      >
                                        <span className="text-gray-700">
                                          {questionData[`OPTION${num}`]}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg shadow-lg max-w-xs self-start animate-chat-message">
                                  <p className="text-gray-800 font-semibold">
                                    <span className="text-red-600">{questionData.WRONGANSBYGPT}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Row 2 */}
                        <div className="flex flex-wrap gap-4">
                          {/* STEP 2: Real-World Solution with reference */}
                          {questionData.REALANSWER && (
                            <div className="flex-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                              <h1 className="text-2xl font-bold text-blue-600 text-center mb-6">
                                Real world Solution/Reference from Domain SME
                              </h1>
                              {/* <p className="text-black-200 font-bold mb-4">
      Answer as per {questionData.ANSWEREDBY}
    </p> */}
                              <div className="text-gray-800 font-medium">
                                <img
                                  src={questionData.REALANSWER}
                                  alt="Real-world solution"
                                  className="max-w-full h-auto"
                                />
                                {/* {questionData.REALANSWER is sometimes null} */}
                              </div>
                            </div>
                          )}

                          {/* STEP 4: Steps Followed by ChatGPT */}
                          {questionData.GPTSTEPS && (
                            <div className="flex-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                              <h1 className="text-2xl font-bold text-blue-600 text-center mb-6">
                                Solution from GenAI(ChatGPT 4.0)
                              </h1>
                              <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">
                                Steps Followed by ChatGPT
                              </h2>
                              <div className="text-gray-800 font-medium">
                                <img
                                  src={questionData.GPTSTEPS}
                                  alt="Steps followed by ChatGPT"
                                  className="max-w-full h-auto"
                                />
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaudeQuestion;
