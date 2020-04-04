# GitPlus

Create GitHub pull requests & push commits directly from JupyterLab.

## Demo

### Create GitHub Pull Request from JupyterLab

[![Create GitHub Pull Request from JupyterLab](https://github.com/ReviewNB/jupyterlab-gitplus/raw/master/images/PR_thumbnail_v2.png)](https://www.youtube.com/watch?v=yuvLgIjCq48)

## Requirements

* JupyterLab >= 2.0

## Install

```bash
jupyter labextension install @reviewnb/gitplus
```

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Move to @reviewnb/gitplus directory
# Install dependencies
jlpm
# Build Typescript source
jlpm build
# Link your development version of the extension with JupyterLab
jupyter labextension link .
# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

### Uninstall

```bash
jupyter labextension uninstall @reviewnb/gitplus
```

