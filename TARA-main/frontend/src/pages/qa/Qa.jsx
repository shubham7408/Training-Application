import React from "react";
import { Link } from "react-router-dom";
// import data from "../../../dist/Argos\ data/datas.json";

import { useNavigate } from "react-router-dom";

function Qa() {
  const navigate = useNavigate();

  return (
    <>
      {/* <button
        type="button"
        className="absolute top-20 left-16 p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
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
        Back
      </button>

      <div
        id="mainBody"
        className="mx-auto mt-8 p-4 bg-white"
        style={{
          maxWidth: "80%",
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
        }}
      >
        <h1 className="text-xl font-semibold mb-4">Table UID List</h1>
        <div className="mt-8">
          <table className="w-full bg-blue-50 border border-blue-100">
            <thead>
              <tr className="bg-blue-100">
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Table UID
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Name of Doc
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Total Pages
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Total Docs
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Total Images
                </th>
                <th className="py-2 px-4 border-b border-blue-200 text-left">
                  Text
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b border-blue-200">
                    <Link
                      to={`/projects/DomainManagement/qa/${item["Table UID"]}`}
                      className="text-blue-500 hover:underline"
                    >
                      {item["Table UID"]}
                    </Link>
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {item["Name of Doc"]}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {item["Total Pages"]}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {item["Total Docs"]}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {item["Total Images"]}
                  </td>
                  <td className="py-2 px-4 border-b border-blue-200">
                    {item["Text"]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </>
  );
}

export default Qa;
