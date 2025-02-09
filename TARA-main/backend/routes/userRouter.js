const express = require("express");
// const connectPromise = require("../services/server");
const nodemailer = require("nodemailer");

const router = express.Router();
const {
  fetchAnnotationById,
  fetchReviewerDataForAdmin,
  fetchDeveloperDataForAdmin,
  updateAnnotationById,
  assignTasks,
  getDeveloperDataByID,
  assignReviewer,
  getDeveloperDataForRev,
  getLanguageStats,
  changePassword,
  GetUsers,
} = require("../services/common_function");

const {
  insertData,
  fetchAssignedData,
  insertAnnouncement,
  getAnnouncement,
  getLocationStats,
  changeRole,
  createTrackerTasks,
  getTasks,
  updateTaskStatus,
  getCompleted1Tasks,
  createProjectTracker,
  getProjectsTracker,
  updateTrackerTask,
  getTasksSummary,
  getCourseTrainings,
  assignTraining,
  AssignTasksLogs,
  deleteTask,
} = require("../services/server");

router.get("/task-summary", async (req, res) => {
  try {
    const taskSummary = await getTasksSummary();
    res.status(200).json(taskSummary);
  } catch (error) {
    res.status(500).json({ error: "Error fetching task summary" });
  }
});

// Route to get all user annotations by using email
router.get("/userAnnotations", async (req, res) => {
  try {
    const email = req.query.email;
    const data = await fetchAnnotationById(email);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch user annotations details" });
  }
});

// Route to get all reviewer assign tasks by using email
router.get("/reviewer", async (req, res) => {
  try {
    const email = req.query.email;
    const data = await getDeveloperDataForRev(email);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch user annotations details" });
  }
});

router.get("/getReviewer", async (req, res) => {
  try {
    const data = await fetchReviewerDataForAdmin();
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch user annotations details" });
  }
});

router.get("/getLanguageStats", async (req, res) => {
  const { projectRoute } = req.query;
  try {
    const data = await getLanguageStats(projectRoute);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch language stats" });
  }
});

// Route to patch project details
router.patch("/userAnnotation", async (req, res) => {
  try {
    const updates = req.body;

    // Validate that both 'status' and 'id' are present in the request body
    if (!updates.status || !updates.taskid) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Both status and id fields are required.",
      });
    }

    const data = await updateAnnotationById(updates);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to update user annotations." });
  }
});

router.post("/sendMail", async (req, res) => {
  try {
    const {
      email,
      taskDescription,
      projectName,
      markedAs,
      assignedBy,
      startDate,
      endDate,
    } = req.body;
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "nisoojadhav@gmail.com",
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: "nishant.jadhav@64-squares.com",
      to: email,
      subject: `New task assigned on the Project: ${projectName}`,
      html: `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fa;
            margin: 0;
            padding: 20px;
          }
          .email-container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: auto;
          }
          .title {
            color: #4CAF50;
            text-align: center;
          }
          p {
            color: #333;
            line-height: 1.6;
            font-size: 16px;
          }
          .task-info {
            background-color: #f9f9f9;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
          }
          .task-info p {
            margin: 5px 0;
          }
          .task-info span {
            font-weight: bold;
          }
          .btn {
            display: inline-block;
            background-color: #4CAF50;
            color: #ffffff;
            padding: 10px 10px;
            text-decoration: none;
            border-radius: 4px;
            text-align: center;
            margin-top: 5px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            margin-top: 20px;
          }
          h1{
            text-align: center;
            font-style: bold;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1>TARA - Application</h1>
          <hr/>
          <h2 class='title'>New Task Assigned!</h2>
          <p>Hey <strong>${email}</strong></p>
          <p>You’ve been assigned a new task on the <strong>${projectName}</strong> project.</p>

          <div class="task-info">
            <p><span>Task Description:</span> "${taskDescription}"</p>
            <p><span>Assigned By:</span> ${assignedBy}</p>
            <p><span>Status:</span> ${markedAs}</p>
            <p><span>Time Schedule:</span> ${startDate} - ${endDate}</p>
          </div>

          <p>To view the task details, click the button below:</p>
          <center>
            <a href="http://tara.innosquares.com/project-management/list" target="_blank" class="btn">View Task</a>
          </center>
          
          <hr />
          <div class="footer">
            <p>If you have any questions, feel free to <a href="mailto:nishant.jadhav@64-squares.com" target="_blank">Contact us</a></p>
            <p><a href="https://forms.gle/WxTZBPh6jdhGMK1x7" target="_blank">Found a bug?</a></p>
          </div>
        </div>
      </body>
    </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send("Mail notification sent successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to send mail notification" });
  }
});

router.post("/userAnnotation", async (req, res) => {
  try {
    const { email, role } = req.body;
    const projectRoute = req.query.projectRoute;

    if (role === "Reviewer") {
      const data = await getDeveloperDataByID(email, projectRoute);
      res.status(200).send(data);
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Permission denied",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch project details" });
  }
});

router.post("/getDevelopers", async (req, res) => {
  try {
    const { role } = req.body;

    if (role === "Admin") {
      const data = await fetchDeveloperDataForAdmin();
      res.status(200).send(data);
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Permission denied",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch project details" });
  }
});

router.post("/assignTasks", async (req, res) => {
  try {
    const { project_id } = req.query;
    const { data, role } = req.body;

    if (role === "Admin") {
      const result = await assignTasks(data, project_id);
      res.status(200).send(result);
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Permission denied",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch project details" });
  }
});

router.post("/changepassword", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username);

    const result = await changePassword(username, password);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to change password" });
  }
});

router.post("/assignReviewer", async (req, res) => {
  try {
    const { data, role } = req.body;

    if (role === "Admin") {
      const result = await assignReviewer(data);
      res.status(200).send(result);
    } else {
      return res.status(400).json({
        error: "Bad Request",
        message: "Permission denied",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch project details" });
  }
});

router.post("/changeRole", async (req, res) => {
  try {
    const { memberEmail, role } = req.body;
    const result = await changeRole(memberEmail, role);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to change role" });
  }
});

router.post("/createAnnouncement", async (req, res) => {
  try {
    const { msg, time } = req.body;
    const result = await insertAnnouncement(msg, time);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to create announcement" });
  }
});

router.post("/createTrackerTasks", async (req, res) => {
  try {
    const {
      user_email,
      task_name,
      task_status,
      start_date,
      end_date,
      project_name,
      create_date_time,
    } = req.body;
    
    const result = await createTrackerTasks(
      user_email,
      task_name,
      task_status,
      start_date,
      end_date,
      project_name,
      create_date_time
    );
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to submit tasks details" });
  }
});

router.post("/createProjectTracker", async (req, res) => {
  try {
    const { project_name, team_lead } = req.body;
    const result = await createProjectTracker(project_name, team_lead);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to insert project for tracking" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const result = await GetUsers();
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to Get Users" });
  }
});

router.post("/updateTrackerTask", async (req, res) => {
  try {
    const {
      user_email,
      task_name,
      task_status,
      start_date,
      end_date,
      project_name,
      task_id,
    } = req.body;

    // Check for missing fields
    if (
      !user_email ||
      !task_name ||
      !task_status ||
      !start_date ||
      !end_date ||
      !project_name ||
      !task_id
    ) {
      return res.status(400).send({ error: "All fields are required" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return res.status(400).send({ error: "Invalid email format" });
    }

    // Validate date formats (optional)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return res
        .status(400)
        .send({ error: "Invalid date format. Use YYYY-MM-DD." });
    }
    const result = await updateTrackerTask(
      user_email,
      task_name,
      task_status,
      start_date,
      end_date,
      project_name,
      task_id
    );

    // If no rows were affected, return 404
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: "No task found with the provided task_id" });
    }

    // Respond with success message
    res.status(200).send({
      message: "Task updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating tracker task:", error);
    res.status(500).send({
      error: "Failed to update tracker task. Please try again later.",
      details: error.message,
    });
  }
});

router.post("/assignTraining", async (req, res) => {
  try {
    const { user_email, training_id, status } = req.body;
    if (!user_email || !training_id || !status) {
      return res.status(400).send({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return res.status(400).send({ error: "Invalid email format" });
    }

    if (!Number.isInteger(Number(training_id))) {
      return res
        .status(400)
        .send({ error: "Training ID must be a valid number" });
    }

    const result = await assignTraining(user_email, training_id, status);

    res.status(200).send({
      message: "Training assigned successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating training assignment:", error);
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).send({
        error: "Invalid training ID. The specified training does not exist.",
        details: error.message,
      });
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).send({
        error: "This user is already assigned to this training.",
        details: error.message,
      });
    }
    res.status(500).send({
      error: "Failed to create training assignment. Please try again later.",
      details: error.message,
    });
  }
});

router.get("/getProjectsTracker", async (req, res) => {
  try {
    const result = await getProjectsTracker();
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch projects for tracker" });
  }
});

router.get("/getCourseTrainings", async (req, res) => {
  try {
    const result = await getCourseTrainings();
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to Get Course Trainings" });
  }
});

router.get("/getTasks", async (req, res) => {
  try {
    const result = await getTasks();
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch announcement" });
  }
});

// PUT route handler
router.put("/updateTaskStatus/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { taskStatus } = req.body;

    if (!taskId || !taskStatus) {
      return res.status(400).send({ error: "Task ID and status are required" });
    }

    const result = await updateTaskStatus(taskId, taskStatus);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to update task status" });
  }
});

router.delete("/deleteTask/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;

    if (!taskId) {
      return res.status(400).send({ error: "Task ID is required" });
    }

    const result = await deleteTask(taskId);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to delete task" });
  }
});

router.get("/getTasksForAdmin", async (req, res) => {
  try {
    const result = await getCompleted1Tasks();
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch tasks for admin" });
  }
});

router.get("/getAnnouncement", async (req, res) => {
  try {
    const result = await getAnnouncement();
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch announcement" });
  }
});

router.get("/locationStats", async (req, res) => {
  try {
    const result = await getLocationStats();
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch location stats" });
  }
});
router.get("/logs", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const logs = await AssignTasksLogs(fromDate, toDate);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// const connectPromise = new Promise((resolve, reject) => {
//   connection.connect((err, conn) => {
//     if (err) {
//       console.error("Unable to connect: " + err.message);
//       reject(err);
//     } else {
//       console.log("Successfully connected to Snowflake.");
//       resolve(conn);
//     }
//   });
// });

// if (connectPromise && typeof connectPromise.then === "function") {
//   connectPromise
//     .then(() => {
//       insertData(data);
//     })
//     .catch((error) => {
//       console.error("Error establishing database connection:", error);
//     });
// } else {
//   console.error("Database connection promise is undefined or not a function");
// }

router.get("/test", async (req, res) => {
  try {
    const test = await getDynamicViewID(1033);
    res.status(200).json(test);
  } catch (error) {
    console.log(error);
  }
});
router.get ("fetchGetAssignTaskCount",async (req, res) => {
  try {
    const data = await fetchGetAssignTaskCount();
    if (data && data.length > 0) {
      res.status(200).send(data);
    } else {
      res.status(404).send({ error: "No assigned tasks found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch assigned tasks" });
  }
});

router.get("/fetchAssignedTasks", async (req, res) => {
  try {
    const data = await fetchAssignedData(req);
    if (data && data.length > 0) {
      res.status(200).send(data);
    } else {
      res.status(404).send({ error: "No assigned tasks found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch assigned tasks" });
  }
});

module.exports = router;
