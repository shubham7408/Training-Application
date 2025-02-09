import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit2 } from "react-icons/fi";

import { IoIosArrowForward, IoIosArrowDown } from "react-icons/io";

import { useProjectContext } from "../../contextapi/allcontext";
import VerificationModal from "./DocumentVerification";

function QaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileData } = location.state || {};
  const [activeView, setActiveView] = useState("image");
  const [isFormActive, setIsFormActive] = useState(false);
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get("fileId");
  const domain = searchParams.get("domain");
  const fileName = searchParams.get("fileName");
  const [submittedData, setSubmittedData] = useState([]);
  const [editableIndex, setEditableIndex] = useState(null);
  const { user } = useProjectContext();
  const [openFiles, setOpenFiles] = useState(new Set());

  const [type, setType] = useState(activeView);
  const [selectedID, setSelectedID] = useState();

  const [formData, setFormData] = useState({
    activeView: "image",
    documentName: fileName,
    pageNumber: null,
    orderOfAppearance: null,
    type: "",
    title: "",
    question: "",
    questionType: "",
    shortAnswer: "",
    longAnswer: "",
    domain: domain,
    empName: user ? user.email : "",
    fileId: fileId || null,
  });

  formData.documentName = fileName;
  formData.domain = domain;
  formData.type = type;

  const [submitError, setSubmitError] = useState("");
  const [reviewStatus, setReviewStatus] = useState({
    question: false,
    shortAnswer: false,
    longAnswer: false,
  });
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        empName: user.email,
      }));
    }
  }, [user, type]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}/api/getQuestions?domain=${domain}&type=${
            formData.activeView
          }&file_id=${fileId}`
        );
        setSubmittedData(response.data);
        //console.log("Response data ",response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [domain, fileId, activeView]);

  const handleViewChange = (view) => {
    setActiveView(view);
    // console.log("Active view",view);

    setType(view);
    setFormData((prevData) => ({
      ...prevData,
      activeView: view,
    }));
  };

  const handleAddClick = () => {
    resetForm();
    setIsFormActive(!isFormActive);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "pageNumber" || name === "orderOfAppearance") {
      processedValue = value === "" ? "" : parseInt(value, 10);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
  };
  const ProgressBar = ({ percentage }) => {
    const getProgressColor = (value) => {
      return value > 50 ? "bg-blue-600" : "bg-green-600";
    };

    // Determine text color based on percentage threshold
    const getTextColor = (value) => {
      return value > 50 ? "text-blue-600" : "text-green-600";
    };
    // Convert string percentage to number and ensure it's valid
    const value = parseInt(percentage) || 0;

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div
          className={`${getProgressColor(
            percentage
          )} h-2.5 rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };
  const [percentages, setPercentages] = useState({
    shortAnswer: 0,
    longAnswer: 0,
    question: 0,
  });
  const [loading, setLoading] = useState({
    shortAnswer: false,
    longAnswer: false,
    question: false,
  });
  const [aiDetection, setAiDetection] = useState({
    shortAnswer: "",
    longAnswer: "",
    question: "",
  });

  const checkAiDetection = async (text, field) => {
    if (!text.trim()) return;

    setLoading((prev) => ({ ...prev, [field]: true }));

    try {
      const response = await fetch(
        "https://nrqbae7ul3.execute-api.ap-south-1.amazonaws.com/prod/ai-detect",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: text }),
        }
      );

      const data = await response.json();
      let output = "";
      let percentage = 0;

      if (data.statusCode === 200) {
        const result = JSON.parse(data.body);
        if (typeof result.prediction === "number") {
          let percentage = parseFloat(result.prediction.toFixed(2));
          setPercentages((prev) => ({
            ...prev,
            [field]: percentage,
          }));

          setAiDetection((prev) => ({
            ...prev,
            [field]: (
              <>
                AI Detection Result: <b>{percentage}%</b>
              </>
            ),
          }));
        } else {
          setAiDetection((prev) => ({
            ...prev,
            [field]: "Unable to determine AI percentage",
          }));
          setPercentages((prev) => ({
            ...prev,
            [field]: 0,
          }));
        }
      } else {
        throw new Error(data.body || "API Error");
      }
    } catch (error) {
      console.error(`Promt is to Small ${field}:`, error);
      setAiDetection((prev) => ({
        ...prev,
        [field]: "Promt is to Small",
      }));
      setPercentages((prev) => ({
        ...prev,
        [field]: 110,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleAiDetection = async (e) => {
    e.preventDefault();
    const name = e.target.name;

    // Reset submit error when starting a new review
    setSubmitError("");

    // Check if the corresponding field has content before making the API call
    if (name === "shortAnswer") {
      if (formData.shortAnswer.trim()) {
        await checkAiDetection(formData.shortAnswer, "shortAnswer");
        setReviewStatus((prev) => ({ ...prev, shortAnswer: true }));
      }
    } else if (name === "longAnswer") {
      if (formData.longAnswer.trim()) {
        await checkAiDetection(formData.longAnswer, "longAnswer");
        setReviewStatus((prev) => ({ ...prev, longAnswer: true }));
      }
    } else if (name === "question") {
      if (formData.question.trim()) {
        await checkAiDetection(formData.question, "question");
        setReviewStatus((prev) => ({ ...prev, question: true }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.question || (!formData.shortAnswer && !formData.longAnswer)) {
      alert(
        "Please fill in the required fields (question and at least one answer type)"
      );
      return;
    }
    const requiredReviews = {
      question: formData.question.trim() !== "",
      shortAnswer: formData.shortAnswer.trim() !== "",
      longAnswer: formData.longAnswer.trim() !== "",
    };
    const missingReviews = Object.entries(requiredReviews)
      .filter(([field, required]) => required && !reviewStatus[field])
      .map(([field]) => field);

    if (missingReviews.length > 0) {
      setSubmitError(
        `Please review these fields before submitting: ${missingReviews.join(
          ", "
        )}`
      );
      return;
    }

    try {
      // Prepare the data to match the structure of submittedData
      const apiData = {
        TYPE: type,
        DOCUMENT_NAME: formData.documentName,
        PAGE_NUMBER: formData.pageNumber,
        ORDER_OF_APPEARANCE_ON_PAGE: formData.orderOfAppearance,
        TITLE: formData.title,
        QUESTION: formData.question,
        QUESTION_TYPE: formData.questionType,
        SHORT_ANSWER: formData.shortAnswer,
        LONG_ANSWER: formData.longAnswer,
        DOMAIN: formData.domain,
        EMP_NAME: user.email,
        FILE_ID: fileId,
      };

      //console.log("Form data :", formData);

      if (editableIndex !== null) {
        // Update existing entry logic
        const itemToUpdate = submittedData[editableIndex];

        // Create updated item by combining existing data with new data
        const updatedItem = {
          ...itemToUpdate, // Keep existing data
          ORDER_OF_APPEARANCE_ON_PAGE: formData.orderOfAppearance,
          PAGE_NUMBER: formData.pageNumber,
          QUESTION_TYPE: formData.questionType,
          QUESTION: formData.question,
          SHORT_ANSWER: formData.shortAnswer,
          LONG_ANSWER: formData.longAnswer,
          TITLE: formData.title,
          FILE_ID: fileId,
          TYPE: type, // Use the current type from state
        };

        // Map frontend field names to backend expected field names
        const mappedPayload = {
          id: selectedID,
          ORDER_OF_APPEARANCE_ON_PAGE: updatedItem.ORDER_OF_APPEARANCE_ON_PAGE,
          PAGE_NUMBER: updatedItem.PAGE_NUMBER,
          QUESTION_TYPE: updatedItem.QUESTION_TYPE,
          QUESTION: updatedItem.QUESTION,
          SHORT_ANSWER: updatedItem.SHORT_ANSWER,
          LONG_ANSWER: updatedItem.LONG_ANSWER,
          TITLE: updatedItem.TITLE,
          FILE_ID: updatedItem.FILE_ID,
          TYPE: type, // Use the current type from state
        };

        try {
          // Perform an API call to update the entry
          const response = await axios.put(
            `${import.meta.env.VITE_URL}/api/update-qa-entry/${selectedID}`,
            mappedPayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success) {
            // Update the submittedData list
            const updatedData = submittedData.map((item, i) =>
              i === editableIndex ? updatedItem : item
            );
            setSubmittedData(updatedData);
            setEditableIndex(null);
          } else {
            console.log("Failed to update QA entry. Please try again.");
          }
        } catch (error) {
          console.error("Error updating entry:", error);
          throw error; // Let the outer try-catch handle this
        }
      } else {
        // Add new entry logic
        const response = await axios.post(
          `${import.meta.env.VITE_URL}/api/qa-entries`,
          apiData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          // Include the QUESTION_ID from the API response in the submitted data
          const newEntry = {
            ...apiData,
            QUESTION_ID: response.data.data.QUESTION_ID,
          };

          setSubmittedData((prevData) => [...prevData, newEntry]);
        } else {
          console.log("Failed to add QA entry. Please try again.");
        }
      }

      // Reset form after submit or update
      resetForm();
      setReviewStatus({
        question: false,
        shortAnswer: false,
        longAnswer: false,
      });

      setPercentages({
        shortAnswer: 0,
        longAnswer: 0,
        question: 0,
      });

      setAiDetection({
        shortAnswer: "",
        longAnswer: "",
        question: "",
      });

      setSubmitError("");
    } catch (error) {
      console.error(
        "Error submitting data:",
        error.response?.data || error.message
      );
      alert("Failed to submit data. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      documentName: "",
      pageNumber: "",
      orderOfAppearance: "",
      title: "",
      question: "",
      questionType: "",
      shortAnswer: "",
      longAnswer: "",
      domain: "",
    });
    setEditableIndex(null);
    setIsFormActive(false);
  };

  const toggleFile = (index) => {
    setOpenFiles((prevOpenFiles) => {
      const updatedOpenFiles = new Set(prevOpenFiles);
      if (updatedOpenFiles.has(index)) {
        updatedOpenFiles.delete(index);
      } else {
        updatedOpenFiles.add(index);
      }
      return updatedOpenFiles;
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleValidation = () => {
    setIsModalOpen(true);
    setCurrentStep(1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
  };

  const handleProceed = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      setIsModalOpen(false);
    }
  };

  // Messages for each step
  const messages = {
    1: "The Form content is valid according to the document.",
    2: "The Form content is valid. Spelling and grammar have been checked!",
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-1 p-6">
        <div className="flex-1 p-6 bg-white rounded-lg shadow-lg grid grid-cols-3 gap-6 border-l border-gray-200 ml-64">
          {/* Document Section */}
          <div className="col-span-2 border border-gray-300 rounded-lg p-6 bg-gray-100 relative">
            <div className="flex items-center justify-center relative">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-800 focus:outline-none absolute ml-[-55vw] z-10"
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
              <h2 className="font-semibold text-xl text-gray-700">
                Document Info
              </h2>
            </div>
            <div className="flex items-center justify-center mt-4 h-[calc(100%-4rem)]">
              {fileData?.document_urls?.[0]?.url ? (
                <iframe
                  src={fileData.document_urls[0].url}
                  title="Document Viewer"
                  className="w-full h-full rounded-lg shadow-md"
                  style={{ border: "none" }}
                />
              ) : (
                <p className="text-gray-500">
                  No document available for this file.
                </p>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 h-screen">
            {/* View Buttons */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => handleViewChange("image")}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeView === "image"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Image
              </button>
              <button
                onClick={() => handleViewChange("table")}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeView === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => handleViewChange("text")}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeView === "text"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Text
              </button>
            </div>

            {/* Display submitted data */}
            <div className="relative mb-4">
              {submittedData
                .filter((data) => data.TYPE === activeView)
                .map((data, index) => {
                  const isFileOpen = openFiles.has(index);
                  // {console.log("Hello data",data);
                  // }

                  return (
                    <div
                      key={`file-${index}`}
                      className="p-4 bg-gray-200 rounded-lg mb-2 relative"
                    >
                      <div className="flex items-center justify-between space-x-4 cursor-pointer rounded-lg">
                        {/* Folder Icon */}
                        <div
                          className="text-4xl focus:outline-none hover:bg-white p-2 rounded-lg"
                          onClick={() => {
                            handleAddClick();
                            toggleFile(index);
                            // setEditableIndex(index);
                          }}
                        >
                          {isFileOpen ? (
                            <IoIosArrowDown />
                          ) : (
                            <IoIosArrowForward />
                          )}
                        </div>

                        {/* Question ID */}
                        <div className="text-black font-bold text-lg rounded-lg px-4 py-2 select-none">
                          Question ID: {data.QUESTION_ID}
                          {/* {console.log("file id is : ",data)} */}
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            // console.log(formData)
                            // console.log(submittedData)
                            setSelectedID(data.QUESTION_ID);
                            setFormData({
                              documentName: data.DOCUMENT_NAME,
                              pageNumber: data.PAGE_NUMBER,
                              orderOfAppearance:
                                data.ORDER_OF_APPEARANCE_ON_PAGE,
                              title: data.TITLE,
                              question: data.QUESTION,
                              questionType: data.QUESTION_TYPE,
                              shortAnswer: data.SHORT_ANSWER,
                              longAnswer: data.LONG_ANSWER,
                              domain: data.DOMAIN,
                            });
                            setEditableIndex(true);
                            setIsFormActive(true); // Open the form
                          }}
                          className="text-3xl focus:outline-none hover:bg-white p-2 rounded-lg select-none"
                        >
                          <FiEdit2 />
                        </button>
                      </div>

                      {/* File Details */}
                      {isFileOpen && (
                        <div className="mt-6">
                          <p>
                            <strong>Domain Name:</strong> {data.DOMAIN}
                          </p>
                          <p>
                            <strong>Document Name:</strong> {data.DOCUMENT_NAME}
                          </p>
                          <p>
                            <strong>Edited By:</strong> {data.EMP_NAME}
                          </p>
                          <p>
                            <strong>Order on Page:</strong>{" "}
                            {data.ORDER_OF_APPEARANCE_ON_PAGE}
                          </p>
                          <p>
                            <strong>Page Number:</strong> {data.PAGE_NUMBER}
                          </p>
                          <p>
                            <strong>Question Type:</strong> {data.QUESTION_TYPE}
                          </p>
                          <p>
                            <strong>Question:</strong> {data.QUESTION}
                          </p>
                          <p>
                            <strong>Short Answer:</strong> {data.SHORT_ANSWER}
                          </p>
                          <p>
                            <strong>Long Answer:</strong> {data.LONG_ANSWER}
                          </p>
                          <p>
                            <strong>Title:</strong> {data.TITLE}
                          </p>
                          <p>
                            <strong>File ID:</strong> {data.FILE_ID}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Add button */}
            <button
              onClick={handleAddClick}
              className="px-4 py-2 mb-4 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              {isFormActive ? "Close Form" : "New Entry"}
            </button>

            {/* <button
              onClick={() => handleUpdate(index,data.QUESTION_ID)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Update
            </button>  */}

            {/* Enhanced Form */}
            {isFormActive && (
              <div data-aos="fade-down">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-3 bg-gray-100 rounded-lg mb-2">
                    <p>
                      <strong>Current View Type:</strong> {formData.activeView}
                    </p>
                  </div>

                  <label
                    htmlFor="documentName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Document Name
                  </label>
                  <input
                    id="documentName"
                    type="text"
                    name="documentName"
                    placeholder="Document Name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                  />

                  <label
                    htmlFor="pageNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Page Number
                  </label>
                  <input
                    id="pageNumber"
                    type="number"
                    name="pageNumber"
                    placeholder="Page Number"
                    value={formData.pageNumber}
                    onChange={handleInputChange}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                  />

                  <label
                    htmlFor="orderOfAppearance"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Order on Page
                  </label>
                  <input
                    id="orderOfAppearance"
                    type="number"
                    name="orderOfAppearance"
                    placeholder="Order on Page"
                    value={formData.orderOfAppearance}
                    onChange={handleInputChange}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                  />

                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                  />

                  <label
                    htmlFor="question"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Question *
                  </label>
                  <input
                    id="question"
                    type="text"
                    name="question"
                    placeholder="Question *"
                    value={formData.question}
                    onChange={handleInputChange}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                    required
                  />
                  {loading.question ? (
                    <div className="mt-2 text-sm text-gray-600">
                      Checking...
                    </div>
                  ) : (
                    aiDetection.question && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">
                          {aiDetection.question}
                        </div>
                        <ProgressBar percentage={percentages.question} />
                      </div>
                    )
                  )}
                  <button
                    onClick={handleAiDetection}
                    name="question"
                    className={`mt-2 px-4 py-2 text-white rounded ${
                      reviewStatus.question
                        ? "bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {reviewStatus.question ? "Reviewed ✓" : "Review "}
                  </button>
                  <label
                    htmlFor="questionType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Question Type
                  </label>
                  <input
                    id="questionType"
                    type="text"
                    name="questionType"
                    placeholder="Question Type"
                    value={formData.questionType}
                    onChange={handleInputChange}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                  />

                  <label
                    htmlFor="shortAnswer"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Short Answer
                  </label>
                  <input
                    id="shortAnswer"
                    type="text"
                    name="shortAnswer"
                    placeholder="Short Answer"
                    value={formData.shortAnswer}
                    onChange={handleInputChange}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                  />
                  {loading.shortAnswer ? (
                    <div className="mt-2 text-sm text-gray-600">
                      Checking...
                    </div>
                  ) : (
                    aiDetection.shortAnswer && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">
                          {aiDetection.shortAnswer}
                        </div>
                        <ProgressBar percentage={percentages.shortAnswer} />
                      </div>
                    )
                  )}
                  <button
                    onClick={handleAiDetection}
                    name="shortAnswer"
                    className={`mt-2 px-4 py-2 text-white rounded ${
                      reviewStatus.shortAnswer
                        ? "bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {reviewStatus.shortAnswer ? "Reviewed ✓" : "Review"}
                  </button>
                  <label
                    htmlFor="longAnswer"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Long Answer
                  </label>
                  <textarea
                    id="longAnswer"
                    name="longAnswer"
                    placeholder="Long Answer"
                    value={formData.longAnswer}
                    onChange={handleInputChange}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                    rows={4}
                  />
                  {loading.longAnswer ? (
                    <div className="mt-2 text-sm text-gray-600">
                      Checking...
                    </div>
                  ) : (
                    aiDetection.longAnswer && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">
                          Result: {aiDetection.longAnswer}
                        </div>
                        <ProgressBar percentage={percentages.longAnswer} />
                      </div>
                    )
                  )}
                  <button
                    onClick={handleAiDetection}
                    name="longAnswer"
                    className={`mt-2 px-4 py-2 text-white rounded ${
                      reviewStatus.longAnswer
                        ? "bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {reviewStatus.longAnswer ? "Reviewed ✓" : "Review "}
                  </button>
                  <label
                    htmlFor="domain"
                    className="block text-sm font-medium text-gray-700 mt-10"
                  >
                    Domain
                  </label>

                  <input
                    id="domain"
                    type="text"
                    name="domain"
                    placeholder="Domain"
                    value={domain}
                    onChange={handleInputChange}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                  />

                  <label
                    htmlFor="empName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    User Name
                  </label>
                  <input
                    id="empName"
                    type="text"
                    name="empName"
                    placeholder="User Name"
                    value={user.email}
                    onChange={handleInputChange}
                    disabled={!isFormActive}
                    className={`w-full p-3 border border-gray-300 rounded-lg ${
                      isFormActive ? "bg-white" : "bg-gray-200"
                    }`}
                  />
                  {/* <button
                    type="button"
                    onClick={handleValidation}
                    className="w-full px-4 py-2 text-lg font-semibold text-white rounded-lg bg-green-600 hover:bg-green-700"
                  >
                    Validate Form
                  </button> */}
                  {submitError && (
                    <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-lg font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700"
                  >
                    {editableIndex !== null ? "Update" : "Submit"}
                  </button>

                  {/* Verification Modal */}
                  <VerificationModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onProceed={handleProceed}
                    currentStep={currentStep}
                    message={messages[currentStep]}
                  />
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QaPage;
