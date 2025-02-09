const { response } = require("../app");

// Load environment variables
require("dotenv").config();

// Retrieve environment variables

const token = process.env.AUTH_TOKEN;

const dynamicURL = (view_id, project_id) => {
  return `https://notlabel-studio.toloka-test.ai/api/dm/views/${view_id}?interaction=filter&project=${project_id}`;
};

const headers = {
  accept: "*/*",
  "accept-language": "en-GB,en;q=0.5",
  "content-type": "application/json",
  priority: "u=1, i",
  "sec-ch-ua": '"Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Linux"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "same-origin",
  "sec-fetch-site": "same-origin",
  "sec-gpc": "1",
  "Referrer-Policy": "same-origin",
  Authorization: `Token ${token}`,
};

const getDynamicViewID = async (project_id) => {
  try {
    const response = await fetch(
      `https://notlabel-studio.toloka-test.ai/api/dm/views?project=${project_id}`,
      {
        headers: headers,
        body: null,
        method: "GET",
      }
    );

    const result = await response.json();

    return result[0].id;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const annotationZeroAssignEmpty = (view_id, project_id, language) => {
  return {
    id: `${view_id}`,
    data: {
      title: "Default",
      ordering: ["tasks:id"],
      type: "list",
      target: "tasks",
      filters: {
        conjunction: "and",
        items: [
          {
            filter: "filter:tasks:total_annotations",
            operator: "equal",
            value: 0,
            type: "Number",
          },
          {
            filter: "filter:tasks:assignees",
            operator: "empty",
            value: true,
            type: "List",
          },
          ...(language !== "all"
            ? [
                {
                  filter: "filter:tasks:data.language",
                  operator: "equal",
                  value: language,
                  type: "Unknown",
                },
              ]
            : []),
        ],
      },
      hiddenColumns: {
        explore: [
          "tasks:inner_id",
          "tasks:total_predictions",
          "tasks:annotations_results",
          "tasks:annotations_ids",
          "tasks:file_upload",
          "tasks:storage_filename",
          "tasks:updated_by",
          "tasks:avg_lead_time",
          "tasks:draft_exists",
        ],
        labeling: [
          "tasks:data.diff",
          "tasks:data.plan",
          "tasks:data.task",
          "tasks:data.uuid",
          "tasks:data.input",
          "tasks:data.modify",
          "tasks:data.output",
          "tasks:data.sample",
          "tasks:data.context",
          "tasks:data.language",
          "tasks:data.input_files",
          "tasks:data.language_md",
          "tasks:data.output_files",
          "tasks:data.llm_complexity",
          "tasks:id",
          "tasks:inner_id",
          "tasks:completed_at",
          "tasks:cancelled_annotations",
          "tasks:total_predictions",
          "tasks:assignees",
          "tasks:annotators",
          "tasks:annotations_results",
          "tasks:annotations_ids",
          "tasks:file_upload",
          "tasks:storage_filename",
          "tasks:created_at",
          "tasks:updated_at",
          "tasks:updated_by",
          "tasks:avg_lead_time",
          "tasks:draft_exists",
        ],
      },
      columnsWidth: {},
      columnsDisplayType: {},
      gridWidth: 4,
      semantic_search: [],
      threshold: {
        min: 0,
        max: 1,
      },
    },
    project: `${project_id}`,
  };
};

const putFilterAnnotationZeroAssignEmpty = async (
  view_id,
  project_id,
  language
) => {
  try {
    const response = await fetch(dynamicURL(view_id, project_id), {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(
        annotationZeroAssignEmpty(view_id, project_id, language)
      ),
      timeout: 10000,
    });
    return response.status;
  } catch (error) {
    console.error(error);
    return 500;
  }
};

const fetchFilterAnnotationZeroAssignEmpty = async (language, project_id) => {
  try {
    let result = null;

    const view_id = await getDynamicViewID(project_id);

    for (let i = 0; i < 20; i++) {
      result = await putFilterAnnotationZeroAssignEmpty(
        view_id,
        project_id,
        language
      );

      if (result === 200) {
        break;
      } else if (result === 500 && i === 19) {
        return null;
      }

      if (result === 200) {
        break;
      } else if (result === 500 && i === 4) {
        return null;
      }
    }

    const response = await fetch(
      `https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=100000&view=${view_id}&project=${project_id}&include=id`,
      {
        method: "Get",
        headers: headers,
      }
    );
    return await response.json();
  } catch (error) {
    console.error(error);
    return 500;
  }
};

const fetchFilterAnnotationZeroAssignEmptyLanguages = async (project_id) => {
  try {
    let result = null;

    const view_id = await getDynamicViewID(project_id);

    for (let i = 0; i < 20; i++) {
      result = await putFilterAnnotationZeroAssignEmpty(
        view_id,
        project_id,
        "all"
      );

      if (result === 200) {
        break;
      } else if (result === 500 && i === 19) {
        return null;
      }

      if (result === 200) {
        break;
      } else if (result === 500 && i === 4) {
        return null;
      }
    }

    const response = await fetch(
      `https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=100000&view=${view_id}&project=${project_id}`,
      {
        method: "Get",
        headers: headers,
      }
    );
    return await response.json();
  } catch (error) {
    console.error(error);
    return 500;
  }
};

const assignTasksToDeveloper = async (user_id, tasks, language, project_id) => {
  try {
    const response = await fetch(
      `https://notlabel-studio.toloka-test.ai/api/projects/${project_id}/tasks/assignees`,
      {
        method: "POST",
        headers: headers,
        body:
          language === "all"
            ? `{"type":"annotator","selectedItems":{"all":false,"included":${tasks}},"users":[${user_id}],"filters":{"conjunction":"and","items":[{"filter":"filter:tasks:total_annotations","operator":"equal","value":0,"type":"Number"},{"filter":"filter:tasks:assignees","operator":"empty","value":true,"type":"List"}]}}`
            : `{"type":"annotator","selectedItems":{"all":false,"included":${tasks}},"users":[${user_id}],"filters":{"conjunction":"and","items":[{"filter":"filter:tasks:total_annotations","operator":"equal","value":0,"type":"Number"},{"filter":"filter:tasks:assignees","operator":"empty","value":true,"type":"List"},{"filter":"filter:tasks:data.language","operator":"equal","value":"${language}","type":"Unknown"}]}}`,
        timeout: 10000,
      }
    );
    return response.status;
  } catch (error) {
    console.error(error);
    return 500;
  }
};

const getUserTaskStatistics = async (userId, project_id) => {
  try {
    const response = await fetch(
      `https://notlabel-studio.toloka-test.ai/api/tasks?assignee=${userId}&project=1033&include=id`,
      {
        method: "GET",
        headers: headers,
      }
    );

    const tasks = await response.json();
    console.log("task", tasks);
    let assignedCount = tasks.length;
    let completedCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;
    let rewriteCount = 0;
    tasks.forEach((task) => {
      if (task.status === "completed") completedCount++;
      if (task.status === "accepted") acceptedCount++;
      if (task.status === "rejected") rejectedCount++;
      if (task.status === "for_rewrite") rewriteCount++;
    });
    return {
      assigned: assignedCount,
      completed: completedCount,
      accepted: acceptedCount,
      rejected: rejectedCount,
      forRewrite: rewriteCount,
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch task statistics" };
  }
};

module.exports = {
  putFilterAnnotationZeroAssignEmpty,
  fetchFilterAnnotationZeroAssignEmpty,
  assignTasksToDeveloper,
  getUserTaskStatistics,
  fetchFilterAnnotationZeroAssignEmptyLanguages,
};
