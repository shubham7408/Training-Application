const AWS = require("aws-sdk");
require("dotenv").config();

// Required environment variables
const requiredEnvVars = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_BUCKET_NAME",
];

// Validate environment variables
const validateEnvVars = () => {
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
};

// Configure AWS
AWS.config.update({
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const s3 = new AWS.S3();

// Verify S3 configuration on startup
const verifyS3Config = async () => {
  // First validate environment variables
  validateEnvVars();

  try {
    await s3.headBucket({ Bucket: AWS_BUCKET_NAME }).promise();
    console.log(`Successfully connected to S3 bucket: ${AWS_BUCKET_NAME}`);
  } catch (error) {
    if (error.code === "NotFound") {
      throw new Error(`Bucket ${AWS_BUCKET_NAME} does not exist`);
    } else if (error.code === "Forbidden") {
      throw new Error(
        `Access denied to bucket ${AWS_BUCKET_NAME}. Check your permissions.`
      );
    } else if (error.code === "CredentialsError") {
      throw new Error(
        "Invalid AWS credentials. Please check your access key and secret key."
      );
    } else {
      console.error(`Failed to connect to S3 bucket: ${error.message}`);
      throw error;
    }
  }
};

// Helper function to check if bucket exists and is accessible
const isBucketAccessible = async (bucketName) => {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  s3,
  AWS_BUCKET_NAME,
  verifyS3Config,
  isBucketAccessible,
};

