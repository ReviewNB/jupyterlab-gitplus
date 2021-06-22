import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Dialog, showDialog, showErrorMessage } from '@jupyterlab/apputils';
import { IEditorTracker } from '@jupyterlab/fileeditor';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';
import { get_json_request_payload_from_file_list } from './utility';
import {
  get_modified_repositories,
  create_pull_request,
  create_and_push_commit,
  get_server_config
} from './api_client';
import {
  CheckBoxes,
  DropDown,
  CommitPRMessageDialog,
  CommitMessageDialog,
  PRCreated,
  CommitPushed,
  SpinnerDialog
} from './ui_elements';

/**
 * The plugin registration information.
 */
const gitPlusPlugin: JupyterFrontEndPlugin<void> = {
  activate,
  requires: [IMainMenu, IEditorTracker, INotebookTracker],
  id: '@reviewnb/gitplus',
  autoStart: true
};

/**
 * Activate the extension.
 */
function activate(
  app: JupyterFrontEnd,
  mainMenu: IMainMenu,
  editorTracker: IEditorTracker,
  notebookTracker: INotebookTracker
) {
  console.log(
    'JupyterLab extension @reviewnb/gitplus (0.1.5) is activated!'
  );
  const createPRCommand = 'create-pr';
  app.commands.addCommand(createPRCommand, {
    label: 'Create Pull Request',
    execute: () => {
      get_server_config()
        .then(config => {
          const files = get_open_files(
            editorTracker,
            notebookTracker,
            config['server_root_dir']
          );
          const data = get_json_request_payload_from_file_list(files);
          get_modified_repositories(
            data,
            show_repository_selection_dialog,
            createPRCommand,
            show_repository_selection_failure_dialog
          );
        })
        .catch(error => {
          show_repository_selection_failure_dialog();
          console.log(error);
        });
    }
  });

  const pushCommitCommand = 'push-commit';
  app.commands.addCommand(pushCommitCommand, {
    label: 'Push Commit',
    execute: () => {
      get_server_config()
        .then(config => {
          const files = get_open_files(
            editorTracker,
            notebookTracker,
            config['server_root_dir']
          );
          const data = get_json_request_payload_from_file_list(files);
          get_modified_repositories(
            data,
            show_repository_selection_dialog,
            pushCommitCommand,
            show_repository_selection_failure_dialog
          );
        })
        .catch(error => {
          show_repository_selection_failure_dialog();
          console.log(error);
        });
    }
  });

  function show_repository_selection_dialog(
    repo_names: string[][],
    command: string
  ) {
    if (repo_names.length == 0) {
      let msg =
        "No GitHub repositories found! \n\nFirst, open the files that you'd like to commit or create pull request for.";
      if (command == createPRCommand) {
        msg =
          "No GitHub repositories found! \n\nFirst, open the files that you'd like to create pull request for.";
      } else if (command == pushCommitCommand) {
        msg =
          "No GitHub repositories found! \n\nFirst, open the files that you'd like to commit.";
      }
      showDialog({
        title: 'Repository Selection',
        body: msg,
        buttons: [Dialog.okButton({ label: 'Okay' })]
      }).then(result => { });
    } else {
      const label_style = {
        'font-size': '14px'
      };
      const body_style = {
        'padding-top': '2em',
        'padding-bottom': '2em',
        'border-top': '1px solid #dfe2e5'
      };
      const select_style = {
        'margin-top': '4px',
        'min-height': '32px'
      };
      const styles = {
        label_style: label_style,
        body_style: body_style,
        select_style: select_style
      };
      const dwidget = new DropDown(repo_names, 'Select Repository', styles);
      showDialog({
        title: 'Repository Selection',
        body: dwidget,
        buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Next' })]
      }).then(result => {
        if (!result.button.accept) {
          return;
        }
        const repo_name = dwidget.getTo();
        show_file_selection_dialog(repo_name, command);
      });
    }
  }

  function show_file_selection_dialog(repo_path: string, command: string) {
    get_server_config()
      .then(config => {
        const files = get_open_files(
          editorTracker,
          notebookTracker,
          config['server_root_dir']
        );
        const relevant_files: string[] = [];

        for (const f of files) {
          if (f.startsWith(repo_path)) {
            relevant_files.push(f.substring(repo_path.length + 1));
          }
        }

        const cwidget = new CheckBoxes(relevant_files);
        showDialog({
          title: 'Select Files',
          body: cwidget,
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Next' })]
        }).then(result => {
          if (!result.button.accept) {
            return;
          }
          const files = cwidget.getSelected();

          if (command == createPRCommand) {
            show_commit_pr_message_dialog(repo_path, files);
          } else if (command == pushCommitCommand) {
            show_commit_message_dialog(repo_path, files);
          }
        });
      })
      .catch(error => {
        show_file_selection_failure_dialog();
        console.log(error);
      });
  }

  function show_commit_message_dialog(repo_path: string, files: string[]) {
    console.log(`${repo_path} --show_commit_message_dialog-- ${files}`);
    const cmwidget = new CommitMessageDialog();

    showDialog({
      title: 'Provide Details',
      body: cmwidget,
      buttons: [
        Dialog.cancelButton(),
        Dialog.okButton({ label: 'Create & Push Commit' })
      ]
    }).then(result => {
      if (!result.button.accept) {
        return;
      }
      const commit_message = cmwidget.getCommitMessage();
      const body = {
        files: files,
        repo_path: repo_path,
        commit_message: commit_message
      };
      create_and_push_commit(body, show_commit_pushed_dialog);
    });
  }

  function show_commit_pr_message_dialog(repo_path: string, files: string[]) {
    console.log(`${repo_path} --show_commit_pr_message_dialog-- ${files}`);
    const cprwidget = new CommitPRMessageDialog();

    showDialog({
      title: 'Provide Details',
      body: cprwidget,
      buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Create PR' })]
    }).then(result => {
      if (!result.button.accept) {
        return;
      }
      const commit_message = cprwidget.getCommitMessage();
      const pr_title = cprwidget.getPRTitle();
      const body = {
        files: files,
        repo_path: repo_path,
        commit_message: commit_message,
        pr_title: pr_title
      };
      create_pull_request(body, show_pr_created_dialog);
    });
  }

  function show_pr_created_dialog(github_url = '', reviewnb_url = '') {
    if (github_url.length == 0 || reviewnb_url.length == 0) {
      showDialog({
        title: 'Failure',
        body: "Failed to create pull request. Check Jupyter logs for error. \n\nMake sure you've correctly setup GitHub access token. Steps here - https://github.com/ReviewNB/jupyterlab-gitplus/blob/master/README.md#setup-github-token\n\nIf unable to resolve, open an issue here - https://github.com/ReviewNB/jupyterlab-gitplus/issues",
        buttons: [Dialog.okButton({ label: 'Okay' })]
      }).then(result => { });
    } else {
      const prcwidget = new PRCreated(github_url, reviewnb_url);

      showDialog({
        title: 'Pull Request Created',
        body: prcwidget,
        buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Okay' })]
      }).then(result => { });
    }
  }

  function show_commit_pushed_dialog(github_url = '', reviewnb_url = '') {
    if (github_url.length == 0 || reviewnb_url.length == 0) {
      showDialog({
        title: 'Failure',
        body: 'Failed to create/push commit. Check Jupyter logs for error. \n\nIf unable to resolve, open an issue here - https://github.com/ReviewNB/jupyterlab-gitplus/issues',
        buttons: [Dialog.okButton({ label: 'Okay' })]
      }).then(result => { });
    } else {
      const prcwidget = new CommitPushed(github_url, reviewnb_url);

      showDialog({
        title: 'Commit pushed!',
        body: prcwidget,
        buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Okay' })]
      }).then(result => {
        if (!result.button.accept) {
          return;
        }
      });
    }
  }
  // Create new top level menu
  const menu = new Menu({ commands: app.commands });
  menu.title.label = 'Git-Plus';
  mainMenu.addMenu(menu, { rank: 40 });

  // Add commands to menu
  menu.addItem({
    command: createPRCommand,
    args: {}
  });
  menu.addItem({
    command: pushCommitCommand,
    args: {}
  });
}

export function show_repository_selection_failure_dialog() {
  showErrorMessage(
    'Failure',
    'Failed to fetch list of repositories. Have you installed & enabled server side of the extension? \n\nSee installation steps here - https://github.com/ReviewNB/jupyterlab-gitplus/blob/master/README.md#install\n\nIf unable to resolve, open an issue here - https://github.com/ReviewNB/jupyterlab-gitplus/issues'
  );
}

export function show_file_selection_failure_dialog() {
  showErrorMessage(
    'Failure',
    'Failed to fetch list of modified files. Have you installed & enabled server side of the extension? \n\nSee installation steps here - https://github.com/ReviewNB/jupyterlab-gitplus/blob/master/README.md#install\n\nIf unable to resolve, open an issue here - https://github.com/ReviewNB/jupyterlab-gitplus/issues'
  );
}

export function show_spinner() {
  const spinWidget = new SpinnerDialog();
  showDialog({
    title: 'Waiting for response...',
    body: spinWidget,
    buttons: [Dialog.cancelButton()]
  }).then(result => { });
}

function get_open_files(
  editorTracker: IEditorTracker,
  notebookTracker: INotebookTracker,
  base_dir: string
) {
  const result: string[] = [];
  let separator = '/';
  if (base_dir.includes('\\')) {
    separator = '\\';
  }

  notebookTracker.forEach(notebook => {
    result.push(base_dir + separator + notebook.context.path);
  });
  editorTracker.forEach(editor => {
    result.push(base_dir + separator + editor.context.path);
  });

  return result;
}

export default gitPlusPlugin;
