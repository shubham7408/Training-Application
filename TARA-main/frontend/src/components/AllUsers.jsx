const AllUSERS = () => {
  return (
    <>
      <div className="w-full max-w-1xl max-h-[94vh] top-16 overflow-y-auto">
        <table className="bg-white shadow-md rounded-lg mb-5">
          <thead
            className="sticky top-0 z-10 border-b border-stone-800 bg-blue-200 w-full"
            style={{ zIndex: isReviewerModalOpen ? 0 : 1 }}
          >
            <tr>
              <th className="text-left text-gray-600">Emp ID</th>
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
            {filteredDevelopersByEmail.map((d, index) => (
              <tr key={index} className="hover:bg-blue-50 bg-white">
                {/* <td className="py-3 px-4 border-b border-stone-300">
                         {index + 1}
                       </td> */}

                <td className="border-b border-stone-300" id="UserID">
                  {d.USER_ID}
                </td>
                <td className="py-3 px-4 border-b border-stone-300">
                  {d.UPDATED_BY_MAIL?.split("@")[0] || "Unknown"}
                </td>

                <td className="py-3 px-4 border-b border-stone-300">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    className="pl-2 w-10/12 border border-gray-300 rounded-md transition-all duration-300 ease-in-out"
                    value={individualTaskAssignments[d.USER_ID] || 0}
                    onChange={(e) =>
                      handleIndividualTaskAssignment(d.USER_ID, e.target.value)
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
      </div>
    </>
  );
};
export default AllUSERS;
