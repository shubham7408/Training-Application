require("dotenv").config();
const AWS = require("aws-sdk");
const { promisify } = require("util");
const sleep = promisify(setTimeout);
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // Base delay in milliseconds
  maxDelay: 5000, // Maximum delay in milliseconds
};
class UploadError extends Error {
  constructor(message, originalError, file) {
    super(message);
    this.name = "UploadError";
    this.originalError = originalError;
    this.file = file;
    this.isRetryable = this.determineIfRetryable(originalError);
  }

  determineIfRetryable(error) {
    const retryableCodes = [
      "NetworkingError",
      "TimeoutError",
      "RequestTimeout",
      "ECONNRESET",
    ];
    return retryableCodes.includes(error.code) || error.retryable === true;
  }
}
const project_ids = require("../data/project_ids.json");
const {
  putAssignTasks,
  getProjectDetails,
  getDeveloperDataForAdmin,
  getAnnotationTasksForDev,
  getUserDetails,
  updateAnnotationTasks,
  getAllReviewer,
  getDeveloperData,
  getProjectData,
  getAnnotationTasksForRev,
  updatePassword,
  insertAnnouncement,
} = require("./server");

const {
  fetchFilterAnnotationZeroAssignEmpty,
  assignTasksToDeveloper,
  fetchFilterAnnotationZeroAssignEmptyLanguages,
} = require("../services/toloka-apis");
const redisClient = require("../redis/redisClient");

// Middleware to cache data
const cacheResponse = (key, data, duration = 21600) => {
  redisClient.setEx(key, duration, JSON.stringify(data));
};
const winston = require("winston");

// Configure winston to log to a file
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: "log/task_assign.log" }),
  ],
});

// Define the API URL and authentication token
const apiUrl = process.env.PROJECT_COUNT_URL;
const token = process.env.AUTH_TOKEN;
let userSchemaName = process.env.USERSCHEMANAME;

let PROJECTSCHEMANAME = process.env.PROJECTSCHEMANAME;
const connection = require("./connection");
const { log } = require("console");

const runQuery = async (sql, values) => {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sql,
      binds: values,
      complete: function (err, stmt, rows) {
        if (err) {
          console.error(
            "Failed to execute statement due to the following error: " +
              err.message
          );
          reject(new Error(err.message));
        } else {
          resolve(rows);
        }
      },
    });
  });
};

const fetchProjectDetails = async () => {
  // Define the headers
  const headers = {
    accept: "*/*",
    "accept-language": "en-GB,en;q=0.6",
    priority: "u=1, i",
    "sec-fetch-mode": "same-origin",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    Authorization: `Token ${token}`,
  };

  // Make the GET request
  try {
    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const fetchProjectById = async (project_id, userEmail) => {
  try {
    const table_name = project_ids[String(project_id)]; // Convert id to string if it's not already

    if (table_name === undefined || table_name === null)
      return new Error("Project ID is not present");

    const result = await getProjectDetails(table_name, userEmail);
    return result;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const fetchAnnotationById = async (userEmail) => {
  try {
    const result = await getAnnotationTasksForDev(userEmail);
    return result;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const fetchUserDetailsByEmail = async (userEmail) => {
  try {
    const result = await getUserDetails(userEmail);
    return result;
  } catch (error) {
    console.error("Error:", error.message);
    return error.message;
  }
};

const updateAnnotationById = async (updates) => {
  try {
    const result = await updateAnnotationTasks(updates);
    return result;
  } catch (error) {
    console.error("Error:", error.message);
    return error.message;
  }
};

const getDeveloperDataByID = async (email, projectRoute) => {
  try {
    const result = await getDeveloperData(email, projectRoute);
    return result;
  } catch (error) {
    console.error("Error:", error.message);
    return error.message;
  }
};

const getDeveloperDataForRev = async (email) => {
  try {
    const result = await getAnnotationTasksForRev(email);
    return result;
  } catch (error) {
    console.error("Error:", error.message);
    return error.message;
  }
};

const fetchDeveloperDataForAdmin = async () => {
  try {
    const result = await getDeveloperDataForAdmin();
    return result;
  } catch (error) {
    console.error("Error:", error.message);
    return error.message;
  }
};

const fetchReviewerDataForAdmin = async () => {
  try {
    const result = await getAllReviewer();
    return result;
  } catch (error) {
    console.error("Error:", error.message);
    return error.message;
  }
};

const changePassword = async (username, password) => {
  try {
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    if (typeof username !== "string" || typeof password !== "string") {
      throw new Error("Username and password must be strings");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const result = await updatePassword(username, password);
    if (result && result[0]["number of rows updated"] > 0) {
      return { success: true, message: "Password updated successfully" };
    } else {
      return { success: false, message: "Failed to update password" };
    }
  } catch (error) {
    console.error("Error changing password:", error);
    throw new Error(`Failed to change password: ${error.message}`);
  }
};

const assignTasks = async (payload, project_id) => {
  try {
    const languages = Object.keys(payload);

    // Calculate the sum of values in the payload
    const sum = Object.values(payload[languages[0]]).reduce(
      (total, value) => total + Number(value),
      0
    );

    logger.info(`Total Task assigning ${sum}:`);

    // Fetch the result of filter annotation
    const result = await fetchFilterAnnotationZeroAssignEmpty(
      languages[0],
      project_id
    );

    if (!result || !result.tasks) {
      logger.error(
        "Invalid result format from fetchFilterAnnotationZeroAssignEmpty."
      );
      return {
        error: true,
        message: "Task assignment failed. Please try again.",
      };
    }
    tasks = result.tasks;

    if (sum <= Number(result.total)) {
      const user_details = await getDeveloperDataForAdmin(project_id); // Ensure this function is awaited
      // Convert payload object to an array of [email, value] pairs
      const entries = Object.entries(payload[languages[0]]);

      let taskIndex = 0;
      logger.info("Beginning the task assignment process...");
      // Iterate over the entries array
      for (let [email, value] of entries) {
        const user = user_details.find((user) => user.USER_EMAIL === email);

        if (user && Number(value) > 0) {
          let data = [];
          // Collect task IDs for the current user
          for (let i = 0; i < Number(value); i++) {
            if (tasks[taskIndex] && tasks[taskIndex].id) {
              data.push(tasks[taskIndex].id);
              taskIndex++;
            } else {
              console.warn("No more tasks available.");
              logger.warn("No more tasks available.");
            }
          }

          // Convert data array to JSON string
          const eachTasks = JSON.stringify(data);
          // Perform the task assignment
          let assignmentResult = await assignTasksToDeveloper(
            user.USER_ID,
            eachTasks,
            languages[0],
            project_id
          );
          if (assignmentResult === 200) {
            await putAssignTasks(
              value,
              user,
              eachTasks,
              languages[0],
              project_id
            );
            console.log("user", user,eachTasks);
            // Log successful task assignment
            // console.log(
            //   `Successfully assigned ${value} tasks to ${user.USER_EMAIL}: ${eachTasks}`
            // );
            logger.info(
              `Successfully assigned ${value} tasks to ${user.USER_EMAIL}: ${eachTasks}`
            );
          } else {
            console.log(
              `Failed to assigned tasks to ${user.USER_EMAIL}: ${eachTasks}`
            );
            // Log failed task assignment
            logger.error(
              `Failed to assigned tasks to ${user.USER_EMAIL}: ${eachTasks}`
            );
          }
        } else if (user && Number(value) === 0) {
          await putAssignTasks(0, user, "[null]", languages[0], project_id);
          // console.log(`Zero tasks assigned to ${user.USER_EMAIL}: [null]`);
          logger.info(`Zero tasks assigned to ${user.USER_EMAIL}: [null]`);
        } else {
          console.log(`User is not present ${email} in developer list.`);
          logger.info(`User is not present ${email} in developer list.`);
        }
      }

      // Return a success message or result if needed
      // console.log("All tasks have been successfully assigned.");
      logger.info("All tasks have been successfully assigned.");
      return {
        error: false,
        message: "All tasks have been successfully assigned.",
      };
    } else {
      logger.error(
        "Total Annotations Zero task is less than assigned tasks. Stopping the assignment."
      );
      return {
        error: true,
        message: `The total tasks to assign is greater than the available tasks: ${result.total}. Stopping the assignment.`,
      };
    }
  } catch (error) {
    // Handle any errors that might occur
    console.error("An error occurred:", error);
    logger.error(
      "Error occurs while assigning tasks. Stopping the assignment."
    );
  }
};

const assignReviewer = async (payload, project_id) => {
  try {
    const languages = Object.keys(payload);

    // Calculate the sum of values in the payload
    const sum = Object.values(payload[languages[0]]).reduce(
      (total, value) => total + Number(value),
      0
    );
    logger.info(`Total Task assigning ${sum}:`);
    console.log("languageslaguages", languages);
    // Fetch the result of filter annotation
    const result = await fetchFilterAnnotationZeroAssignEmpty(
      languages[0],
      project_id
    );
    // const result = await fetchFilterAnnotationZero(languages[0]);

    if (!result || !result.tasks) {
      logger.error(
        "Invalid result format from fetchFilterAnnotationZeroAssignEmpty."
      );
      return {
        error: true,
        message: "Task assignment failed. Please try again.",
      };
    }
    tasks = result.tasks;

    if (sum <= Number(result.total)) {
      const user_details = await getDeveloperDataForAdmin(); // Ensure this function is awaited

      // Convert payload object to an array of [email, value] pairs
      const entries = Object.entries(payload[languages[0]]);

      let taskIndex = 0;
      console.log("Beginning the task assignment process...");
      logger.info("Beginning the task assignment process...");
      // Iterate over the entries array
      for (let [email, value] of entries) {
        const user = user_details.find((user) => user.USER_EMAIL === email);

        if (user && Number(value) > 0) {
          let data = [];
          // Collect task IDs for the current user
          for (let i = 0; i < Number(value); i++) {
            if (tasks[taskIndex] && tasks[taskIndex].id) {
              data.push(tasks[taskIndex].id);
              taskIndex++;
            } else {
              console.warn("No more tasks available.");
              logger.warn("No more tasks available.");
            }
          }

          // Convert data array to JSON string
          const eachTasks = JSON.stringify(data);

          // Perform the task assignment
          let assignmentResult = await assignTasksToDeveloper(
            user.USER_ID,
            eachTasks,
            languages[0],
            project_id
          );
          if (assignmentResult === 200) {
            await putAssignTasks(value, user, eachTasks, languages[0]);

            // Log successful task assignment
            console.log(
              `Successfully assigned ${value} tasks to ${user.USER_EMAIL}: ${eachTasks}`
            );
            logger.info(
              `Successfully assigned ${value} tasks to ${user.USER_EMAIL}: ${eachTasks}`
            );
          } else {
            console.log(
              `Failed to assigned tasks to ${user.USER_EMAIL}: ${eachTasks}`
            );
            // Log failed task assignment
            logger.error(
              `Failed to assigned tasks to ${user.USER_EMAIL}: ${eachTasks}`
            );
          }
        } else if (user && Number(value) === 0) {
          await putAssignTasks(0, user, "[null]", languages[0], project_id);
          // console.log(`Zero tasks assigned to ${user.USER_EMAIL}: [null]`);
          logger.info(`Zero tasks assigned to ${user.USER_EMAIL}: [null]`);
        } else {
          // console.log(`User not present ${email}`);
          logger.info(`User not present ${email}`);
        }
      }

      // Return a success message or result if needed
      // console.log("All tasks have been successfully assigned.");
      logger.info("All tasks have been successfully assigned.");
      return {
        error: false,
        message: "All tasks have been successfully assigned.",
      };
    } else {
      logger.error(
        "Total Annotations Zero task is less than assigned tasks. Stopping the assignment."
      );
      return {
        error: true,
        message: `The total tasks to assign is greater than the available tasks: ${result.total}. Stopping the assignment.`,
      };
    }
  } catch (error) {
    // Handle any errors that might occur
    console.error("An error occurred:", error);
    logger.error(
      "Error occurs while assigning tasks. Stopping the assignment."
    );
  }
};

const fetchLanguage = async (project_id) => {
  try {
    const result = await fetchFilterAnnotationZeroAssignEmptyLanguages(
      project_id
    );

    if (!result || !result.tasks) {
      logger.error("Invalid result format from fetchLanguage.");
      return {
        error: true,
        message: "Failed to fetch language. Please try again later.",
      };
    }

    const { total: total, tasks: tasks } = result;

    const languageCount = tasks
      .map(({ data: { language } }) => language)
      .reduce((acc, language) => {
        acc[language] = (acc[language] || 0) + 1;
        return acc;
      }, {});

    const data = {
      tasksAvailable: total,
      languages: languageCount,
    };

    return data;
  } catch (error) {
    console.error("Error fetching:", error);
    throw error; // Throw the error to propagate it further if needed
  }
};

const getLanguageStats = async (projectRoute) => {
  console.log("projectRouteaaaaaaaaaaaaaa", projectRoute);
  const sql = `
	  SELECT 
		  LANGUAGE,
		  SUM(CASE WHEN QA_VERDICT = 'approved' THEN 1 ELSE 0 END) AS approved_count,
		  SUM(CASE WHEN QA_VERDICT = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
		  SUM(CASE WHEN QA_VERDICT = 'batch_rewrite' THEN 1 ELSE 0 END) AS batch_rewrite_count,
		  SUM(CASE WHEN QA_VERDICT IN ('approved', 'rejected', 'batch_rewrite') THEN 1 ELSE 0 END) AS total_tasks
	  FROM 
		  ${PROJECTSCHEMANAME}.${projectRoute}
	  WHERE 
		  QA_VERDICT IN ('approved', 'rejected', 'batch_rewrite')
	  GROUP BY 
		  LANGUAGE
	  ORDER BY 
		  LANGUAGE;
	`;
  try {
    const result = await runQuery(sql);
    return result;
  } catch (error) {
    console.error("Error executing language stats query:", error);
    throw error; // Re-throw the error to handle it further up the call stack
  }
};

const fetchProjectData = async () => {
  try {
    const data = await getProjectData();
    return data;
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw new Error(`Failed to fetch project data: ${error.message}`);
  }
};

const storeDocumentsEnhanced = async (files, domain) => {
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error(
      "S3 bucket name is not configured. Please check your environment variables."
    );
  }

  // Validate domain
  const validDomains = ["Healthcare", "Finance", "Technology"];
  const normalizedDomain =
    domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase();

  if (!validDomains.includes(normalizedDomain)) {
    throw new Error(
      `Invalid domain. Must be one of: ${validDomains.join(", ")}`
    );
  }

  const s3 = new AWS.S3({
    maxRetries: 3,
    httpOptions: { timeout: 5000 },
    logger: console,
  });

  const fileArray = files.documentUpload ? files.documentUpload : files;
  const documentUrls = [];
  const uploadErrors = [];

  // Validate bucket access before processing files
  try {
    await s3.headBucket({ Bucket: process.env.AWS_BUCKET_NAME }).promise();
  } catch (error) {
    if (error.code === "Forbidden") {
      throw new UploadError(
        "No access to S3 bucket. Please check IAM permissions.",
        error,
        null
      );
    }
    throw new UploadError(`S3 bucket error: ${error.message}`, error, null);
  }

  // Process each file with retry logic
  for (const file of fileArray) {
    let retryCount = 0;
    let lastError = null;

    while (retryCount < RETRY_CONFIG.maxRetries) {
      try {
        // Create the file key with domain-specific folder structure
        const fileKey = `ARGOS/${normalizedDomain}/${Date.now()}-${encodeURIComponent(
          file.originalname
        )}`;

        const uploadResult = await s3
          .upload({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentDisposition: "inline",
            Metadata: {
              originalName: file.originalname,
              uploadTimestamp: new Date().toISOString(),
              domain: normalizedDomain,
            },
          })
          .promise();

        documentUrls.push({
          type: "document",
          url: uploadResult.Location,
          filename: file.originalname,
          uploadedAt: new Date().toISOString(),
          domain: normalizedDomain,
        });

        // console.log(
        //   `Successfully uploaded ${file.originalname} to S3 in ${normalizedDomain} folder`
        // );
        break; // Success, exit retry loop
      } catch (error) {
        lastError = new UploadError(
          `Failed to upload ${file.originalname}`,
          error,
          file
        );

        if (
          !lastError.isRetryable ||
          retryCount === RETRY_CONFIG.maxRetries - 1
        ) {
          uploadErrors.push(lastError);
          break;
        }

        // Calculate exponential backoff with jitter
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, retryCount) +
            Math.random() * 1000,
          RETRY_CONFIG.maxDelay
        );

        console.warn(
          `Retry ${retryCount + 1}/${RETRY_CONFIG.maxRetries} for ${
            file.originalname
          } after ${delay}ms`
        );
        await sleep(delay);
        retryCount++;
      }
    }
  }

  // Handle results
  if (uploadErrors.length > 0) {
    // Clean up successful uploads if there were any errors
    await Promise.allSettled(
      documentUrls.map(async (doc) => {
        try {
          const key = doc.url.split("/").slice(3).join("/");
          await s3
            .deleteObject({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: key,
            })
            .promise();
          // console.log(`Cleaned up file: ${key}`);
        } catch (error) {
          // console.error(`Failed to clean up file: ${doc.url}`, error);
        }
      })
    );

    throw new Error(
      `Upload failed for ${uploadErrors.length} files: ${uploadErrors
        .map(
          (error) => `${error.file.originalname} (${error.originalError.code})`
        )
        .join(", ")}`
    );
  }
  // console.log("documenturls", documentUrls);
  return documentUrls;
};
// Helper function to validate files before processing
const validateFiles = (files) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const errors = [];

  const validateFile = (file) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push(
        `Invalid file type for ${file.originalname}. Allowed types: PDF, JPEG, PNG, DOC, DOCX`
      );
    }
    if (file.size > maxFileSize) {
      errors.push(`File ${file.originalname} exceeds maximum size of 5MB`);
    }
  };

  // Handle both multer file structure and direct file array
  if (files.documentUpload) {
    files.documentUpload.forEach(validateFile);
  } else if (Array.isArray(files)) {
    files.forEach(validateFile);
  }

  return errors;
};

const checkChecksumInSnowflake = async (checksum) => {
  try {
    const query = `
      SELECT COUNT(1) AS checksum_count 
      FROM DOMAIN_MANAGEMENT.Documents 
      WHERE CHECKSUM = ?`;

    const result = await runQuery(query, [checksum]);
    return result && result[0].CHECKSUM_COUNT > 0;
  } catch (error) {
    console.error("Error checking checksum in Snowflake:", error);
    throw new Error("Failed to check checksum in database");
  }
};

const storeDataInSnowflake = async (
  domainName,
  projectName,
  url,
  domain,
  numImages,
  numResults,
  documentUrls,
  licenseName,
  licenseUrl,
  Notes,
  checksum
) => {
  try {
    // Validate required fields
    if (!domainName || !projectName || !domain) {
      throw new Error("Domain name, project name, and domain are required");
    }

    const tableName = "DOMAIN_MANAGEMENT.Documents";

    // Ensure documentUrls is an array with proper structure
    let documentUrlsArray = Array.isArray(documentUrls)
      ? documentUrls
      : documentUrls
      ? [documentUrls]
      : [];

    // Convert the documentUrls array to a JSON string
    const documentUrlsJson = JSON.stringify(documentUrlsArray);

    const insertSql = `
  INSERT INTO ${tableName} (
    FILE_ID,
    FILE_NAME,
    DOMAIN,
    SITE_URL,
    NUMBER_OF_IMAGES,
    NUMBER_OF_TABLES,
    LICENSE_URL,
    LICENSE_NAME,
    NOTES,
    DOCUMENT_URLS,
    CHECKSUM
  )
  SELECT 
    COALESCE(MAX(FILE_ID), 0) + 1,
    ?, ?, ?, ?, ?,
    ?, ?, ?,
    PARSE_JSON(?),
    ?
  FROM ${tableName}
`;

    // Bind values for the INSERT statement
    const binds = [
      domainName,
      domain,
      url || null,
      numImages || 0,
      numResults || 0,
      licenseUrl || null,
      licenseName || null,
      Notes || null,
      documentUrlsJson,
      checksum || null,
    ];
    // console.log("binds", binds);
    // console.log("insertSql", insertSql);
    // Run the insert data query
    await runQuery(insertSql, binds);

    return {
      success: true,
      message: "Documents collected successfully",
      documentUrls: documentUrlsArray,
    };
  } catch (error) {
    throw new Error(`Failed to store data: ${error.message}`);
  }
};

const getQuestions = async (req, res) => {
  try {
    const { domain, type, file_id } = req.query;

    // Validate required query parameters
    if (!type || !domain || !file_id) {
      return res
        .status(400)
        .json({ error: "Missing required query parameters." });
    }

    const tableName = "DOMAIN_MANAGEMENT.QUESTIONS";

    // SQL query with placeholders for parameters
    const fetchDocumentsSql = `
      SELECT *
      FROM ${tableName}
      WHERE TYPE = ? AND DOMAIN = ? AND FILE_ID = ?;
    `;

    // Fetch data from Snowflake
    const documents = await runQuery(fetchDocumentsSql, [
      type,
      domain,
      file_id,
    ]);

    // console.log("Raw query result:", documents);

    // Return the fetched documents as-is
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      error: "Error fetching documents",
      details: error.message,
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { domain, type } = req.query;

    const tableName = "DOMAIN_MANAGEMENT.DOCUMENTS";

    // Build the WHERE clause dynamically based on parameters
    let whereConditions = [];
    let queryParams = [];

    // Only add domain condition if it's provided and not empty
    if (domain && domain.trim() !== "") {
      whereConditions.push("d.DOMAIN = ?");
      queryParams.push(domain);
    }

    // Handle type filter
    if (type) {
      // Join with QUESTIONS table when type filter is present
      whereConditions.push("q.TYPE = ?");
      queryParams.push(type);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const fetchDocumentsSql = `
      SELECT DISTINCT
        d.FILE_ID,
        d.FILE_NAME,
        d.DOMAIN AS DOCUMENT_DOMAIN,
        d.SITE_URL,
        d.NUMBER_OF_IMAGES,
        d.NUMBER_OF_TABLES,
        d.LICENSE_URL,
        d.LICENSE_NAME,
        d.NOTES,
        d.DOCUMENT_URLS,
        qc.TABLE_QUESTIONS,
        qc.IMAGE_QUESTIONS,
        qc.TEXT_QUESTIONS
      FROM ${tableName} d
      ${
        type
          ? "INNER JOIN DOMAIN_MANAGEMENT.QUESTIONS q ON d.FILE_ID = q.FILE_ID"
          : ""
      }
      LEFT JOIN (
        SELECT
          FILE_ID,
          COUNT(CASE WHEN TYPE = 'table' THEN 1 END) AS TABLE_QUESTIONS,
          COUNT(CASE WHEN TYPE = 'image' THEN 1 END) AS IMAGE_QUESTIONS,
          COUNT(CASE WHEN TYPE = 'text' THEN 1 END) AS TEXT_QUESTIONS
        FROM DOMAIN_MANAGEMENT.QUESTIONS
        GROUP BY FILE_ID
      ) qc ON d.FILE_ID = qc.FILE_ID
      ${whereClause}
      ORDER BY d.DOMAIN, d.FILE_NAME
    `;

    // Run the query and fetch the data
    const documents = await runQuery(fetchDocumentsSql, queryParams);

    // Process the DOCUMENT_URLS variant field
    documents.forEach((doc) => {
      try {
        if (doc.DOCUMENT_URLS && typeof doc.DOCUMENT_URLS === "object") {
          doc.document_urls = doc.DOCUMENT_URLS;
        } else {
          doc.document_urls = [];
        }
        delete doc.DOCUMENT_URLS;
      } catch (error) {
        console.error("Error processing document_urls:", error);
        doc.document_urls = [];
      }
    });
    cacheResponse("/api/allfile", documents);

    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res
      .status(500)
      .json({ error: "Error fetching documents", details: error.message });
  }
};

const Qaentries = async (req, res) => {
  try {
    const {
      DOCUMENT_NAME,
      PAGE_NUMBER,
      ORDER_OF_APPEARANCE_ON_PAGE,
      TYPE,
      TITLE,
      QUESTION,
      QUESTION_TYPE,
      SHORT_ANSWER,
      LONG_ANSWER,
      DOMAIN,
      EMP_NAME,
      FILE_ID,
    } = req.body;

    console.log("req.body", req.body);

    const result = await storeQAEntries(
      DOCUMENT_NAME,
      PAGE_NUMBER,
      ORDER_OF_APPEARANCE_ON_PAGE,
      TYPE,
      TITLE,
      QUESTION,
      QUESTION_TYPE,
      SHORT_ANSWER,
      LONG_ANSWER,
      DOMAIN,
      EMP_NAME,
      FILE_ID
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in QA entries route:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const storeQAEntries = async (
  DOCUMENT_NAME,
  PAGE_NUMBER,
  ORDER_OF_APPEARANCE_ON_PAGE,
  TYPE,
  TITLE,
  QUESTION,
  QUESTION_TYPE,
  SHORT_ANSWER,
  LONG_ANSWER,
  DOMAIN,
  EMP_NAME,
  FILE_ID
) => {
  try {
    // Validate required fields
    if (!DOCUMENT_NAME || !QUESTION || !DOMAIN || !FILE_ID) {
      throw new Error(
        "Document name, question, domain, and fileId are required"
      );
    }

    const tableName = "DOMAIN_MANAGEMENT.QUESTIONS";

    // Query to get the maximum QUESTION_ID
    const getMaxIdSql = `SELECT MAX(QUESTION_ID) AS maxId FROM ${tableName}`;
    const maxIdResult = await runQuery(getMaxIdSql);

    // Determine the new QUESTION_ID
    const newQuestionId = (maxIdResult[0]?.MAXID || 0) + 1;

    // SQL to insert data
    const insertSql = `
      INSERT INTO ${tableName} (
        QUESTION_ID,
        DOCUMENT_NAME,
        PAGE_NUMBER,
        ORDER_OF_APPEARANCE_ON_PAGE,
        TYPE,
        TITLE,
        QUESTION,
        QUESTION_TYPE,
        SHORT_ANSWER,
        LONG_ANSWER,
        DOMAIN,
        EMP_NAME,
        FILE_ID
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Bind values for the INSERT statement
    const binds = [
      newQuestionId, // New QUESTION_ID
      DOCUMENT_NAME,
      PAGE_NUMBER || 0,
      ORDER_OF_APPEARANCE_ON_PAGE || 0,
      TYPE || null,
      TITLE || null,
      QUESTION,
      QUESTION_TYPE || null,
      SHORT_ANSWER || null,
      LONG_ANSWER || null,
      DOMAIN,
      EMP_NAME || null,
      FILE_ID,
    ];

    // Run the insert data query
    await runQuery(insertSql, binds);

    console.log("QA entry stored successfully");
    return {
      success: true,
      message: "QA entry stored successfully",
      data: {
        QUESTION_ID: newQuestionId,
        DOCUMENT_NAME,
        PAGE_NUMBER,
        ORDER_OF_APPEARANCE_ON_PAGE,
        TYPE,
        TITLE,
        QUESTION,
        QUESTION_TYPE,
        SHORT_ANSWER,
        LONG_ANSWER,
        DOMAIN,
        EMP_NAME,
        FILE_ID,
      },
    };
  } catch (error) {
    console.error("Error storing QA entry in Snowflake:", error);
    throw new Error(`Failed to store QA entry: ${error.message}`);
  }
};

// Update a specific QA entry in the database
const updateQAEntry = async (
  id,
  ORDER_OF_APPEARANCE_ON_PAGE,
  PAGE_NUMBER,
  QUESTION_TYPE,
  QUESTION,
  SHORT_ANSWER,
  LONG_ANSWER,
  TITLE,
  FILE_ID,
  TYPE
) => {
  try {
    const tableName = "DOMAIN_MANAGEMENT.QUESTIONS";
    // console.log("dbbbbbb");
    console.log(
      id,
      ORDER_OF_APPEARANCE_ON_PAGE,
      PAGE_NUMBER,
      QUESTION_TYPE,
      QUESTION,
      SHORT_ANSWER,
      LONG_ANSWER,
      TITLE,
      FILE_ID
    );
    // SQL query
    const updateSql = `
      UPDATE ${tableName}
      SET
  ORDER_OF_APPEARANCE_ON_PAGE = ?,
  PAGE_NUMBER = ?,
  QUESTION_TYPE = ?,
  QUESTION = ?,
  SHORT_ANSWER = ?,
  LONG_ANSWER = ?,
  TITLE = ?
  WHERE QUESTION_ID = ? AND FILE_ID = ? AND TYPE = ?; `;
    console.log(updateSql);
    const binds = [
      ORDER_OF_APPEARANCE_ON_PAGE || null,
      PAGE_NUMBER || null,
      QUESTION_TYPE || null,
      QUESTION || null,
      SHORT_ANSWER || null,
      LONG_ANSWER || null,
      TITLE || null,
      id || null,
      FILE_ID || null,
      TYPE || null,
    ];

    const result = await runQuery(updateSql, binds);
    console.log(result[0]["number of rows updated"]);
    return result[0]["number of rows updated"] > 0;
  } catch (error) {
    console.error("Error updating QA entry in Snowflake:", error);
    throw error;
  }
};

//Claude AI Logics

// Fetch all IDs from CLAUDE_AI table
const getAllQuestions = async () => {
  const sql = `SELECT ID, QUESTION,SUBJECT  FROM DOMAIN_MANAGEMENT.CLAUDE_AI ORDER BY ID`;
  return await runQuery(sql);
};

// Fetch a specific question by ID
const getQuestionById = async (id) => {
  const sql = `
    SELECT QUESTION, OPTION1, OPTION2, OPTION3, OPTION4, ANSWER , ANSWEREDBY , WRONGANSBYGPT ,GPTSTEPS,REALANSWER,SUBJECT 
    FROM DOMAIN_MANAGEMENT.CLAUDE_AI 
    WHERE ID = ?
  `;
  const rows = await runQuery(sql, [id]);
  return rows.length ? rows[0] : null;
};

// Utility function to insert data into the database
const insertQuestionData = async (questionData) => {
  const {
    question,
    options,
    correctAnswer,
    wrongAnswer,
    wrongAnswerText,
    referencedBy,
    subject,
    answerText,
  } = questionData;

  console.log("Data in common function:", questionData);

  const getIdSql = `
  SELECT COALESCE(MAX(ID), 0) AS maxId 
  FROM DB_INNO_PROD.DOMAIN_MANAGEMENT.CLAUDE_AI
`;

  try {
    const idResult = await runQuery(getIdSql, []);
    const newId = idResult[0]?.MAXID + 1 || 1; // Get highest ID and increment

    const insertSql = `
      INSERT INTO DB_INNO_PROD.DOMAIN_MANAGEMENT.CLAUDE_AI 
      (ID, QUESTION, OPTION1, OPTION2, OPTION3, OPTION4, ANSWER, ANSWEREDBY, WRONGANSBYGPT, SUBJECT, ANSWERTEXT, WRONGANSWERTEXT)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const binds = [
      newId,
      question,
      options[0] || null,
      options[1] || null,
      options[2] || null,
      options[3] || null,
      correctAnswer,
      referencedBy || null,
      wrongAnswer || null,
      subject,
      answerText || null,
      wrongAnswerText || null,
    ];

    const result = await runQuery(insertSql, binds);
    return result;
  } catch (error) {
    console.error("Error inserting question data: ", error);
    throw new Error("Failed to save question data");
  }
};

const addprojects = async (
  projectName,
  project_id,
  project_route,
  project_title,
  is_active,
  is_toloka,
  finished_task_number,
  task_number
) => {
  const tableName = "METADATA.PROJECT_ROUTE";

  // SQL to insert data
  const insertSql = `
    INSERT INTO ${tableName} (
        PROJECT_ID,
        PROJECT_ROUTE,
        PROJECT_TITLE,
        IS_ACTIVE,
        IS_TOLOKA,
        FINISHED_TASK_NUMBER,
        TASK_NUMBER
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
`;

  // Bind values for the INSERT statement
  const binds = [
    project_id,
    project_route || null,
    project_title || null,
    is_active || false,
    is_toloka || false,
    finished_task_number || 0,
    task_number || 0,
  ];
  // Run the insert data query
  await runQuery(insertSql, binds);
};

const GetUsers = async () => {
  const sql = `
	  SELECT id, user_id, user_email, role, other_email
FROM ${userSchemaName}.user_data`;
  try {
    const result = await runQuery(sql);
    return result;
  } catch (error) {
    console.error("Error executing language stats query:", error);
    throw error; // Re-throw the error to handle it further up the call stack
  }
};
module.exports = {
  fetchProjectDetails,
  GetUsers,
  fetchProjectById,
  fetchAnnotationById,
  fetchUserDetailsByEmail,
  updateAnnotationById,
  getDeveloperDataByID,
  getDeveloperDataForRev,
  fetchDeveloperDataForAdmin,
  assignTasks,
  assignReviewer,
  fetchReviewerDataForAdmin,
  fetchLanguage,
  getLanguageStats,
  UploadError,
  storeDataInSnowflake,
  validateFiles,
  storeDocumentsEnhanced,
  getDocuments,
  storeQAEntries,
  Qaentries,
  fetchProjectData,
  changePassword,
  getQuestions,
  getAllQuestions,
  getQuestionById,
  updateQAEntry,
  insertQuestionData,
  addprojects,
  fetchLanguage,
  checkChecksumInSnowflake,
};
