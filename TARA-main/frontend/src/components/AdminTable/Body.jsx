import { FaArrowUp, FaArrowDown } from "react-icons/fa";
const Body = ({
  filteredDevelopersByEmail,
  handleIndividualTaskAssignment,
  individualTaskAssignments,
}) => {
  return (
    <>
      <tbody className="divide-y">
        {filteredDevelopersByEmail.map((d, index) => (
          <tr key={index} className="hover:bg-blue-50 bg-blue-100">
            {/* <td className="py-3 px-4 border-b border-stone-300">
          {index + 1}
        </td> */}
            <td className="py-3 px-4 border-b border-stone-300" id="UserID">
              {d.USER_ID}
            </td>
            <td className="py-3 px-4 border-b border-stone-300">
              {d.USER_EMAIL}
            </td>
            <td className="py-3 px-4 border-b border-stone-300">
              <span>
                {d.PENDING !== 0 ? (
                  <span className="text-blue-600 font-semibold">
                    {d.PENDING || "-"}
                  </span>
                ) : (
                  0
                )}
              </span>
            </td>
            <td className="py-3 px-4 border-b border-stone-300">
              <span>
                {d.TOTAL !== 0 ? (
                  <span className="text-blue-600 font-semibold">
                    {d.TOTAL || "-"}
                  </span>
                ) : (
                  0
                )}
              </span>
            </td>
            <td className="py-3 px-4 border-b border-stone-300">
              <span>
                {d.REJECTED !== 0 ? (
                  <span className="text-blue-600 font-semibold">
                    {d.REJECTED || "-"}
                  </span>
                ) : (
                  0
                )}
              </span>
            </td>
            <td className="py-3 px-4 border-b border-stone-300">
              <span>
                {d.APPROVED !== 0 ? (
                  <span className="text-green-600 font-semibold">
                    {d.APPROVED || "-"} -{" "}
                    {((d.APPROVED / d.TOTAL) * 100).toFixed(2)}%
                  </span>
                ) : (
                  0
                )}
              </span>
            </td>
            <td className="py-3 px-4 border-b border-stone-300">
              <input
                type="number"
                className="pl-2 border border-gray-300 rounded-md transition-all duration-300 ease-in-out"
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
    </>
  );
};
export default Body;
