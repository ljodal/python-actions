const fs = require("fs");
const path = require("path");

const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

/**
 * Check the given path and any sub-directories recursively for missing
 * __init__.py files. A __init__.py file is considered as missing if a
 * directory contains an *.py file, but not an __init__.py file, or if any
 * sub-directory constains a *.py file, but the current directory does not
 * contain an __init__.py file.
 *
 * Returns a list with two items, first a boolean idicating if the directory or
 * any sub-directories contains a python file, the second an array of paths that
 * are missing __init__.py files.
 */
async function checkPath(pathToCheck) {
  // List all entries in the current directory as entry-objects
  const entries = await fs.promises.readdir(pathToCheck, {
    withFileTypes: true
  });

  // Check all sub-directories
  const subDirectoryResults = await Promise.all(
    entries
      .filter(entry => entry.isDirectory())
      .map(entry => checkPath(path.join(pathToCheck, entry.name)))
  );

  // Flatten the arrays of missing __init__.py files from sub-directories
  const missingInitFiles = subDirectoryResults.reduce(
    (result, [_, missingFiles]) => [...result, ...missingFiles],
    []
  );

  // Check if this directory or any sub-directories contains a *.py file,
  // in which case the current directory should have an __init__.py file
  const containsPythonFile =
    subDirectoryResults.some(([containsPythonFile, _]) => containsPythonFile) ||
    entries.some(entry => entry.isFile() && entry.name.endsWith(".py"));

  // Check if the current directory is missing an __init__.py file
  const isMissingInitFile =
    containsPythonFile &&
    !entries.some(entry => entry.isFile() && entry.name === "__init__.py");

  // If an __init__.py file is missing, add the path to the file to the array
  // of missing files.
  if (isMissingInitFile) {
    missingInitFiles.push(path.join(pathToCheck, "__init__.py"));
  }

  return [containsPythonFile, missingInitFiles];
}

async function run() {
  // Initialize the octokit library
  const githubToken = core.getInput("github-token", { required: true });
  const octokit = new github.GitHub(githubToken);

  // Get the list of paths to check
  const pathsToCheck = core.getInput("paths", { required: true }).split(" ");

  // Check all the given paths
  const results = await Promise.all(
    pathsToCheck.map(pathToCheck => checkPath(pathToCheck))
  );

  // Flatten the list of missing files into a single array
  const missingInitFiles = results.reduce(
    (result, [_, missingInitFiles]) => [...result, ...missingInitFiles],
    []
  );

  const isMissingFiles = missingInitFiles.length > 0;

  const commandToCreate =
    "touch \\\n" + missingInitFiles.map(path => `    ${path}`).join(" \\\n");

  const summary = isMissingFiles
    ? `Some \`__init__.py\` files are missing, create them with:\n\n\`\`\`bash\n${commandToCreate}\n\`\`\``
    : "No missing `__init__.py` files";

  console.log(summary);

  const updateResult = await octokit.checks.create({
    ...github.context.repo,
    name: "Missing __init__.py check",
    head_sha: github.context.sha,
    completed_at: new Date().toISOString(),
    conclusion: isMissingFiles ? "failure" : "success",
    output: {
      title: "Missing __init.py check",
      summary: summary
    }
  });
}

run();
