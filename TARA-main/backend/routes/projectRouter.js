const express = require("express");
const router = express.Router();
const {
  fetchProjectById,
  fetchLanguage,
  fetchProjectData,
  Addproject,
  addprojects,
} = require("../services/common_function");
const redisClient = require("../redis/redisClient");

// Middleware to cache data
const cacheResponse = (key, data, duration = 21600) => {
  redisClient.setEx(key, duration, JSON.stringify(data));
};

// Route to get all project details
router.get("/projects", async (req, res, next) => {
  try {
    const data = await fetchProjectData();
    cacheResponse("projects", data); // Cache the response
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch project details" });
  }
});

// Route to add project details
router.get("/addprojects", async (req, res, next) => {
  try {
    const payload = req.body;

    const data = await fetchProjectData(payload);
    cacheResponse("projects", data); // Cache the response
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch project details" });
  }
});

// Route to get project details by ID
router.get("/projects/:id", async (req, res, next) => {
  project_id = req.params.id;
  userEmail = req.query.email;
  let cacheKey = `projects:${project_id}`;
  if (userEmail) {
    cacheKey += `:${userEmail}`;
  }

  try {
    const data = await fetchProjectById(project_id, userEmail);
    cacheResponse(cacheKey, data); // Cache the response
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Failed to fetch project details for ID: ${req.params.id}`,
    });
  }
});

router.get("/languages", async (req, res) => {
  const project_id =req.query.project_id;
  try {
    const data = await fetchLanguage(project_id);

    if (data && data !== "undefined") {
      res.status(200).send(data);
    } else {
      res.status(404).send({ error: "No Language" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch Languages " });
  }
});

router.post("/addprojects", async (req, res) => {
  try {
    const {
      projectName,
      project_id,
      project_route,
      project_title,
      is_active,
      is_toloka,
      finished_task_number,
      task_number,
    } = req.body;
    // Validate required fields
    if (!project_id || !project_route || !project_title) {
      return res.status(400).json({
        success: false,
        message: "project_id, project_route, and project_title are required",
      });
    }
    const project = await addprojects(
      projectName,
      project_id,
      project_route,
      project_title,
      is_active,
      is_toloka,
      finished_task_number,
      task_number
    );

    return res.status(201).json({
      success: true,
      message: "Project stored successfully",
      data: {
        projectName,
        project_id,
        project_route,
        project_title,
        is_active,
        is_toloka,
        finished_task_number,
        task_number,
      },
    });
  } catch (error) {
    console.error("Error storing project in Snowflake:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to store project: ${error.message}`,
    });
  }
});
module.exports = router;
