const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const path = require("path");

// The maximum number of annotations that GitHub will accept in a single requrest
const maxAnnotations = 50;

async function submitResult({ githubToken, octokit, conclusion, annotations }) {
  const output = {
    title: "flake8",
    summary: `There are ${annotations.length} pyflake warnings`
  };

  // Create the check run and the first 50 annotations
  const result = await octokit.checks.create({
    ...github.context.repo,
    name: "flake8",
    head_sha: github.context.sha,
    completed_at: new Date().toISOString(),
    conclusion: conclusion,
    output: {
      ...output,
      annotations: annotations.slice(0, maxAnnotations)
    }
  });

  // Submit additional annotations (if more then maxAnnotations)
  for (let i = 1; i < Math.ceil(annotations.length / maxAnnotations); i++) {
    await octokit.checks.update({
      ...github.context.repo,
      check_run_id: result.data.id,
      output: {
        ...output,
        annotations: annotations.slice(
          i * maxAnnotations,
          i * maxAnnotations + maxAnnotations
        )
      }
    });
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

  const ignoredFiles = (core.getInput("ignored-files") || "").split(/\s+/);
  const paths = (core.getInput("paths") || ".").split(/\s+/);

  const regex = /^(?<file>.*):(?<line>\d+)(:(?<column>\d+))?: (?<code>[A-Z]\d{3}) (?<message>.*)$/;
  const annotations = [];

  function parseLine(line) {
    const match = line.match(regex);

    // Skip lines that do not match
    if (match === null) {
      console.log("Unable to parse line:", line);
      return;
    }

    const column = match.groups.column
      ? parseInt(match.groups.column, 10)
      : undefined;

    const filePath = path.relative(".", match.groups.file);

    if (ignoredFiles.includes(filePath)) {
      return;
    }

    annotations.push({
      path: path.relative(".", match.groups.file),
      start_line: parseInt(match.groups.line, 10),
      end_line: parseInt(match.groups.line, 10),
      start_column: column,
      end_column: column,
      annotation_level: "failure",
      title: match.groups.code,
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

  await exec.exec("flake8", [...paths], options);

  // Count the number of failures
  const numErrors = annotations.reduce(
    (sum, a) => (a.annotation_level === "failure" ? sum + 1 : sum),
    0
  );

  const conclusion = numErrors > maxErrors ? "failure" : "success";
  await submitResult({ githubToken, octokit, conclusion, annotations });
}

run();
