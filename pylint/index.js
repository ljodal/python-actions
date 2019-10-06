const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

function codeToAnnotationLevel(code) {
  switch (code.substring(0, 1).toLowerCase()) {
    case "c":
    case "r":
      return "notice";
    case "w":
      return "warning";
    case "e":
    case "f":
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
  const paths = core.getInput("paths", { required: true }).split(" ");

  const regex = /^(?<file>.*):(?<line>\d+):(?<column>\d+) (?<code>\w+) (?<label>[\w-]+) (?<message>.*)$/;
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
      annotation_level: codeToAnnotationLevel(match.groups.code),
      title: `${match.groups.label} (${match.groups.code})`,
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

  const args = [
    "--msg-template",
    "{path}:{line}:{column} {msg_id} {symbol} {msg}",
    ...paths
  ];

  await exec.exec("pylint", args, options);

  // Count the number of failures
  const numErrors = annotations.reduce(
    (sum, a) => (a.annotation_level === "failure" ? sum + 1 : sum),
    0
  );

  const updateResult = await octokit.checks.create({
    ...github.context.repo,
    name: "Pylint",
    head_sha: github.context.sha,
    completed_at: new Date().toISOString(),
    conclusion: numErrors > maxErrors ? "failure" : "success",
    output: {
      title: "Pylint",
      summary: "",
      annotations: annotations
    }
  });
}

run();
