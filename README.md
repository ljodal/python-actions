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

## MyPy

Run Mypy and annotate the code with any errors found. Usage:

```yml
name: Mypy
uses: ljodal/python-actions/mypy@master
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  max-errors: 0
```
