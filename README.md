# GitPlus

A JupyterLab plugin for version control of Jupyter notebooks. It can,

- Create & push commits to GitHub from JupyterLab
- Create GitHub pull request from JupyterLab

## Demo

### Create GitHub Pull Request from JupyterLab

[![Create GitHub Pull Request from JupyterLab](https://github.com/ReviewNB/jupyterlab-gitplus/raw/master/images/PR_thumbnail_v2.png)](https://www.youtube.com/watch?v=yuvLgIjCq48)

### Push GitHub Commits from JupyterLab

[![Push GitHub Commits from JupyterLab](https://github.com/ReviewNB/jupyterlab-gitplus/raw/master/images/Commit_thumbnail_v1.png)](https://www.youtube.com/watch?v=bmca1EBNpvI)

## Requirements

* JupyterLab >= 2.0

## Install

```bash
pip install jupyterlab_gitplus
jupyter labextension install @reviewnb/jupyterlab_gitplus
jupyter serverextension enable --py jupyterlab_gitplus
```

### Setup GitHub token
Here's [GitHub's guide](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) to generate personal access token. Briefly speaking,

- Head over [developer settings on GitHub](https://github.com/settings/tokens). Click "Generate New Token".
- Select Repo scope. Click "Generate Token". Copy the generated token.
- Open you Jupyter config file `~/.jupyter/jupyter_notebook_config.py` & paste the token as below
```bash
c.GitPlus.github_token = '<your-github-access-token>'
```

After installation, start JupyterLab normally & you should see "Git-Plus" as a new menu item.


## Development

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment & install dependencies

# Link your development version of the extension with JupyterLab
jupyter labextension link .

# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch

# Watch the GitPlus source directory in another terminal tab
jlpm watch

# If you make any changes to server side extension (.py files) then reinstall it from source
pip install .
```
## Contributing
If you see any problem, open an issue or send a pull request. You can write to support@reviewnb.com for any questions.

