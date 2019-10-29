# GitHub Actions for Python projects

This repository contains a few GitHub actions that could be useful for Python projects.

## Pyflakes

Run Pyflakes and annotate the code with any errors found. Usage:

```yml
name: Pyflakes
uses: ljodal/python-actions/pyflakes@master
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  max-errors: 0
```

## Mypy

Run Mypy and annotate the code with any errors found. Usage:

```yml
name: Mypy
uses: ljodal/python-actions/mypy@master
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  max-errors: 0
```

## Black

Run Black and annotate the code with any errors found. Usage:

```yml
name: Black
uses: ljodal/python-actions/black@master
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
```


## Missing __init__.py check

Check for any directories containing a .py file, but no \_\_init\_\_.py file

```yml
name: Missing __init__.py check
uses: ljodal/python-actions/check-for-missing-init@feature/check-for-missing-init
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  paths: .
```
