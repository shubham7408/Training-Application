import { FaArrowUp, FaArrowDown } from "react-icons/fa";
const Head = ({sortOrder}) => {
    return(  <>
    {" "}
    <thead className="sticky top-0 z-10 border-b border-stone-800 bg-blue-200 w-full">
      <tr>
        <th className="py-3 px-4 text-left text-gray-600">Emp ID</th>
        <th className="py-3 px-4 text-left text-gray-600">Developer</th>

        <th className="py-3 px-4 text-left text-gray-600">
          <div className="font-semibold mb-0">{}</div>
          <div className="flex">
            Pending Tasks
            <button
              onClick={() => sortTable("asc", "pending")}
              className="ml-4"
            >
              <FaArrowUp
                style={{
                  color: sortOrder["pending"] === "asc" ? "blue" : "#00000030",
                }}
              />
            </button>
            <button
              onClick={() => sortTable("desc", "pending")}
              className="ml-4"
            >
              <FaArrowDown
                style={{
                  color: sortOrder["pending"] === "desc" ? "red" : "#00000030",
                }}
              />
            </button>
          </div>
        </th>

        <th className="py-3 px-4 border-b border-stone-800 text-left text-gray-600">
          <div className="font-semibold mb-0">{}</div>
          <div className="flex">
            Total Done
            <button onClick={() => sortTable("asc", "done")} className="ml-4">
              <FaArrowUp
                style={{
                  color: sortOrder["done"] === "asc" ? "blue" : "#00000030",
                }}
              />
            </button>
            <button onClick={() => sortTable("desc", "done")} className="ml-4">
              <FaArrowDown
                style={{
                  color: sortOrder["done"] === "desc" ? "red" : "#00000030",
                }}
              />
            </button>
          </div>
        </th>

        <th className="py-3 px-4 border-b border-stone-800 text-left text-gray-600">
          <div className="font-semibold mb-0">{}</div>
          <div className="flex">
            Rejected Tasks
            <button
              onClick={() => sortTable("asc", "rejected")}
              className="ml-4"
            >
              <FaArrowUp
                style={{
                  color: sortOrder["rejected"] === "asc" ? "blue" : "#00000030",
                }}
              />
            </button>
            <button
              onClick={() => sortTable("desc", "rejected")}
              className="ml-4"
            >
              <FaArrowDown
                style={{
                  color: sortOrder["rejected"] === "desc" ? "red" : "#00000030",
                }}
              />
            </button>
          </div>
        </th>

        <th className="py-3 px-4 border-b border-stone-800 text-left text-gray-600">
          <div className="flex">
            Approved Tasks
            <button
              onClick={() => sortTable("asc", "approved")}
              className="ml-4"
            >
              <FaArrowUp
                style={{
                  color: sortOrder["approved"] === "asc" ? "blue" : "#00000030",
                }}
              />
            </button>
            <button
              onClick={() => sortTable("desc", "approved")}
              className="ml-4"
            >
              <FaArrowDown
                style={{
                  color: sortOrder["approved"] === "desc" ? "red" : "#00000030",
                }}
              />
            </button>
          </div>
        </th>

        <th className="py-3 px-4 border-b border-stone-800 text-left text-gray-600">
          Task Quantity for Assignment
        </th>
        <th className="py-3 px-4 text-left text-gray-600">
          <div className="flex">
            Language
            <button
              onClick={() => sortTable("asc", "approved")}
              className="ml-4"
            >
              <FaArrowUp
                style={{
                  color: sortOrder["approved"] === "asc" ? "blue" : "#00000030",
                }}
              />
            </button>
            <button
              onClick={() => sortTable("desc", "approved")}
              className="ml-4"
            >
              <FaArrowDown
                style={{
                  color: sortOrder["approved"] === "desc" ? "red" : "#00000030",
                }}
              />
            </button>
          </div>
        </th>
      </tr>
    </thead>
  </>);
};
export default Head;
