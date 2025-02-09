import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import axios from "axios";
import { FaRegFile } from "react-icons/fa";
import { GrClose } from "react-icons/gr";
import { MdOutlineFileDownload } from "react-icons/md";

const dummyDocuments = [
  {
    filename: "example_image1.jpg",
    url: "D:\toloka\frontenddist\favicon.png",
    size: "1.2 MB",
  },
  {
    filename: "example_document1.pdf",
    url: "https://nisootech.vercel.app/resume.pdf",
    size: "1.5 MB",
  },
  {
    filename: "example_presentation1.pptx",
    url: "https://your-s3-bucket-url/example_presentation1.pptx",
    size: "2.1 MB",
  },
  {
    filename: "example_image2.png",
    url: "https://your-s3-bucket-url/example_image2.png",
    size: "800 KB",
  },
  {
    filename: "example_document2.docx",
    url: "https://your-s3-bucket-url/example_document2.docx",
    size: "2.3 MB",
  },
  {
    filename: "example_text.txt",
    url: "https://your-s3-bucket-url/example_text.txt",
    size: "150 KB",
  },
];

const DocumentViewer = ({ s3BucketUrl, className }) => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState(dummyDocuments);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // Fetch documents from S3 bucket
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`${s3BucketUrl}/documents-list.json`);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [s3BucketUrl]);

  const getFileType = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    const imageTypes = ["jpg", "jpeg", "png", "gif"];
    const docTypes = ["doc", "docx", "pdf", "txt"];
    const presentationTypes = ["ppt", "pptx"];

    if (imageTypes.includes(ext)) return "image";
    if (docTypes.includes(ext)) return "document";
    if (presentationTypes.includes(ext)) return "presentation";
    return "other";
  };

  const renderDocumentPreview = (doc) => {
    const fileType = getFileType(doc.filename);

    // Display document using DocViewer for documents and presentations
    if (fileType === "document" || fileType === "presentation") {
      return (
        <DocViewer
          documents={[{ uri: doc.url }]}
          pluginRenderers={DocViewerRenderers}
        />
      );
    }

    // Handle image files differently
    if (fileType === "image") {
      return (
        <img
          src={doc.url}
          alt={doc.filename}
          className="w-full h-full object-contain"
        />
      );
    }

    // Fallback for unsupported file types
    return (
      <div
        className="flex flex-col items-center justify-center h-full"
        data-aos="fade-right"
      >
        <FaRegFile className="w-24 h-24 text-gray-400 mb-4" />
        <p className="text-lg text-gray-600 mt-4 mb-4">Preview not available</p>
        <a
          href={doc.url}
          download
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <MdOutlineFileDownload className="w-4 h-4" />
          <span>Download</span>
        </a>
      </div>
    );
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <button
        type="button"
        className="absolute top-28 left-4 p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        onClick={() => navigate(-1)} // Go back to the previous page
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
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
        Documents
      </h2>
      <div
        className={`grid ${
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }`}
      >
        {documents.map((doc, index) => (
          <div
            key={index}
            onClick={() => setSelectedDoc(doc)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {doc.filename}
              </h3>
              <p className="text-sm text-gray-500">{doc.size}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-6xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedDoc.filename}
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <GrClose className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {renderDocumentPreview(selectedDoc)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
