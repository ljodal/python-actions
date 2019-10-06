const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const path = require("path");

async function run() {
  // Initialize the octokit library
  const githubToken = core.getInput("github-token", { required: true });
  const octokit = new github.GitHub(githubToken);

  const regex = /^would reformat (?<file>.*)$/i;
  const annotations = [];

  function parseLine(line) {
    const match = line.match(regex);

    // Skip lines that do not match
    if (match === null) {
      console.log("Unable to parse line:", line);
      return;
    }

    annotations.push({
      path: path.relative(".", match.groups.file),
      start_line: 0,
      end_line: 0,
      annotation_level: "failure",
      message: "File is incorrectly formatted, please run Black"
    });
  }

  const options = {
    listeners: {
      errline: parseLine
    },
    ignoreReturnCode: true,
    // silent: true
  };

  const result = await exec.exec("black", ["--check", "."], options);

  const updateResult = await octokit.checks.create({
    ...github.context.repo,
    name: "Black",
    head_sha: github.context.sha,
    completed_at: new Date().toISOString(),
    conclusion: result !== 0 ? "failure" : "success",
    output: {
      title: "Black",
      summary:
        result !== 0 ? `${annotations.length} files incorrectly formatted` : "",
      annotations: annotations
    }
  });

  console.log('Project result:', updateResult);
}

run();
