const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

function typeToAnnotationLevel(type) {
  switch (type) {
    case "info":
      return "notice";
    case "error":
    default:
      return "failure";
  }
}

async function run() {
  const maxErrors = parseInt(
    core.getInput("max-errors", { required: true }),
    10
  );

  // Initialize the octokit library
  const githubToken = core.getInput("github-token", { required: true });
  const octokit = new github.GitHub(githubToken);

  const regex = /^(?<file>[^:]+):(?<line>\d+):(?<column>\d+): (?<type>\w+): (?<message>.*)\s+\[(?<error_code>[a-z\-]+)\]$/;
  const annotations = [];

  function parseLine(line) {
    const match = line.match(regex);

    // Skip lines that do not match
    if (match === null) {
      console.log("Unable to parse line:", line);
      return;
    }

    annotations.push({
      path: match.groups.file,
      start_line: parseInt(match.groups.line, 10),
      end_line: parseInt(match.groups.line, 10),
      start_column: parseInt(match.groups.column, 10),
      end_column: parseInt(match.groups.column, 10),
      annotation_level: typeToAnnotationLevel(match.groups.type),
      message: match.groups.message
    });
  }

  const options = {
    listeners: {
      stdline: parseLine
    },
    ignoreReturnCode: true,
    silent: true
  };

  const mypyArgs = [
    "--show-column-numbers",
    "--show-error-codes",
    "--hide-error-context",
    "--no-error-summary",
    "."
  ];

  await exec.exec("mypy", mypyArgs, options);

  // Count the number of failures
  const numErrors = annotations.reduce(
    (sum, a) => (a.annotation_level === "failure" ? sum + 1 : sum),
    0
  );

  const updateResult = await octokit.checks.create({
    ...github.context.repo,
    name: "MyPy",
    head_sha: github.context.sha,
    completed_at: new Date().toISOString(),
    conclusion: numErrors > maxErrors ? "failure" : "success",
    output: {
      title: "MyPy",
      summary: "",
      annotations: annotations
    }
  });
}

run();
