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
