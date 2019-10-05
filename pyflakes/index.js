const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

async function run() {
  const maxErrors = parseInt(
    core.getInput("max-errors", { required: true }),
    10
  );

  // Initialize the octokit library
  const githubToken = core.getInput("github-token", { required: true });
  const octokit = new github.GitHub(githubToken);

  const regex = /^(?<file>.*):(?<line>\d+)(:(?<column>\d+))?: (?<message>.*)$/;
  const annotations = [];

  function parseLine(line) {
    const match = line.match(regex);

    // Skip lines that do not match
    if (match === null) {
      console.log("Unable to parse line:", line);
      return;
    }

    const column = match.groups.column ? parseInt(match.groups.column, 10) : undefined;

    annotations.push({
      path: match.groups.file,
      start_line: parseInt(match.groups.line, 10),
      end_line: parseInt(match.groups.line, 10),
      start_column: column,
      end_column: column,
      annotation_level: 'failure',
      message: match.groups.message
    });
  }

  const options = {
    listeners: {
      stdline: parseLine
    },
    ignoreReturnCode: true,
    // silent: true,
  };

  await exec.exec("pyflakes", ['.'], options);

  // Count the number of failures
  const numErrors = annotations.reduce(
    (sum, a) => (a.annotation_level === "failure" ? sum + 1 : sum),
    0
  );

  const updateResult = await octokit.checks.create({
    ...github.context.repo,
    name: "Pyflakes",
    head_sha: github.context.sha,
    completed_at: new Date().toISOString(),
    conclusion: numErrors > maxErrors ? "failure" : "success",
    output: {
      title: "Pyflakes",
      summary: "",
      annotations: annotations
    }
  });
}

run();
