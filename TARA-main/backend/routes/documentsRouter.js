const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const {
  storeDocuments,
  storeDataInSnowflake,
  validateFiles,
  storeDocumentsEnhanced,
  getDocuments,
  getQuestions,
  storeQAEntries,
  Qaentries,
  updateQAEntry,
  insertQuestionData,
  checkChecksumInSnowflake,
} = require("../services/common_function");
const router = express.Router();
const {
  getAllQuestions,
  getQuestionById,
} = require("../services/common_function");
const { log } = require("winston");

// Configure multer storage
const storage = multer.memoryStorage();

// Error messages
const ERROR_MESSAGES = {
  NO_FILES: "At least one file is required for upload",
  INVALID_FILE_TYPE:
    "Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX files are allowed.",
  FILE_SIZE_LIMIT: "File size cannot exceed 5MB",
  MISSING_FIELDS: (fields) => `Missing required fields: ${fields.join(", ")}`,
  INVALID_NUMBER: (field) => `${field} must be a number`,
};

// File configuration
const FILE_CONFIG = {
  allowedTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  maxSize: 5 * 1024 * 1024, // 5MB
  maxCount: 5,
};

// Configure multer upload with improved error handling
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!FILE_CONFIG.allowedTypes.includes(file.mimetype)) {
      return cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: FILE_CONFIG.maxSize,
  },
}).array("documentUpload", FILE_CONFIG.maxCount);

// Middleware to handle multer upload
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: ERROR_MESSAGES.FILE_SIZE_LIMIT });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Validate request body middleware with improved error handling
const validateRequestBody = (req, res, next) => {
  const requiredFields = ["domain", "projectName"];
  const numericFields = ["numImages", "numResults"];

  // Check for required fields
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: ERROR_MESSAGES.MISSING_FIELDS(missingFields),
    });
  }

  // Validate numeric fields if present
  for (const field of numericFields) {
    if (req.body[field] && isNaN(Number(req.body[field]))) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_NUMBER(field),
      });
    }
  }

  next();
};

// Middleware to validate files are present
const validateFilesPresence = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: ERROR_MESSAGES.NO_FILES });
  }
  next();
};

// Middleware to generate and verify checksums
const checksumMiddleware = async (req, res, next) => {
  try {
    // console.log('Starting checksum middleware');

    if (!req.files || req.files.length === 0) {
      // console.log('No files found in request');
      return res.status(400).json({ error: "No files provided" });
    }

    //console.log(`Processing ${req.files.length} files`);
    const fileChecksums = [];

    // Generate checksums for each file
    for (const file of req.files) {
      try {
        if (!file.buffer) {
          // console.error('File buffer is missing:', file.originalname);
          return res.status(400).json({
            error: "Invalid file data",
            details: `Missing buffer for file: ${file.originalname}`,
          });
        }

        // Create hash using Node.js crypto
        const hash = crypto.createHash("sha256");
        hash.update(file.buffer);
        const checksum = hash.digest("hex");

        // Check if checksum already exists in Snowflake
        const checksumExists = await checkChecksumInSnowflake(checksum);
        if (checksumExists) {
          // console.log(`Duplicate checksum detected: ${checksum}`);
          return res.status(409).json({
            error:
              "Duplicate file detected, Please verify or select another file.",
            message: `File '${file.originalname}' has already been uploaded.`,
          });
        }

        fileChecksums.push({
          fileName: file.originalname,
          checksum,
          fileSize: file.size,
        });

        // console.log(`Generated checksum for ${file.originalname}: ${checksum}`);
      } catch (fileError) {
        //console.error('Error processing file:', file.originalname, fileError);
        return res.status(500).json({
          error: "Error processing file",
          details: fileError.message,
          fileName: file.originalname,
        });
      }
    }

    // Continue to the next middleware if all files are processed successfully
    req.fileChecksums = fileChecksums;
    next();
  } catch (error) {
    //console.error('Error in checksum middleware:', error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Document Collection Route with improved error handling
// Update the main route with better error handling
router.post(
  "/documentcollections",
  (req, res, next) => {
    //console.log('Received request for document collection');
    next();
  },
  handleUpload,
  checksumMiddleware,
  validateRequestBody,
  validateFilesPresence,
  async (req, res) => {
    try {
      // console.log('Starting document collection process');

      // Validate the uploaded files
      const validationErrors = validateFiles(req.files);
      if (validationErrors.length > 0) {
        // console.log('File validation failed:', validationErrors);
        return res.status(400).json({
          error: "File validation failed",
          details: validationErrors,
        });
      }

      const {
        domainName,
        projectName,
        url,
        domain,
        numImages = 0,
        numResults = 0,
        licenseUrl,
        licenseName,
        Notes,
      } = req.body;

      //console.log('Uploading documents to S3');
      const documentUrls = await storeDocumentsEnhanced(
        {
          documentUpload: req.files,
        },
        domain
      );
      //console.log('Documents uploaded successfully:', documentUrls);

      // Store data in Snowflake
      //console.log('Storing data in Snowflake');
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileChecksum = req.fileChecksums.find(
          (fc) => fc.fileName === file.originalname
        );

        if (!fileChecksum) {
          throw new Error(`Checksum not found for file: ${file.originalname}`);
        }

        await storeDataInSnowflake(
          domainName,
          projectName,
          url,
          domain,
          numImages,
          numResults,
          documentUrls[i],
          licenseName,
          licenseUrl,
          Notes,
          fileChecksum.checksum
        );
        //console.log(`Stored data for file: ${file.originalname}`);
      }

      //console.log('Document collection completed successfully');
      res.status(200).json({
        success: true,
        message: "Documents collected successfully",
        data: documentUrls,
      });
    } catch (error) {
      console.error("Error in document collection:", error);
      res.status(500).json({
        error: "Error in document collection",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

// Update a specific QA entry by ID
router.put("/update-qa-entry/:id", async (req, res) => {
  const { id } = req.params;
  const {
    ORDER_OF_APPEARANCE_ON_PAGE,
    PAGE_NUMBER,
    QUESTION_TYPE,
    QUESTION,
    SHORT_ANSWER,
    LONG_ANSWER,
    TITLE,
    FILE_ID,
    TYPE,
  } = req.body;

  // console.log("Request payload:", req.body);
  // console.log("Request params:", req.params);

  if (!id || !QUESTION || !FILE_ID) {
    return res
      .status(400)
      .json({ error: "ID, QUESTION, and FILE_ID are required" });
  }

  try {
    const updated = await updateQAEntry(
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
    );

    if (updated) {
      res
        .status(200)
        .json({ success: true, message: "QA entry updated successfully" });
    } else {
      res.status(404).json({ error: "QA entry not found" });
    }
  } catch (error) {
    console.error("Error updating QA entry:", error);
    res.status(500).json({ error: "Failed to update QA entry" });
  }
});

// Fetch all IDs from CLAUDE_AI table
router.get("/claude-ai-ids", async (req, res) => {
  try {
    const ids = await getAllQuestions();
    res.status(200).json(ids);
  } catch (error) {
    console.error("Error fetching CLAUDE_AI IDs:", error);
    res.status(500).json({ error: "Failed to fetch CLAUDE_AI IDs" });
  }
});

// Fetch a specific question and options by ID
router.get("/claude-ai-question/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const questionData = await getQuestionById(id);
    if (!questionData) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json(questionData);
  } catch (error) {
    console.error("Error fetching question by ID:", error);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

// Route for submitting the question form data
router.post("/submit-question", async (req, res) => {
  try {
    const questionData = {
      question: req.body.question,
      options: req.body.options,
      correctAnswer: req.body.correctAnswer,
      //referenceText: req.body.referenceText,
      //referenceFile: null,
      wrongAnswer: req.body.wrongAnswer,
      wrongAnswerText: req.body.wrongAnswerText,
      //gptStepsFile: null,
      referencedBy: req.body.referencedBy,
      subject: req.body.subject,
      answerText: req.body.answerText,
    };

    //console.log("Data received in route:", questionData);

    const savedData = await insertQuestionData(questionData);
    res.status(200).json({
      message: "Question submitted successfully!",
      data: savedData,
    });
  } catch (error) {
    console.error("Error submitting question: ", error);
    res.status(500).json({
      message: "Error submitting question",
      error: error.message,
    });
  }
});

router.get("/allfile", getDocuments);
router.get("/getQuestions", getQuestions);

router.get("/claude-ai-ids", getAllQuestions);
router.get("/claude-ai-question/:id", getQuestionById);
router.put("/update-qa-entry/:id", updateQAEntry);
router.post("/submit-question", insertQuestionData);

router.post("/qa-entries", Qaentries);

module.exports = router;
