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

## FAQ
<details> 
  <summary>Where is pull request (PR) opened in case of forked repositories?</summary>
  <p>
    
  If your repository is forked from another repository (parent) then PR will be created on parent repository. 
</p></details>

<details> 
  <summary> Which is the <tt>base</tt> branch used in a pull request? </summary>
  <p>
  
  `base` branch in a PR is a branch against which your changes are compared and ultimately merged. We use repository's default    branch (usually called `master`) as `base` branch of PR. We use parent repository's default branch as `base` in case of forked repo. 
</p></details>

<details> 
  <summary>Which is the <tt>head</tt> branch used in a pull request?</summary>
  <p>
    
  `head` branch in a PR is a branch which contains the latest changes you've made. We create a new branch (e.g. `gitplus-xyz123`) as `head` branch. It only contains changes from the files you wish to include in the PR.  
</p></details>

<details> 
  <summary>How can I edit a pull request opened with GitPlus?</summary>
  <p>

You can head over to GitHub and edit the PR metadata to your liking. For pushing additional file changes to the same PR, 
1. Copy the branch name from GitHub UI (e.g. `gitplus-xyz123`) 
2. Checkout that branch locally
3. Make the file changes you want
4. Use push commit functionality from GitPlus to push new changes
</p></details>

<details> 
  <summary>Is GitPlus tied to ReviewNB in any way?</summary>
  <p>
    
  No. GitPlus is it's own open source project. The only connection with ReviewNB is that at the end of PR/Commit creation, GitPlus shows ReviewNB URL along with GitHub URL. You can safely ignore these URLs if you don't want to use ReviewNB.
  
  It's is useful to see [visual notebook diffs](https://uploads-ssl.webflow.com/5ba4ebe021cb91ae35dbf88c/5ba93ded243329a486dab26e_sl-code%2Bimage.png) on ReviewNB instead of hard to read [JSON diffs](https://uploads-ssl.webflow.com/5ba4ebe021cb91ae35dbf88c/5c24ba833c78e57d6b8c9d09_Screenshot%202018-12-27%20at%204.43.09%20PM.png) on GitHub. [ReviewNB](https://www.reviewnb.com/) also facilitates discussion on notebooks cells.
</p></details>

<details> 
  <summary>What if I don't have a ReviewNB account?</summary>
  <p>
    
  No problem, everything in GitPlus will still work fine. Only the ReviewNB URLs won't work for you.
<p></details>


<details> 
  <summary>Can we use GitPlus with Gitlab/BitBucket or any other platforms?</summary>
  <p>
    
  No, currently we only support repositories on GitHub.
<p></details>

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

## Motivation
Our aim is to make notebooks a first class entity in Data science & ML teams. We can achieve this by making notebooks play well with existing tools & processes instead of building expensive proprietary platforms. Other projects in this direction are,

- [ReviewNB](https://www.reviewnb.com/) - Code review tool for Jupyter notebooks
- [treon](https://github.com/reviewnb/treon) - Easy to use test framework for Jupyter notebooks

## Contributing
If you see any problem, open an issue or send a pull request. You can write to support@reviewnb.com for any questions.

