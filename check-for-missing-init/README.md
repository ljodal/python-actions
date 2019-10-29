# Missing \_\_init\_\_.py check action

Check for directories containing \*.py files, but no \_\_init\_\_.py files

## Inputs

### `github-token`

**Required** The GitHub API token.

### `paths`

**Required** A space separated list of directories to check

## Example usage

```yml
name: Missing __init__.py check
uses: ljodal/python-actions/check-for-missing-init@feature/check-for-missing-init
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  paths: .
```
