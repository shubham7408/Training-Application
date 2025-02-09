import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
// import data from "../../../dist/Argos data/datas.json";
import DocumentViewer from "../qa/DocumentViewer";
import { useNavigate } from "react-router-dom";

function QaDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tableId = queryParams.get("TID");

  // State to handle form inputs
  const [formData, setFormData] = useState({
    documentName: "",
    pageNum: "",
    orderOfAppearance: "",
    tableTitle: "",
    query: "",
    shortAnswer: "",
    longAnswer: "",
    domain: "",
    name: "",
    comment1: "",
    reviewer: "",
    comment2: "",
  });

  // Update form data on change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="flex ">
      <DocumentViewer />
      {/* Right side: MainBody with Form */}
      <div
        id="MainBody"
        className="w-4/5 p-4 bg-white flex flex-col items-start"
      >
        <b>Table ID is: {tableId}</b>

        {/* Form for uploading data */}
        <form onSubmit={handleSubmit} className="w-full mt-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold">Document Name</label>
            <input
              type="text"
              name="documentName"
              value={formData.documentName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Page Number</label>
            <input
              type="number"
              name="pageNum"
              value={formData.pageNum}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Order of Appearance
            </label>
            <input
              type="number"
              name="orderOfAppearance"
              value={formData.orderOfAppearance}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Table Title</label>
            <input
              type="text"
              name="tableTitle"
              value={formData.tableTitle}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Query</label>
            <textarea
              name="query"
              value={formData.query}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Short Answer</label>
            <input
              type="text"
              name="shortAnswer"
              value={formData.shortAnswer}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Long Answer
            </label>
            <textarea
              name="longAnswer"
              value={formData.longAnswer}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Domain</label>
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Comment 1</label>
            <textarea
              name="comment1"
              value={formData.comment1}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Reviewer</label>
            <input
              type="text"
              name="reviewer"
              value={formData.reviewer}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Comment 2</label>
            <textarea
              name="comment2"
              value={formData.comment2}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full p-2 mt-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default QaDashboard;
