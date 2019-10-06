# MyPy action

Run MyPy and add

## Inputs

### `max-errors`

**Required** Max errors before reporting the check as failed

### `github-token`

**Required** The GitHub API token.

### `paths`

**Required** An optional list of paths to run mypy on

## Example usage

```yml
name: MyPy
uses: ljodal/python-actions/mypy@master
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  max-errors: 0
  paths: some_path another_path
```
