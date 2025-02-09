import React, { useState, useEffect, useRef } from "react";
import { Formik, Field, Form } from "formik";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import VerificationModal from "./DocumentVerification";
import { Notification } from "./Notification";

import * as pdfjsLib from "pdfjs-dist/webpack";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;


const DocumentCollector = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({
    message: "",
    isError: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const formikRef = useRef(null);
  const [documentPreviews, setDocumentPreviews] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [duplicateError, setDuplicateError] = useState(false);

  //console.log("documentPreviews", documentPreviews);

  const [fileText, setFileText] = useState(null)
  const [fileStatus, setFileStatus] = useState(null);



  const readTextFromPdf = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      if (file.type === "application/pdf") {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
          try {
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item) => item.str).join(" ");
              fullText += pageText + "\n";
            }

            setFileText(fullText); // Set the state here
          } catch (error) {
            console.error("Error reading PDF file:", error);
          }
        };

        reader.readAsArrayBuffer(file);
      } else {
        console.warn(`${file.name} is not a PDF file.`);
      }
    });

    if (formikRef.current) {
      formikRef.current.setFieldValue("documentUpload", files);
    }
  };

  useEffect(() => {
    if (fileText) {
      const isResearchPaper = /abstract|introduction|references|conclusion/i.test(fileText);

      setFileStatus((prevStatus) => ({
        ...prevStatus,
        "Uploaded Document": isResearchPaper ? "Research Paper" : "Not a Research Paper",
      }));

    }
  }, [fileText]);


  const getVerificationMessage = (step) => {
    const fileName = documentPreviews[0]?.name || "NA";
    const messages = {
      1: `The entry "${fileName}" appears to be similar to "PlanDetails.pdf"; it seems like a duplicate item. Please verify.`,
      // 2: `"${fileName}" seems like a research paper. Please verify before proceeding.`,
    };
    return messages[step] || "";
  };

  // Fetch existing documents on page load
  useEffect(() => {
    const fetchExistingDocuments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}/api/allfile`
        );
        setExistingDocuments(response.data); // Store existing files in state
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchExistingDocuments();
  }, []);

  // Check if the uploaded document is a duplicate
  const checkForDuplicate = (fileName) => {
    return existingDocuments.some((doc) => doc.FILE_NAME === fileName);
  };

  // const handleValidateClick = () => {
  //   setCurrentStep(1);
  //   setIsModalOpen(true);
  // };

  // const handleModalClose = () => {
  //   setIsModalOpen(false);
  //   setCurrentStep(1);
  // };

  // const handleModalProceed = () => {
  //   if (currentStep === 1) {
  //     setCurrentStep(2);
  //   } else {
  //     setIsModalOpen(false);
  //     setCurrentStep(1);
  //     // Submit form after verification is complete
  //     if (formikRef.current) {
  //       formikRef.current.submitForm();
  //     }
  //   }
  // };

  //Without model submit

  const handleValidateClick = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
    }
  };



  const handleFilePreview = (files) => {


    const previews = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    // Check for duplicates
    const isDuplicate = checkForDuplicate(previews[0].name);
    if (isDuplicate) {
      setShowMessage(true);
      setDuplicateError(true); // Set error state if duplicate is found
    } else {
      setDuplicateError(false); // Clear error if no duplicate
    }

    setDocumentPreviews(previews);
  };

  const handleSubmit = async (values, { resetForm }) => {
    // if (duplicateError) {
    //   return; // Prevent submission if there is a duplicate
    // }

    try {
      setIsSubmitting(true);
      setSubmitStatus({ message: "", isError: false });
      setShowMessage(true);

      const formData = new FormData();

      formData.append("domainName", documentPreviews[0].name);
      formData.append("projectName", values.projectName);
      formData.append("url", values.url);
      formData.append("domain", values.domain);
      formData.append("numImages", values.numImages);
      formData.append("numResults", values.numResults);
      formData.append("licenseUrl", values.licenseUrl);
      formData.append("licenseName", values.licenseName);
      formData.append("Notes", values.notes);

      if (values.documentUpload && values.documentUpload.length > 0) {
        values.documentUpload.forEach((file) => {
          formData.append("documentUpload", file);
        });
      }

      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/documentcollections`,
        formData
      );

      setSubmitStatus({
        message: "Document uploaded successfully!",
        isError: false,
      });

      resetForm();
      setDocumentPreviews([]);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({
        message:
          error.response?.data?.error ||
          "Error uploading document. Please try again.",
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 15000);

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [showMessage]);


  return (
    <div className="container mx-auto px-4 sm:px-8 flex" data-aos="fade-right">
      <div className="mb-6">
        <button
          type="button"
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
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
        <NavLink
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800"
          to="/projects/DomainManagement/doc/domains"
        >
          View Domain-wise Documents →
        </NavLink>

        <center>
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 mt-4">
            Document Collector
          </h2>
        </center>

        {/* <div>
          {submitStatus.message && (
            <div
              className={`mb-4 p-4 rounded ${submitStatus.isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
                }`}
            >
              {submitStatus.message}
              {showMessage}
            </div>
          )}

          {duplicateError && showMessage && (
            <div className="mb-4 p-4 rounded bg-blue-100 text-blue-700">
              A file with the same name already exists. Please verify it before uploading.
            </div>
          )}

        </div> */}

        {(submitStatus.message || (duplicateError && showMessage)) && (
          <Notification
            type={
              duplicateError
                ? 'error'
                : submitStatus.isError
                  ? 'error'
                  : 'success'
            }
            message={
              duplicateError
                ? "A file with the same name already exists. Please verify it before uploading."
                : submitStatus.message
            }
            onClose={() => {
              // Reset your error/message states here
              setSubmitStatus({ message: '', isError: false });
              setDuplicateError(false);
            }}
          />
        )}

        <div className="flex justify-center w-full">




          <div className="w-[60vw] h-auto mt-2 bg-white">
            {documentPreviews.length > 0 && (
              <div className="relative w-full h-full">
                {/* Image Preview */}
                {documentPreviews[0].name.endsWith(".jpg") ||
                  documentPreviews[0].name.endsWith(".jpeg") ||
                  documentPreviews[0].name.endsWith(".png") ? (
                  <img
                    src={documentPreviews[0].url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : documentPreviews[0].name.endsWith(".pdf") ? (
                  <iframe
                    src={documentPreviews[0].url}
                    width="100%"
                    height="100%"
                    className="border-none"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="text-white text-center">
                    Preview not available for this file type.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="sticky fixed top-0 max-w-lg mr-[-5vw] ml-10 mt-2 bg-white shadow-lg rounded-lg p-8">
            <Formik
              initialValues={{
                domainName: "",
                projectName: "",
                url: "",
                domain: "",
                numImages: "",
                numResults: "",
                documentUpload: null,
                licenseUrl: "",
                licenseName: "",
                notes: "",
              }}
              onSubmit={handleSubmit}
              innerRef={formikRef}
              onChange={readTextFromPdf}
            >
              {({ setFieldValue }) => (
                <Form className="space-y-6">
                  <div>
                    <label
                      htmlFor="documentUpload"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Upload Document:
                    </label>
                    <input
                      type="file"
                      name="documentUpload"
                      id="documentUpload"
                      multiple
                      onChange={(event) => {
                        const files = Array.from(event.currentTarget.files);
                        setFieldValue("documentUpload", files);
                        handleFilePreview(files);
                        readTextFromPdf(event);
                        //handleCheckForResearchPaper();
                      }}

                      className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100 cursor-pointer"
                      required
                    />{fileStatus && (
                      <div className="mt-4">

                        <ul>
                          {Object.entries(fileStatus).map(([fileName, status]) => (
                            status === "Research Paper" && (

                              <li key={fileName}>
                                <h3 className="text-md font-semibold">File Status:</h3>
                                {fileName} is <span className="text-red-600">{status}</span>
                              </li>
                            )
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {/* File Name Display */}
                  {documentPreviews.length === 0 ? (
                    <div className="text-center text-red text-xl">
                      Select a document to view...
                    </div>
                  ) : (
                    <div className="mt-2 text-md text-gray-700">
                      <span className="text-md font-semibold text-gray-700">
                        File Name:&nbsp;
                      </span>
                      <a
                        href={documentPreviews[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      // onClick={(e) => e.preventDefault()} // Prevent default to allow manual preview toggle
                      >
                        {documentPreviews[0].name}
                      </a>
                    </div>
                  )}



                  <div>
                    <label
                      htmlFor="projectName"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Project Name:
                    </label>
                    <Field
                      as="select"
                      name="projectName"
                      id="projectName"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                      required
                    >
                      <option value="">Select a project</option>
                      <option value="Domain Management">Domain Management</option>
                      <option value="Claude AI">STEM Data Plan</option>
                      <option value="Project P">Project P</option>

                    </Field>
                  </div>

                  <div>
                    <label
                      htmlFor="url"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Site URL:
                    </label>
                    <Field
                      type="text"
                      name="url"
                      id="url"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                      placeholder="Enter URL"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-md font-semibold text-gray-700">
                      Domain:
                    </label>
                    <div className="mt-1 space-y-2">
                      <label className="inline-flex items-center">
                        <Field
                          type="radio"
                          name="domain"
                          value="Healthcare"
                          className="form-radio text-blue-500"
                          required
                        />
                        <span className="ml-2">Healthcare</span>
                      </label>
                      <label className="inline-flex items-center ml-6">
                        <Field
                          type="radio"
                          name="domain"
                          value="Technology"
                          className="form-radio text-blue-500"
                          required
                        />
                        <span className="ml-2">Technology</span>
                      </label>
                      <label className="inline-flex items-center ml-6">
                        <Field
                          type="radio"
                          name="domain"
                          value="Finance"
                          className="form-radio text-blue-500"
                          required
                        />
                        <span className="ml-2">Finance</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex">
                    <div>
                      <label
                        htmlFor="numImages"
                        className="block text-md font-semibold text-gray-700"
                      >
                        Number of Images:
                      </label>
                      <Field
                        type="number"
                        name="numImages"
                        id="numImages"
                        className="mt-1 block w-40 p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                        placeholder="1"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="numResults"
                        className="block ml-4 text-md font-semibold text-gray-700"
                      >
                        Number of Tables:
                      </label>
                      <Field
                        type="number"
                        name="numResults"
                        id="numResults"
                        className="mt-1 block ml-4 w-40 p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                        placeholder="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="licenseName"
                      className="block text-md font-semibold text-gray-700"
                    >
                      License Name:
                    </label>
                    <Field
                      type="text"
                      name="licenseName"
                      id="licenseName"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                      placeholder="Enter license name"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="licenseUrl"
                      className="block text-md font-semibold text-gray-700"
                    >
                      License URL:
                    </label>
                    <Field
                      type="url"
                      name="licenseUrl"
                      id="licenseUrl"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                      placeholder="Enter license URL"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Notes:
                    </label>
                    <Field
                      as="textarea"
                      name="notes"
                      id="notes"
                      rows="2"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                      placeholder="Enter any additional notes"
                    />
                  </div>


                  <button
                    type="button"
                    onClick={handleValidateClick}
                    disabled={isSubmitting}
                    className={`w-full py-3 ${isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                      } text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    {isSubmitting ? "Uploading document..." : "Upload Document"}
                  </button>

                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      {/* <VerificationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onProceed={handleModalProceed}
        currentStep={currentStep}
        message={getVerificationMessage(currentStep)}
      /> */}
    </div>
  );
};

export default DocumentCollector;