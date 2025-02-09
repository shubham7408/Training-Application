const express = require("express");
const router = express.Router();
const axios = require("axios");
const AUTH_TOKEN = "33bc245fd0af2cd9c678b0e273a089b142a3f7d4";
const BASE_URL = "https://notlabel-studio.toloka-test.ai/api/tasks";

const { getUserStatistics, getStatisticsCount } = require("../services/server");

const fetchTasks = async (url, params) => {
  console.log("fetchTasks", url, params);
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${AUTH_TOKEN}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(
        "Resource not found (404). Please check the view parameter and other query parameters."
      );
    }
    throw new Error(
      error.response ? error.response.data.detail : error.message
    );
  }
};

const getZeroAnnotation = async (req, res) => {
  try {
    const { page = 1, page_size = 10000, view, project, include } = req.query;
    const data = await fetchTasks(BASE_URL, {
      page,
      page_size,
      view: view || 16543,
      project,
      include,
      status: "",
    });
    res.json(data);
  } catch (error) {
    console.error("Error fetching zero annotations:", error.message);
    res.status(500).json({ error: error.message });
  }
};

router.get("/zero-annotation", getZeroAnnotation);
router.get("/all-user-stats", getUserStatistics);
router.get("/all-stats-count", getStatisticsCount);

module.exports = router;

// const getTotalAnnotations = async (req, res) => {
//   try {
//     const { page = 1, page_size = 10, view, project, include } = req.query;
//     const data = await fetchTasks(BASE_URL, {
//       page,
//       page_size,
//       view: view || 16375,
//       project,
//       include,
//     });
//     res.json(data.total);
//   } catch (error) {
//     console.error("Error fetching total annotations:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// const getAllTotalAnnotations = async (req, res) => {
//   try {
//     const { page = 2, page_size = 1000, view, project, include } = req.query;
//     const data = await fetchTasks(BASE_URL, {
//       page,
//       page_size,
//       view: view || 16375,
//       project,
//       include,
//     });
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching total annotations:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// const getOneAnnotations = async (req, res) => {
//   try {
//     const { page = 1, page_size = 10, view, project, include } = req.query;
//     const data = await fetchTasks(BASE_URL, {
//       page,
//       page_size,
//       view: view || 16393,
//       project,
//       include,
//       status: "",
//     });
//     res.json(data.total);
//   } catch (error) {
//     console.error("Error fetching one annotations:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// const getZeroAnnotations = async (req, res) => {
//   try {
//     const { page = 1, page_size = 10, view, project, include } = req.query;
//     const data = await fetchTasks(BASE_URL, {
//       page,
//       page_size,
//       view: view || 16372,
//       project,
//       include,
//       status: "",
//     });
//     res.json(data.total);
//   } catch (error) {
//     console.error("Error fetching zero annotations:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// const getRejected = async (req, res) => {
//   try {
//     const { page = 1, page_size = 10, view, project, include } = req.query;
//     const data = await fetchTasks(BASE_URL, {
//       page,
//       page_size,
//       view: view || 16335,
//       project,
//       include,
//       status: "rejected",
//     });
//     res.json(data.total);
//   } catch (error) {
//     console.error("Error fetching rejected tasks:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// const getAllRejected = async (req, res) => {
//   try {
//     const { page = 1, page_size = 3000, view, project, include } = req.query;
//     const data = await fetchTasks(BASE_URL, {
//       page,
//       page_size,
//       view: view || 16335,
//       project,
//       include,
//       status: "rejected",
//     });
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching rejected tasks:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// const getAllApproved = async (req, res) => {
//   try {
//     const { page = 1, page_size = 1000, view, project, include } = req.query;
//     const data = await fetchTasks(BASE_URL, {
//       page,
//       page_size,
//       view: view || 16336,
//       project,
//       include,
//       status: "rejected",
//     });
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching all approved tasks:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// const getTotalApproved = async (req, res) => {
//   try {
//     const { page = 1, page_size = 10, view, project, include } = req.query;
//     const data = await fetchTasks(BASE_URL, {
//       page,
//       page_size,
//       view: view || 16336,
//       project,
//       include,
//       status: "approved",
//       fields: "total",
//     });
//     res.json(data.total);
//   } catch (error) {
//     console.error("Error fetching approved tasks:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// const getRewrites = async (req, res) => {
//   try {
//     const { page = 1, page_size = 10, view, project, include } = req.query;
//     const data = await fetchTasks(BASE_URL, {
//       page,
//       page_size,
//       view: view || 16337,
//       project,
//       include,
//       status: "rewrite",
//     });
//     res.json(data.total);
//   } catch (error) {
//     console.error("Error fetching approved tasks:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// const getPending = async (req, res) => {
//   try {
//     const requestBody = {
//       id: 16559,
//       data: {
//         title: "New Tab 11",
//         ordering: [],
//         type: "list",
//         target: "tasks",
//         filters: {
//           conjunction: "and",
//           items: [
//             {
//               filter: "filter:tasks:updated_at",
//               operator: "greater",
//               value: "2024-08-20T18:30:00.000Z",
//               type: "Datetime",
//             },
//             {
//               filter: "filter:tasks:updated_at",
//               operator: "less",
//               value: "2024-08-21T18:30:00.000Z",
//               type: "Datetime",
//             },
//           ],
//         },
//         hiddenColumns: {
//           explore: [
//             "tasks:inner_id",
//             "tasks:total_predictions",
//             "tasks:annotations_results",
//             "tasks:annotations_ids",
//             "tasks:file_upload",
//             "tasks:storage_filename",
//             "tasks:created_at",
//             "tasks:updated_at",
//             "tasks:updated_by",
//             "tasks:avg_lead_time",
//             "tasks:draft_exists",
//           ],
//           labeling: [
//             "tasks:data.diff",
//             "tasks:data.plan",
//             "tasks:data.task",
//             "tasks:data.uuid",
//             "tasks:data.input",
//             "tasks:data.modify",
//             "tasks:data.output",
//             "tasks:data.sample",
//             "tasks:data.context",
//             "tasks:data.verdict",
//             "tasks:data.batch_id",
//             "tasks:data.language",
//             "tasks:data.iteration",
//             "tasks:data.qa_result",
//             "tasks:data.input_files",
//             "tasks:data.language_md",
//             "tasks:data.output_files",
//             "tasks:data.llm_complexity",
//             "tasks:id",
//             "tasks:inner_id",
//             "tasks:completed_at",
//             "tasks:cancelled_annotations",
//             "tasks:total_predictions",
//             "tasks:assignees",
//             "tasks:annotators",
//             "tasks:annotations_results",
//             "tasks:annotations_ids",
//             "tasks:file_upload",
//             "tasks:storage_filename",
//             "tasks:created_at",
//             "tasks:updated_at",
//             "tasks:updated_by",
//             "tasks:avg_lead_time",
//             "tasks:draft_exists",
//           ],
//         },
//         columnsWidth: {},
//         columnsDisplayType: {},
//         gridWidth: 4,
//         semantic_search: [],
//         threshold: {
//           min: 0,
//           max: 1,
//         },
//       },
//       project: "1033",
//     };

//     const response = await fetch(
//       "https://notlabel-studio.toloka-test.ai/projects/1033/data?tab=16559?interaction=filter&project=1033",
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Token ${AUTH_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//         body: requestBody,
//       }
//     );

//     const responseData = await response.json();
//     res.json(responseData);
//   } catch (error) {
//     console.error("Error sending PATCH request:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };
// async function checkPending() {
//   let result = null;
//   for (let i = 0; i < 10; i++) {
//     result = await getPending();

//     if (result === 200) {
//       return;
//     } else if (result === 500 && i === 4) {
//       return null;
//     }
//   }
// }
// checkPending();

// router.get("/total-annotations", getTotalAnnotations);
// router.get("/all-total-annotations", getAllTotalAnnotations);
// router.get("/zero-annotations", getZeroAnnotations);
// router.get("/one-annotations", getOneAnnotations);
// router.get("/rejected", getRejected);
// router.get("/all-rejected", getAllRejected);
// router.get("/all-approved", getAllApproved);
// router.get("/approved", getTotalApproved);
// router.get("/rewrites", getRewrites);
// router.get("/pending", getPending);
