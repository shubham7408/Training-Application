const fs = require("fs");
const path = require("path");

function getDeploymentType() {
  const currentPath = process.cwd();

  const pathSegments = currentPath.split(path.sep);

  for (let i = 0; i < pathSegments.length - 2; i++) {
    if (pathSegments[i] === "projects") {
      const deployEnv = pathSegments[i + 1];
      if (deployEnv === "dev") {
        return "DEV";
      } else if (deployEnv === "prod") {
        return "PROD";
      }
    }
  }

  console.warn(
    "Warning: Could not determine environment from path. Defaulting to DEV"
  );
  return "DEV";
}

function updateEnvironmentVariables() {
  const deploymentType = getDeploymentType();
  const envPath = path.join(process.cwd(), ".env");

  try {
    let envContent = fs.readFileSync(envPath, "utf8");

    envContent = envContent.replace(
      /SNOWFLAKE_DATABASE\s*=\s*"INNO_MGT_[A-Z]+"/,
      `SNOWFLAKE_DATABASE="INNO_MGT_${deploymentType}"`
    );

    fs.writeFileSync(envPath, envContent);

    console.log(
      `Environment updated successfully for ${deploymentType} deployment`
    );
    console.log(`Current path: ${process.cwd()}`);
    console.log(`Database set to: INNO_MGT_${deploymentType}`);
  } catch (error) {
    console.error("Error updating environment variables:", error);
    console.error("Current path:", process.cwd());
    process.exit(1);
  }
}

function validateProjectStructure() {
  const currentPath = process.cwd();
  const expectedPattern = /projects\/(dev|prod)\/toloka\/backend$/;

  if (!expectedPattern.test(currentPath)) {
    console.error("Error: Not in the expected project structure.");
    console.error(
      "Expected path pattern: ~/projects/{dev|prod}/toloka/backend"
    );
    console.error("Current path:", currentPath);
    process.exit(1);
  }
}

module.exports = { updateEnvironmentVariables, validateProjectStructure };
