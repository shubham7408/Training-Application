const {
  updateEnvironmentVariables,
  validateProjectStructure,
} = require("./config/environment");

validateProjectStructure();
updateEnvironmentVariables();
