const express = require("express");
const session = require("express-session");
// import fetch from 'node-fetch';
// const fetch = require('node-fetch');
const bodyParser = require("body-parser");
const RedisStore = require("connect-redis").default;
const projectRouter = require("./routes/projectRouter");
const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const statsRouter = require("./routes/statsRouter");
const documentsRouter = require("./routes/documentsRouter");
const analysisRouter = require("./routes/AnalysisRouter");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
const redisClient = require("./redis/redisClient");
const cacheMiddleware = require("./middlewares/cache");
const app = express();

const secret = process.env.SECRET;

// Define the allowed origin
const allowedOrigin = [
  "http://13.202.236.112:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://tara.caraxes.online:5173",
  "http://tara.caraxes.online",
  "http://tara.innosquares.com",
];

// CORS configuration options
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigin.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Enable credentials (cookies, authentication)
};

// Apply the CORS middleware to all routes
app.use(cors(corsOptions));
//app.use(cors());
app.use(express.json()); // Middleware to parse JSON
app.use(bodyParser.urlencoded({ extended: true }));

const sessionMiddleware = session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({ client: redisClient }),
});

// const updateView = async () => {
//   try {
//     const response = await fetch(
//       "https://notlabel-studio.toloka-test.ai/api/dm/views/16559?interaction=filter&project=1033",
//       {
//         method: "PUT",
//         headers: {
//           Authorization: "Token 33bc245fd0af2cd9c678b0e273a089b142a3f7d4",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           id: 16559,
//           data: {
//             title: "New Tab 11",
//             ordering: [],
//             type: "list",
//             target: "tasks",
//             filters: {
//               conjunction: "and",
//               items: [
//                 {
//                   filter: "filter:tasks:updated_at",
//                   operator: "in",
//                   value: {
//                     min: new Date(
//                       new Date().setDate(new Date().getDate() - 1)
//                     ).toISOString(),
//                     max: new Date().toISOString(),
//                   },
//                   type: "Datetime",
//                 },
//               ],
//             },
//             hiddenColumns: {
//               explore: [
//                 "tasks:inner_id",
//                 "tasks:total_predictions",
//                 "tasks:annotations_results",
//                 "tasks:annotations_ids",
//                 "tasks:file_upload",
//                 "tasks:storage_filename",
//                 "tasks:created_at",
//                 "tasks:updated_at",
//                 "tasks:updated_by",
//                 "tasks:avg_lead_time",
//                 "tasks:draft_exists",
//               ],
//               labeling: [
//                 "tasks:data.diff",
//                 "tasks:data.plan",
//                 "tasks:data.task",
//                 "tasks:data.uuid",
//                 "tasks:data.input",
//                 "tasks:data.modify",
//                 "tasks:data.output",
//                 "tasks:data.sample",
//                 "tasks:data.context",
//                 "tasks:data.verdict",
//                 "tasks:data.batch_id",
//                 "tasks:data.language",
//                 "tasks:data.iteration",
//                 "tasks:data.qa_result",
//                 "tasks:data.input_files",
//                 "tasks:data.language_md",
//                 "tasks:data.output_files",
//                 "tasks:data.llm_complexity",
//                 "tasks:id",
//                 "tasks:inner_id",
//                 "tasks:completed_at",
//                 "tasks:cancelled_annotations",
//                 "tasks:total_predictions",
//                 "tasks:assignees",
//                 "tasks:annotators",
//                 "tasks:annotations_results",
//                 "tasks:annotations_ids",
//                 "tasks:file_upload",
//                 "tasks:storage_filename",
//                 "tasks:created_at",
//                 "tasks:updated_at",
//                 "tasks:updated_by",
//                 "tasks:avg_lead_time",
//                 "tasks:draft_exists",
//               ],
//             },
//             columnsWidth: {},
//             columnsDisplayType: {},
//             gridWidth: 4,
//             semantic_search: [],
//             threshold: {
//               min: 0,
//               max: 1,
//             },
//           },
//           project: "1033",
//         }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     console.log("View updated successfully");
//   } catch (error) {
//     console.error("Error updating view:", error);
//   }
// };
// updateView();
// setInterval(updateView, 24 * 60 * 60 * 1000); // Call updateView function every day

// Setup session with Redis
app.use("/api/", documentsRouter);
app.use("/api", projectRouter); // Project routes prefixed with /api
app.use("/api/tasks", statsRouter);
app.use(sessionMiddleware);
app.use("/api/", userRouter);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api", analysisRouter);
require("./passport/passport-config");

// Use the project router for routes starting with /api
app.use("/", authRouter);
// app.use("/api", userRouter); // User routes prefixed with /api
// Stats routes

app.use((req, res, next) => {
  res.status(404).send({ error: "Not Found" });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

(module.exports = app), redisClient;
