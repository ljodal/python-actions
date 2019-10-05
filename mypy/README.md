# MyPy action

Run MyPy and add 

## Inputs

### `max-errors`

**Required** Max errors before reporting the check as failed

### `github-token`

**Required** The GitHub API token.

## Example usage

```yml
name: MyPy
uses: ljodal/python-actions/mypy@master
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  max-errors: 0
```
