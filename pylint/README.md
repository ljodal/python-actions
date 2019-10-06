# Pylint action

Run Pylint and add annotations for any warnings

## Inputs

### `max-errors`

**Required** Max errors before reporting the check as failed

### `github-token`

**Required** The GitHub API token.

### `paths`

**Required** Paths to lint

## Example usage

```yml
name: Pylint
uses: ljodal/python-actions/pylint@master
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  max-errors: 0
  paths: some_path some_other_path
```
