import React from "react";
import { useProjectContext } from "../contextapi/allcontext";

const AssignTasks = () => {
  const {
    filteredUserData1,
    individualTaskAssignments,
    globalTaskAssignment,
    handleIndividualTaskAssignment,
    handleGlobalTaskAssignment,
    assignTasks,
    isLoadingForTask,
    setSearchQuery1,
    selectedLocation1,
    setSelectedLocation1,
    selectedLanguage1,
    setSelectedLanguage1,
    languageCounts,
    totalTasks,
    isReviewerModalOpen,
    handleSearchForAssignilist,
    ReviewerModal,
    selectedDevelopers,
    user,
  } = useProjectContext();
  try {
    return (
        <div className="flex flex-row items-start w-[84vw] mt-8">
          <table className="bg-white shadow-md rounded-lg mb-5">
            <thead
              className="sticky top-0 z-10 border-b border-stone-800 bg-blue-200 w-full"
              style={{ zIndex: isReviewerModalOpen ? 0 : 1 }}
            >
              <tr>
                <th className="text-left text-gray-600 pl-5">Emp ID</th>
                <th className="px-4 pr-0 text-left text-gray-600">Developer</th>

                <th className="py-3 px-4 border-b border-stone-800 text-left text-gray-600">
                  Task Quantity for Assignment
                </th>
                <th className="py-3 px-4 text-left text-gray-600">
                  <div className="flex">Language</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUserData1.map((d, index) => (
                <tr key={index} className="hover:bg-blue-50 bg-white">
                  {/* <td className="py-3 px-4 border-b border-stone-300">
                             {index + 1}
                           </td> */}

                  <td className="border-b border-stone-300 pl-5" id="UserID">
                    {d.USER_ID}
                  </td>
                  <td className="py-3 px-4 border-b border-stone-300">
                    {d.USER_EMAIL?.split("@")[0] || "Unknown"}
                  </td>

                  <td className="py-3 px-4 border-b border-stone-300">
                    <input
                      type="number"
                      min="0"
                      max="40"
                      className="pl-2 w-10/12 border border-gray-300 rounded-md transition-all duration-300 ease-in-out"
                      value={individualTaskAssignments[d.USER_ID] || 0}
                      onChange={(e) =>
                        handleIndividualTaskAssignment(
                          d.USER_ID,
                          e.target.value
                        )
                      }
                      name="assignTaskDeveloper"
                    />
                  </td>
                  {/* {languages body in table } */}
                  <td className="py-3 px-4 border-b border-stone-300">
                    <div className="pl-2 border border-gray-300 rounded-md transition-all duration-300 ease-in-out">
                      {d.SKILLSETS && Array.isArray(d.SKILLSETS)
                        ? d.SKILLSETS.join(", ")
                        : "-"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="items-end top-12 relative sticky ml-5 mt-4 max-w-[10vw]">
            <div className="mb-5">
              <input
                type="text"
                placeholder="🔍 Search by Email"
                className="border border-gray-300 rounded-md p-2 mt-2 w-full"
                onChange={handleSearchForAssignilist}
              />
              {/* <span className="font-semibold">{filteredUserData1.length}</span> */}
            </div>
            <hr />
            <br />
            <div className="mt-8 mb-1 ">
              <h1>Totol Developers:</h1>
              <span className="font-semibold">{filteredUserData1.length}</span>
            </div>
            <div className="mb-5">
              <label
                htmlFor="locationFilter"
                className="mr-2 font-bold"
                id="selectedValue"
              >
                Available Tasks: {totalTasks}
              </label>
            </div>
            <div className="mb-5">
              <label
                htmlFor="locationFilter"
                className="mr-2 font-bold"
                id="selectedValue"
              >
                Assign Tasks: {globalTaskAssignment}
              </label>
              <input
                name="assignTasks"
                type="number"
                min="0"
                max="40"
                className="w-full border border-gray-300 rounded-md p-2 mt-2"
                value={globalTaskAssignment}
                onChange={(e) => handleGlobalTaskAssignment(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="locationFilter" className="mr-2 font-bold">
                Filter by Location:
              </label>
              <br />
              <select
                id="locationFilter"
                className="border border-gray-300 rounded-md p-2 mt-2 w-full"
                value={selectedLocation1}
                onChange={(e) => setSelectedLocation1(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Himachal">Himachal</option>
                <option value="Pune">Pune</option>
                <option value="Mexico">Una</option>
                <option value="wfh_dy">Dy</option>
              </select>
            </div>
            <div className="mb-5">
              <label htmlFor="locationFilter" className="mr-2 font-bold">
                Filter by Language
              </label>
              <br />
              <select
                name="languageFilter"
                value={selectedLanguage1}
                onChange={(e) => setSelectedLanguage1(e.target.value)}
                className="border border-gray-300 rounded-md p-2 mt-2 w-full"
              >
                <option value="all">All</option>
                {languageCounts.map(({ language, count }, index) => (
                  <option key={index} value={language}>
                    {language} - {count}
                  </option>
                ))}
              </select>
            </div>
            {!isLoadingForTask ? (
              <button
                className="bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded mb-5 z-50 mt-2 w-full"
                onClick={() => assignTasks(project_id)}
              >
                Assign Tasks
              </button>
            ) : (
              <button className="bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded mb-5 z-50 mt-2 w-full">
                Assigning Tasks...
              </button>
            )}
            {/* <button
                className="bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 rounded mb-5 z-50 mt-2 w-full"
                onClick={makeReviewer}
              >
                Make Reviewer or Assign
              </button> */}

            <div
              style={{
                height: isReviewerModalOpen ? "300px" : "0",
                width: isReviewerModalOpen ? "400px" : "0",
                overflow: isReviewerModalOpen ? "hidden" : "none", // to prevent scrollbars when closed
                transition: "all 0.3s ease", // for smooth transition if needed
              }}
              className=""
            >
              {/* <ReviewerModal
                isOpen={isReviewerModalOpen}
                onClose={() => setIsReviewerModalOpen(false)}
                selectedDevelopers={selectedDevelopers}
                user={user}
              /> */}
            </div>
          </div>
        </div>
    );
  } catch (error) {
    console.error("Error in AssignTask:", error);
    return <div>Something went wrong.</div>;
  }
};

export default AssignTasks;