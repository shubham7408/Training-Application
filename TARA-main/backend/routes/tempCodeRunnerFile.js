https://notlabel-studio.toloka-test.ai/api/dm/views/${view_id}?interaction=filter&project=${project_id}

https://notlabel-studio.toloka-test.ai/api/dm/views?project=${project_id}`,

https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=100000&view=${view_id}&project=${project_id}&include=id

https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=100000&view=${view_id}&project=${project_id}

https://notlabel-studio.toloka-test.ai/api/projects/${project_id}/tasks/assignees


https://notlabel-studio.toloka-test.ai/api/tasks?assignee=${userId}&project=${project_id}

https://notlabel-studio.toloka-test.ai/projects/${task.PROJECT}/data?tab=13807&page=1&task=${task.TASK_ID}

https://notlabel-studio.toloka-test.ai/projects/{project_id}

https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=10000000&view=12654&project=1033

https://notlabel-studio.toloka-test.ai/api/tasks















// 1. Get filtered views for a specific project
https://notlabel-studio.toloka-test.ai/api/dm/views/${view_id}?interaction=filter&project=${project_id}
// Purpose: Retrieve filtered views for a specific project based on the view ID and project ID.

// 2. Get  view for a specific project
https://notlabel-studio.toloka-test.ai/api/dm/views?project=${project_id}
// Purpose: Retrieve views associated with a specific project ID.

// 3. Get tasks with specific view and project, including task IDs
https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=100000&view=${view_id}&project=${project_id}&include=id
// Purpose: Retrieve tasks for a specific view and project, including task IDs, with pagination.

// 4. Get tasks with specific view and project
https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=100000&view=${view_id}&project=${project_id}
// Purpose: Retrieve tasks for a specific view and project, with pagination.

// 5. POST, Tasks assigned to a specific user in a project
https://notlabel-studio.toloka-test.ai/api/tasks?assignee=${userId}&project=${project_id}
// Purpose: Tasks assigned to a specific user within a specific project.

// 6. Get project data for a specific task
https://notlabel-studio.toloka-test.ai/projects/${task.PROJECT}/data?tab=13807&page=1&task=${task.TASK_ID}
// Purpose: Retrieve project data for a specific task, including pagination and tab information.

// 7. Get project details
https://notlabel-studio.toloka-test.ai/projects/{project_id}
// Purpose: Retrieve details of a specific project by its ID.

// 8. Get tasks with specific view and project with large page size
https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=10000000&view=12654&project=1033
// Purpose: Retrieve tasks for a specific view and project with a large page size, useful for bulk data retrieval.

// 9. Get all tasks
https://notlabel-studio.toloka-test.ai/api/tasks
// Purpose: This base URL is used to interact with tasks in various ways, depending on the HTTP method and query parameters used.
