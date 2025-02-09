require("dotenv").config();
const { storeDocuments, storeDataInSnowflake } = require("./common_function");
const connection = require("./connection");

let project_id = process.env.PROJECT_ID;
let projectSchemaName = process.env.PROJECTSCHEMANAME;
let USERSCHEMANAME = process.env.USERSCHEMANAME;

const connectPromise = new Promise((resolve, reject) => {
  connection.connect((err, conn) => {
    if (err) {
      console.error("Unable to connect: " + err.message);
      reject(err);
    } else {
      console.log("Successfully connected to Snowflake.");
      resolve(conn);
    }
  });
});

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

const insertData = async (data) => {
  //   console.log("server", data);
  for (const record of data) {
    // console.log(record);

    const query = `INSERT INTO ${USERSCHEMANAME}.user_data (email, task, timestamp) VALUES (?, ?, ?)`;

    // const query = `UPDATE ${USERSCHEMANAME}.user_data SET task = ? WHERE email = ?`;

    const values = [record[1], record[0]];
    try {
      await runQuery(query, values);
      console.log(`Successfully updated task for email: ${record[0]}`);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }
};

const fetchAssignedData = async (req) => {
  const projectRoute = req.query.projectRoute;
  console.log("req.query", req.query);
  if (projectRoute === undefined) {
    console.log("projectRoute is undefined");
  } else {
    console.log("projectRouteinAssignedData", projectRoute);
  }

  // Validate projectRoute and set tableName accordingly

  const query = `WITH QA_VERDICT_counts AS (
    SELECT
        t.UPDATED_BY_MAIL,
        COUNT(CASE WHEN TRIM(t.QA_VERDICT) IN ('rejected', 'bad', 'Bad') THEN 1 END) AS rejected_count,
        COUNT(CASE WHEN TRIM(t.QA_VERDICT) IN ('approve', 'approved', 'accepted', 'good','Good') THEN 1 END) AS approved_count,
        COUNT(CASE WHEN TRIM(t.QA_VERDICT) = 'batch_rewrite' THEN 1 END) AS batch_rewrite_count,
        COUNT(CASE WHEN TRIM(t.QA_VERDICT) IS NULL OR t.QA_VERDICT = '' THEN 1 END) AS pending_check,
        COUNT(CASE WHEN t.TOTAL_ANNOTATIONS = 0 THEN 1 END) AS pending_to_complete,
        COUNT(*) AS total_tasks_done,
        MAX(t.CREATED_AT) AS latest_created_at -- Capture the latest creation date for QUALIFY
    FROM PROJECT.${projectRoute} t
    GROUP BY t.UPDATED_BY_MAIL
),
ASSIGNED_TASK_COUNTS AS (
    SELECT 
        u.USER_EMAIL,
        COUNT(*) AS total_tasks_assigned
    FROM 
        PROJECT.${projectRoute} s
    LEFT JOIN 
        USERS.USER_DATA u 
    ON 
        s.ASSIGNED_TO = u.USER_ID
    WHERE 
        s.ASSIGNED_TO IS NOT NULL
    GROUP BY 
        u.USER_EMAIL
)
SELECT
    u.USER_ID,
    q.UPDATED_BY_MAIL,
    u.LOCATION,
    u.ROLE,
    u.skillsets,
    q.rejected_count,
    q.approved_count,
    q.batch_rewrite_count,
    q.pending_check,
    q.pending_to_complete,
    a.total_tasks_assigned,
    q.total_tasks_done,
    ROUND((q.rejected_count / NULLIF(q.approved_count + q.rejected_count, 0)) * 100, 2) AS rejected_percentage,
    ROUND((q.approved_count / NULLIF(q.approved_count + q.rejected_count, 0)) * 100, 2) AS approved_percentage,
    ROUND((q.pending_check / NULLIF(a.total_tasks_assigned, 0)) * 100, 2) AS pending_percentage
FROM QA_VERDICT_counts q
LEFT JOIN USERS.USER_DATA u
    ON q.UPDATED_BY_MAIL = u.USER_EMAIL
LEFT JOIN ASSIGNED_TASK_COUNTS a
    ON q.UPDATED_BY_MAIL = a.USER_EMAIL
QUALIFY ROW_NUMBER() OVER (PARTITION BY q.UPDATED_BY_MAIL ORDER BY q.latest_created_at DESC) = 1
ORDER BY a.total_tasks_assigned DESC`;

  try {
    const data = await runQuery(query);
    return data;
  } catch (error) {
    console.error("Error fetching assigned data: ", error);
    throw error; // Throw the error to propagate it further if needed
  }
};

const fetchGetAssignTaskCount = async (req) => {
  const task_id = req.query.task_id;
  const projectRoute = req.query.projectRoute;
  console.log("req.query", req.query);
  const tableName = `PROJECT.${projectRoute}`;
  const query = `SELECT COUNT(*) AS total_tasks_assigned FROM ${tableName} WHERE ASSIGNED_TO = ?`;
};

const getTasksSummary = async () => {
  const tables = [
    "PROJECT_P_PAIRWISE_EVALUATION_LONG_SLA",
    "PROJECT_P_CODING_EVALUATION",
    "PROJECT_P_SCRATCHPAD_TASKS",
  ];

  try {
    let results = [];

    for (const table of tables) {
      const query = `
        SELECT 
          '${table}' AS table_name, 
          COUNT(*) AS total_tasks,
          COUNT(CASE WHEN TOTAL_ANNOTATIONS > 0 THEN 1 END) AS completed_tasks
        FROM INNO_MGT_DEV.USERS.${table};
      `;

      const result = await runQuery(query);
      results.push(result[0]);
    }

    return results;
  } catch (error) {
    console.error("Error fetching task summary: ", error);
    throw error;
  }
};

const constructQuery = async (table_name, userEmail) => {
  try {
    // Fetch languages from the database
    const languages = await fetchLanguage(table_name);

    // Constructing the SQL query dynamically
    let sql = `
            SELECT 
            (SELECT COUNT(*) FROM ${projectSchemaName}.${table_name}) AS total_annotations, `;
    if (userEmail !== undefined && userEmail !== null) {
      sql += `(SELECT COUNT(*) FROM ${projectSchemaName}.${table_name} where updated_by = '${userEmail}') AS total_annotations_by_user, `;
    }

    // Adding COUNT(CASE WHEN language = '...' THEN 1 END) for each language dynamically
    languages.forEach((language, index) => {
      if (index !== 0) {
        sql += ", "; // Add comma before each count except the first one
      }
      // Replace special characters in language names for column aliases
      const columnName = language.LANGUAGE.replace(/[^a-zA-Z0-9_]/g, "_");
      sql += `COUNT(CASE WHEN language = '${language.LANGUAGE}' THEN 1 END) AS ${columnName}_count`;
    });

    // Adding counts for status columns
    sql += `,
            COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted_count,
            COUNT(CASE WHEN status = 'rewrite' THEN 1 END) AS rewrite_count,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected_count
            FROM ${projectSchemaName}.${table_name}
            WHERE`;

    if (userEmail !== undefined && userEmail !== null) {
      sql += ` updated_by = '${userEmail}' AND `;
    }

    sql += `
            (language IN (${languages
              .map((lang) => `'${lang.LANGUAGE}'`)
              .join(", ")}) 
            OR status IN ('accepted', 'rewrite', 'rejected'));
        `;

    // Running the constructed query
    const result = await runQuery(sql);
    return result;
  } catch (error) {
    console.error("Error executing SQL:", error);
    throw error; // Throw the error to propagate it further if needed
  }
};

const getProjectDetails = (table_name, userEmail) => {
  try {
    return constructQuery(table_name, userEmail);
  } catch (error) {
    console.error("Error executing SQL:", error);
    throw error; // Throw the error to propagate it further if needed
  }
};

// get Annotation Tasks For Developer
const getAnnotationTasksForDev = async (userEmail) => {
  try {
    // Query to fetch Annotations present in the table
    const queryLanguages = `select * from ${USERSCHEMANAME}.user_task where USER_EMAIL = '${userEmail}' and (status != 'Completed' and status != 'Done' or status = 'Rewrite');`;

    let user_tasks = await runQuery(queryLanguages);

    // Extract user_tasks from result rows
    return user_tasks;
  } catch (error) {
    console.error("Error executing SQL:", error);
    throw error; // Throw the error to propagate it further if needed
  }
};

const getAnnotationTasksForRev = async (userEmail) => {
  try {
    // Query to fetch Annotations present in the table
    const queryLanguages = `with reviewer as (
            select UPDATED_BY_ID from ${USERSCHEMANAME}.user_data where User_MAIL = '${userEmail}'
        )
        select t.task_id, t.UPDATED_BY_MAIL, t.LANGUAGE, t.project, t.status, t.COMMENT_BY_DEVELOPER, t.COMMENT_BY_REVIEWER, t.UPDATED_AT
        from ${USERSCHEMANAME}.user_task t, reviewer r
        where t.rev_id = r.UPDATED_BY_ID and t.status = 'Completed'`;

    let user_tasks = await runQuery(queryLanguages);

    // Extract user_tasks from result rows
    return user_tasks;
  } catch (error) {
    console.error("Error executing SQL:", error);
    throw error;
  }
};

const getAllReviewer = async () => {
  try {
    // Query to fetch Annotations present in the table
    const queryLanguages = `select UPDATED_BY_ID, UPDATED_BY_MAIL, location, skillsets from ${USERSCHEMANAME}.user_data where role = 'Reviewer';`;

    let user_details = await runQuery(queryLanguages);
    // Extract user_tasks from result rows
    return user_details;
  } catch (error) {
    console.error("Error executing SQL:", error);
    throw error;
  }
};

const getUserDetails = async (userEmail) => {
  console.log("useremail", userEmail);
  try {
    // Query to fetch Annotations present in the table
    const queryLanguages = `select id, USER_EMAIL as email, role, rev_id, password from ${USERSCHEMANAME}.user_data where USER_EMAIL = '${userEmail}'`;

    let user_details = await runQuery(queryLanguages);
    // Extract user_tasks from result rows
    return user_details[0];
  } catch (error) {
    console.error("Error executing SQL:", error);
    throw error;
  }
};

const updateAnnotationTasks = async (payload) => {
  try {
    let queryLanguages = `UPDATE PROJECT.USER_TASK SET STATUS = '${payload.status}',`;

    if (payload.comment) {
      if (payload.role === "Developer")
        queryLanguages += `COMMENT_BY_DEVELOPER = '${payload.comment}', `;
      else if (payload.role === "Reviewer")
        queryLanguages += `COMMENT_BY_REVIEWER = '${payload.comment}', `;
    }

    if (payload.role === "Reviewer" && payload.status === "Done")
      queryLanguages += `COMPLETED_AT = CURRENT_TIMESTAMP, `;

    queryLanguages += ` UPDATED_AT = CURRENT_TIMESTAMP where TASK_ID = '${payload.taskid}';`;

    let result = await runQuery(queryLanguages);
    return result[0];
  } catch (error) {
    throw error;
  }
};

const getDeveloperData = async (email, projectRoute) => {
  console.log("projectRouteuserAnnotation", projectRoute);
  try {
    // Query to fetch All the developer under particular reviewer
    const queryLanguages = `with reviewer as (
                select id from ${USERSCHEMANAME}.user_data where UPDATED_BY_MAIL = '${email}'
            )
            select UPDATED_BY_MAIL
            from ${USERSCHEMANAME}.${projectRoute}d, reviewer r
            where d.rev_id = r.id;`;

    let result = await runQuery(queryLanguages);
    return result;
  } catch (error) {
    throw error;
  }
};

const getDeveloperDataForAdmin = async () => {
  try {
    // Query to fetch All the developer
    const queryLanguages = `select USER_ID, USER_EMAIL,LOCATION,SKILLSETS from ${USERSCHEMANAME}.USER_DATA where ROLE = 'Developer'`;

    let result = await runQuery(queryLanguages);
    return result;
  } catch (error) {
    throw error;
  }
};

const getProjectData = async () => {
  try {
    // Query to fetch All the projecs data
    const queryLanguages = `select project_route ,project_title, finished_task_number,project_id, task_number,is_active from METADATA.PROJECT_ROUTE where is_TOLOKA = TRUE;`;

    let result = await runQuery(queryLanguages);

    return result;
  } catch (error) {
    throw error;
  }
};

const updatePassword = async (username, password) => {
  try {
    // Query to update user password
    const query = `update ${USERSCHEMANAME}.user_data set password = '${password}' where UPDATED_BY_MAIL = '${username}'`;

    let result = await runQuery(query);
    return result;
  } catch (error) {
    throw error;
  }
};

const changeRole = async (memberEmail, role) => {
  try {
    const query = `update USERS.user_data set role='${role}' where UPDATED_BY_MAIL='${memberEmail}'`;
    let result = await runQuery(query);
    return result;
  } catch (error) {
    throw error;
  }
};

const insertAnnouncement = async (msg, time) => {
  try {
    console.log("msg:", msg);
    console.log("time:", time);

    const query = `
      INSERT INTO DOMAIN_MANAGEMENT.ANNOUNCEMENT (MESSAGE, TIME)
      VALUES (?, ?)
    `;

    let result = await runQuery(query, [msg, time]);
    return result;
  } catch (error) {
    throw error;
  }
};

const getAnnouncement = async () => {
  try {
    const query = `select * from domain_management.announcement`;

    let result = await runQuery(query);
    return result;
  } catch (error) {
    throw error;
  }
};
const AssignTasksLogs = async (fromDate, toDate) => {
  
  try {
    let query = `
      SELECT assigntimestamp, total_task_assign, assign_id, tasks
      FROM ANNOTATION.ASSIGNS_LOG
      WHERE 1=1
    `;

    // Add date filters if provided
    if (fromDate) {
      query += ` AND DATE(assigntimestamp) >= DATE('${fromDate}')`;
    }
    if (toDate) {
      query += ` AND DATE(assigntimestamp) <= DATE('${toDate}')`;
    }

    query += ` ORDER BY assigntimestamp DESC`;

    let result = await runQuery(query);
    return result;
  } catch (error) {
    throw error;
  }
};
const getLocationStats = async () => {
  try {
    const query = `SELECT LOCATION,
    SUM(PENDING) AS PENDING,
    SUM(REJECTED) AS REJECTED,
    SUM(APPROVED) AS APPROVED,
    SUM(TOTAL) AS TOTAL
    FROM USERS.USER_DATA
    GROUP BY LOCATION;`;

    let result = await runQuery(query);
    return result;
  } catch (error) {
    throw error;
  }
};
const putAssignTasks = async (
  value,
  { USER_EMAIL: email, USER_ID: userid },
  eachTasks,
  language,
  project_id
) => {
  try {
    let tasksArray = JSON.parse(eachTasks);

    let tasksStr = null;
    if (tasksArray !== null) {
      // Convert array to proper SQL array string with proper quoting
      tasksStr = tasksArray.map((task) => `${task}`).join(",");
    }
    // const istTimestamp = moment()
    //   .tz("Asia/Kolkata")
    //   .format("YYYY-MM-DD HH:mm:ss");
    // Use proper string concatenation for Snowflake ARRAY_CONSTRUCT
    const query = `
      INSERT INTO ANNOTATION.ASSIGNS_LOG 
        (assigntimestamp, total_task_assign, assign_id, tasks, project_id) 
      SELECT 
        current_timestamp,
        ${value}, 
        '${email}', 
        ${
          tasksArray !== null
            ? `ARRAY_CONSTRUCT(${tasksStr})`
            : "ARRAY_CONSTRUCT(null)"
        }, 
        ${project_id};
    `;

    let result = await runQuery(query);
    console.log("result", result);

    if (value !== 0 && tasksArray !== null && tasksArray[0] !== null) {
      let userTaskQuery = `
        INSERT INTO USERS.USER_TASK 
          (TASK_ID, USER_EMAIL, USER_ID, STATUS, LANGUAGE, COMPLETED_AT, CREATED_AT, UPDATED_AT, PROJECT, BATCH_ID, TOTAL_ANNOTATIONS, REV_ID, COMMENT_BY_DEVELOPER, COMMENT_BY_REVIEWER) 
        VALUES 
          ${tasksArray
            .map(
              (task) =>
                `('${task}', '${email}', '${userid}', 'Not Started', '${language}', NULL, current_timestamp, current_timestamp, ${project_id}, NULL, NULL, NULL, NULL, NULL)`
            )
            .join(", ")};
      `;

      result = await runQuery(userTaskQuery);
      console.log("resultresult", result);
    }

    return result;
  } catch (error) {
    console.error(`Error in putAssignTasks for ${email}:`, error);
    throw error;
  }
};

// const putAssignTasks = async (
//   value,
//   { USER_EMAIL: email, USER_ID: userid },
//   tasks,
//   language,
//   project_id
// ) => {
//   console.log("Destructured email:", email, "userid:", userid);
//   try {
//     // Validate and parse tasks
//     let tasksArray = [];
//     try {
//       tasksArray = JSON.parse(tasks);
//     } catch (error) {
//       console.error("Invalid JSON in tasks:", tasks);
//       throw new Error("Invalid tasks format");
//     }

//     console.log("project_id:", project_id);
//     console.log("value:", value);
//     console.log("email:", email);
//     console.log("tasksArray:", tasksArray);

//     // Join tasks array into a comma-separated string for query
//     let tasksStr = tasksArray.length ? tasksArray.join(", ") : null;

//     // Prepare the first query
//     const query = `
//       INSERT INTO ANNOTATION.ASSIGNS_LOG
//       (assigntimestamp, total_task_assign, assign_id, tasks, PROJECT_ID)
//       SELECT current_timestamp, ?, ?, ARRAY_CONSTRUCT(?), ?;
//     `;

//     console.log("First query parameters:", [
//       String(value),
//       String(email),
//       tasksStr || "",
//       String(project_id),
//     ]);

//     // Run the first query to insert into ANNOTATION.ASSIGNS_LOG
//     let result = await runQuery(query, [
//       String(value),
//       String(email),
//       tasksStr || "",
//       String(project_id),
//     ]);
//     console.log("First query result:", result);

//     // If value is not 0, proceed with inserting tasks into USERS.USER_TASK
//     if (value !== 0) {
//       // Base query for user tasks
//       let userTaskQuery = `
//         INSERT INTO USERS.USER_TASK
//         (TASK_ID, USER_EMAIL, USER_ID, STATUS, LANGUAGE,
//         COMPLETED_AT, CREATED_AT, UPDATED_AT, PROJECT, BATCH_ID,
//         TOTAL_ANNOTATIONS, REV_ID, COMMENT_BY_DEVELOPER, COMMENT_BY_REVIEWER)
//         VALUES
//       `;

//       // Prepare values for all tasks
//       const taskValues = tasksArray.map((task) => [
//         task,
//         email,
//         userid,
//         "Not Started",
//         language,
//         null,
//         "current_timestamp",
//         "current_timestamp",
//         project_id,
//         null,
//         null,
//         null,
//         null,
//         null,
//       ]);

//       // Flatten taskValues and insert them in batches
//       const placeholders = taskValues
//         .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
//         .join(", ");

//       userTaskQuery += placeholders;

//       // Flatten the taskValues array
//       const queryParams = taskValues.flat();

//       console.log("Second query parameters:", queryParams);

//       // Run the second query to insert into USERS.USER_TASK
//       result = await runQuery(userTaskQuery, queryParams);
//       console.log("Second query result:", result);
//     }

//     return result;
//   } catch (error) {
//     console.error("Error:", error);
//     throw error;
//   }
// };

const getUserStatistics = async (req, res) => {
  const projectRoute = req.query.projectRoute;

  if (projectRoute === undefined) {
    console.log("projectRoute is undefined");
  } else {
    console.log("projectRoute", projectRoute);
  }

  // Validate projectRoute and set tableName accordingly

  try {
    const query = `
      SELECT 
    UPDATED_BY_MAIL,
    COUNT(CASE WHEN TRIM(t.QA_VERDICT) IN ('approved', 'accepted', 'good') THEN 1 END) AS APPROVED_COUNT, 
    COUNT(CASE WHEN TRIM(t.QA_VERDICT) IN ('rejected', 'bad') THEN 1 END) AS REJECTED_COUNT, 
    COUNT(CASE WHEN TRIM(t.QA_VERDICT) = 'batch_rewrite' THEN 1 END) AS BATCH_REWRITE_COUNT,
    COUNT(CASE WHEN QA_VERDICT IS NULL OR TRIM(STATUS) = '' THEN 1 END) AS EMPTY_STATUS_COUNT,
    COUNT(*) AS TOTAL_COUNT
FROM 
    ${USERSCHEMANAME}.${projectRoute}
GROUP BY 
    UPDATED_BY_MAIL
ORDER BY 
    UPDATED_BY_MAIL`;

    let result = await runQuery(query);
    res.json(result);
  } catch (error) {
    console.error("Error fetching user statistics:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getStatisticsCount = async (req, res) => {
  const projectRoute = req.query.projectRoute;

  let projectName = "";

  // Validate projectRoute and set tableName accordingly

  try {
    const query = `SELECT 
    COUNT(CASE WHEN TRIM(t.QA_VERDICT) IN ('rejected', 'bad') THEN 1 END) AS rejected_count,
    COUNT(CASE WHEN TRIM(t.QA_VERDICT) IN ('approved', 'accepted', 'good','approve') THEN 1 END) AS approved_count,
    COUNT(CASE WHEN TRIM(t.QA_VERDICT) = 'batch_rewrite' THEN 1 END) AS batch_rewrite_count,
    COUNT(CASE WHEN TRIM(t.QA_VERDICT) IS NULL OR t.QA_VERDICT = '' THEN 1 END) AS pending_check,
    COUNT(CASE WHEN t.TOTAL_ANNOTATIONS = 0 THEN 1 END) AS pending_to_complete,
    COUNT(*) AS total_tasks
FROM PROJECT.${projectRoute} t`;

    let result = await runQuery(query);
    // console.log("fetching all user statistics: ", result);
    res.json(result);
    console.log(result);
  } catch (error) {
    console.error("Error fetching zero annotations:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const GetLanguage = async () => {
  try {
    // Query to fetch all the developer tasks
    const Languages = await fetch(
      "https://notlabel-studio.toloka-test.ai/api/tasks?page=1&page_size=10000000&view=12654&project=1033"
    );

    let result = await Languages.json(); // Parsing the JSON response

    return result;
  } catch (error) {
    throw error;
  }
};

const assignReviewer = async (payload) => {
  try {
    // Query to fetch Annotations present in the table
    let queryLanguages = `UPDATE Users.USER_TASK SET REV_ID = '${payload.rev_id}', where UPDATED_BY_MAIL in ['']`;

    queryLanguages += `COMPLETED_AT = CURRENT_TIMESTAMP, `;

    queryLanguages += ` UPDATED_AT = CURRENT_TIMESTAMP where TASK_ID = '${payload.taskid}';`;

    let result = await runQuery(queryLanguages);
    return result[0];
  } catch (error) {
    throw error;
  }
};

const assignReviewerTasks = async (reviewers, maxTasksPerReviewer = 40) => {
  try {
    for (let reviewer of reviewers) {
      const { UPDATED_BY_MAIL: reviewerEmail, DEVELOPER: developerEmail } =
        reviewer; // Added developer email

      // Fetch the reviewer data to get the rev_id
      const fetchReviewerQuery = `
        SELECT user_id
        FROM USERS.USER_DATA
        WHERE user_email = '${reviewerEmail}'
      `;
      let reviewerData = await runQuery(fetchReviewerQuery);
      let revId = reviewerData[0]?.USER_ID; // Use optional chaining to prevent errors

      if (!revId) {
        console.log(`No rev_id found for reviewer: ${reviewerEmail}`);
        continue; // Skip if no rev_id is found
      }

      // Fetch the pending tasks for the current developer
      const pendingTasksQuery = `
        WITH TotalTasks AS (
          SELECT task_id, UPDATED_BY_MAIL, status, language, completed_at, created_at, total_annotations, rev_id, comment_by_developer, comment_by_reviewer,
                ROW_NUMBER() OVER (ORDER BY completed_at DESC) as row_num
          FROM PROJECT.USER_TASK
          WHERE UPDATED_BY_MAIL = '${developerEmail}' -- Use developer's email
            AND status = 'in-progress'
            AND (rev_id IS NULL OR rev_id = '') -- Only fetch tasks that are unassigned
        ),
        TaskCount AS (
          SELECT COUNT(*) as total_count,
                CEIL(COUNT(*) * 0.25) AS quarter_tasks
          FROM TotalTasks
        )
        SELECT T.task_id, T.UPDATED_BY_MAIL, T.status, T.language, T.completed_at
        FROM TotalTasks T
        JOIN TaskCount TC ON T.row_num <= TC.quarter_tasks
        ORDER BY T.completed_at DESC;
      `;

      let pendingTasks = await runQuery(pendingTasksQuery);
      let taskIndex = 0;
      let assignedTasks = 0;

      // Iterate through the pending tasks and assign them to the reviewer
      while (
        assignedTasks < maxTasksPerReviewer &&
        taskIndex < pendingTasks.length
      ) {
        const task = pendingTasks[taskIndex];

        // Update the rev_id for the task
        const assignReviewerQuery = `
          UPDATE PROJECT.USER_TASK
          SET rev_id = '${revId}' -- Assign reviewer's rev_id
          WHERE task_id = '${task.TASK_ID}'
        `;

        await runQuery(assignReviewerQuery);

        taskIndex++;
        assignedTasks++;
      }

      console.log(
        `Assigned ${assignedTasks} tasks to reviewer: ${reviewerEmail}`
      );

      if (taskIndex >= pendingTasks.length) {
        break;
      }
    }

    console.log("Task assignment to reviewers completed successfully!");
  } catch (error) {
    console.error("Error during task assignment: ", error.message); // Improved error handling
  }
};

const handleDocumentStorage = async (files, formData) => {
  try {
    // Store documents in S3 and get URLs
    const documentUrls = await storeDocuments(files, formData);

    // Store data in Snowflake
    const result = await storeDataInSnowflake(formData, documentUrls);

    return result;
  } catch (error) {
    console.error("Error in document storage process:", error);
    throw error;
  }
};

const getNextProjectSequence = async (project_name) => {
  try {
    const query = `
      SELECT COALESCE(MAX(
        TO_NUMBER(REGEXP_REPLACE(PROJECT_T_SEQ, '^[A-Z]+-', ''))
      ), 0) + 1 as next_seq
      FROM PROJECT_MGT.TASKS
      WHERE PROJECT_NAME = ?
    `;
    const result = await runQuery(query, [project_name]);
    return result[0]?.NEXT_SEQ || 1; // Ensure we return 1 as default if null/undefined
  } catch (error) {
    console.error("Error getting next project sequence:", error);
    throw error;
  }
};

const createTrackerTasks = async (
  user_mail,
  task_name,
  task_status,
  start_date,
  end_date,
  project_name,
  create_date_time
) => {
  try {
    // Get the next sequence number
    const nextSeq = await getNextProjectSequence(project_name);

    // Create project prefix (first 3 letters uppercase)
    const prefix = project_name.substring(0, 3).toUpperCase();

    // Generate PROJECT_T_SEQ
    const project_t_seq = `${prefix}-${nextSeq}`;

    // Get project_id from the PROJECT table
    const projectQuery = `
      SELECT PROJECT_ID 
      FROM PROJECT_MGT.PROJECT 
      WHERE PROJECT_NAME = ?
    `;
    const projectResult = await runQuery(projectQuery, [project_name]);
    const project_id = projectResult[0]?.PROJECT_ID;

    if (!project_id) {
      throw new Error(`Project not found: ${project_name}`);
    }
    const query = `
      INSERT INTO PROJECT_MGT.TASKS (
        USER_EMAIL,
        TASK_NAME,
        TASK_STATUS,
        START_DATE,
        END_DATE,
        PROJECT_NAME,
        PROJECT_ID,
        CREATE_DATE_TIME,
        PROJECT_T_SEQ
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    let result = await runQuery(query, [
      user_mail,
      task_name,
      task_status,
      start_date,
      end_date,
      project_name,
      project_id,
      create_date_time,
      project_t_seq,
    ]);
    return {
      success: true,
      task_id: result.insertId,
      project_id: project_id,
      project_t_seq: project_t_seq,
      result: result,
    };
  } catch (error) {
    console.error("Error in creating tracker for tasks:", error);
    throw error;
  }
};

const deleteTask = async (taskId) => {
  try {
    const deleteQuery = `
      DELETE FROM PROJECT_MGT.TASKS 
      WHERE TASK_ID = ?`;
    
    const params = [taskId];

    await runQuery(deleteQuery, params); // Run the delete query

    return { message: `Task with ID ${taskId} deleted successfully` };
  } catch (error) {
    console.error("Error in deleting task:", error);
    throw error;
  }
};

const createProjectTracker = async (project_name, team_lead) => {
  try {
    const query = `
      INSERT INTO PROJECT_MGT.PROJECT(project_name, team_lead)
      VALUES (?, ?)
    `;
    let result = await runQuery(query, [project_name, team_lead]);
    return result;
  } catch (error) {
    console.error("Error in creating project for tracker:", error);
    throw error;
  }
};

const getTasks = async () => {
  try {
    const query = `select TASK_ID,USER_EMAIL,TASK_NAME,TASK_STATUS,START_DATE,END_DATE,PROJECT_NAME,CREATE_DATE_TIME,PROJECT_T_SEQ from PROJECT_MGT.TASKS`;
    let result = await runQuery(query);
    return result;
  } catch (error) {
    console.error("Error in creating project for tracker:", error);
    throw error;
  }
};

// Database update function
const updateTaskStatus = async (taskId, taskStatus) => {
  try {
    const updateQuery = `
      UPDATE PROJECT_MGT.TASKS 
      SET TASK_STATUS = ? 
      WHERE TASK_ID = ?`;

    const params = [taskStatus, taskId];

    //console.log("Executing update query with params:", params);
    await runQuery(updateQuery, params); // Run the update query

    // Fetch the updated row
    const selectQuery = `
      SELECT * FROM PROJECT_MGT.TASKS 
      WHERE TASK_ID = ?`;

    const result = await runQuery(selectQuery, [taskId]);

    //console.log("Updated Task:", result);
    return result;
  } catch (error) {
    console.error("Error in updating task status:", error);
    throw error;
  }
};

const getCompleted1Tasks = async () => {
  try {
    const query = `select TASK_ID,USER_EMAIL,TASK_NAME,TASK_STATUS,START_DATE,END_DATE,PROJECT_NAME,CREATE_DATE_TIME,PROJECT_T_SEQ from PROJECT_MGT.TASKS WHERE TASK_STATUS='Completed_1' `;
    let result = await runQuery(query);
    return result;
  } catch (error) {
    console.error("Error in creating project for tracker:", error);
    throw error;
  }
};

const getProjectsTracker = async () => {
  try {
    const query = `select PROJECT_NAME,TEAM_LEAD from PROJECT_MGT.PROJECT`;
    let result = await runQuery(query);
    return result;
  } catch (error) {
    console.error("Error in getting project list for tracker:", error);
    throw error;
  }
};

const updateTrackerTask = async (
  task_id,
  user_mail,
  task_name,
  task_status,
  start_date,
  end_date,
  project_name
) => {
  try {
    const missingFields = [];
    if (!task_id) missingFields.push("task_id");
    if (!user_mail) missingFields.push("user_mail");
    if (!task_name) missingFields.push("task_name");
    if (!task_status) missingFields.push("task_status");
    if (!start_date) missingFields.push("start_date");
    if (!end_date) missingFields.push("end_date");
    if (!project_name) missingFields.push("project_name");

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    const query = `
      UPDATE PROJECT_MGT.TASKS
      SET
        USER_EMAIL = ?, 
        TASK_NAME = ?, 
        TASK_STATUS = ?, 
        START_DATE = ?, 
        END_DATE = ?, 
        PROJECT_NAME = ?
      WHERE TASK_ID = ?
    `;
    
    const result = await runQuery(query, [
      task_id,
      user_mail,
      task_name,
      task_status,
      start_date,
      end_date,
      project_name,
    ]);
    if (result.affectedRows === 0) {
      throw new Error(
        "No task found with the provided task_id or no changes were made."
      );
    }
    return result;
  } catch (error) {
    console.error("Error in updating tracker task:", error.message || error);
    console.error(error.stack);
    throw error;
  }
};

const getCourseTrainings = async () => {
  try {
    const query = `select TRAINING_ID,TRAINING_NAME from project_mgt.trainings;
`;
    let result = await runQuery(query);
    return result;
  } catch (error) {
    console.error("Error in getting course trainings data", error);
    throw error;
  }
};

const assignTraining = async (user_email, training_id, status) => {
  try {
    const trainingQuery = `
      SELECT TRAINING_ID, TRAINING_NAME 
      FROM PROJECT_MGT.TRAININGS 
      WHERE TRAINING_ID = ?
    `;
    const trainingResult = await runQuery(trainingQuery, [training_id]);

    if (!trainingResult || trainingResult.length === 0) {
      throw new Error(`Training not found with ID: ${training_id}`);
    }

    const existingAssignmentQuery = `
      SELECT ASSIGNED_ID 
      FROM PROJECT_MGT.TRAINING_ASSIGNED 
      WHERE USER_EMAIL = ? AND TRAINING_ID = ?
    `;
    const existingAssignment = await runQuery(existingAssignmentQuery, [
      user_email,
      training_id,
    ]);

    if (existingAssignment && existingAssignment.length > 0) {
      throw new Error(
        `User ${user_email} is already assigned to this training`
      );
    }

    const insertQuery = `
      INSERT INTO DB_INNO_PROD.PROJECT_MGT.TRAINING_ASSIGNED (
        USER_EMAIL,
        TRAINING_ID,
        STATUS
      )
      VALUES (?, ?, ?)
    `;

    let result = await runQuery(insertQuery, [user_email, training_id, status]);

    return {
      success: true,
      assigned_id: result.insertId,
      training_id: training_id,
      training_name: trainingResult[0].TRAINING_NAME,
      result: result,
    };
  } catch (error) {
    console.error("Error in assigning training:", error);
    throw error;
  }
};

module.exports = {
  putAssignTasks,
  getProjectDetails,
  getAnnotationTasksForDev,
  getUserDetails,
  updateAnnotationTasks,
  getDeveloperData,
  getAnnotationTasksForRev,
  getDeveloperDataForAdmin,
  runQuery,
  GetLanguage,
  insertData,
  fetchAssignedData,
  getUserStatistics,
  getStatisticsCount,
  getAllReviewer,
  handleDocumentStorage,
  getProjectData,
  updatePassword,
  insertAnnouncement,
  getAnnouncement,
  changeRole,
  getLocationStats,
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
};
