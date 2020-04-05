import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { Dialog, showDialog } from "@jupyterlab/apputils";
import { IEditorTracker } from "@jupyterlab/fileeditor";
import { INotebookTracker } from "@jupyterlab/notebook";
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';
import { get_json_request_payload_from_file_list } from './utility';
import { get_modified_repositories, create_pull_request, create_and_push_commit } from './api_client';
import { PageConfig } from "@jupyterlab/coreutils";
import { CheckBoxes, DropDown, CommitPRMessageDialog, CommitMessageDialog, PRCreated, CommitPushed, SpinnerDialog } from './ui_elements';

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
function activate(app: JupyterFrontEnd, mainMenu: IMainMenu, editorTracker: IEditorTracker, notebookTracker: INotebookTracker) {
  console.log('JupyterLab extension @reviewnb/gitplus is activated!');
  const createPRCommand = 'create-pr';
  app.commands.addCommand(createPRCommand, {
    label: 'Create Pull Request',
    execute: () => {
      const files = get_open_files(editorTracker, notebookTracker);
      const data = get_json_request_payload_from_file_list(files);
      get_modified_repositories(data, show_repository_selection_dialog, createPRCommand, show_repository_selection_failure_dialog);
    }
  });

  const pushCommitCommand = 'push-commit';
  app.commands.addCommand(pushCommitCommand, {
    label: 'Push Commit',
    execute: () => {
      const files = get_open_files(editorTracker, notebookTracker);
      const data = get_json_request_payload_from_file_list(files);
      get_modified_repositories(data, show_repository_selection_dialog, pushCommitCommand, show_repository_selection_failure_dialog);
    }
  });

  function show_repository_selection_failure_dialog() {
    showDialog({
      title: 'Failure',
      body: 'Failed to fetch list of repositories. Have you installed & enabled server side of the extension? Check Jupyter logs for error. \n\n If unable to resolve, open an issue here - https://github.com/ReviewNB/jupyterlab-gitplus/issues',
      buttons: [
        Dialog.okButton({ label: "Okay" })
      ]
    }).then(result => {
    });
  }

  function show_repository_selection_dialog(repo_names: string[][], command: string) {
    let label_style = {
      'font-size': '14px'
    }
    let body_style = {
      'padding-top': '2em',
      'padding-bottom': '2em',
      'border-top': '1px solid #dfe2e5'
    }
    let select_style = {
      'margin-top': '4px',
      'min-height': '32px'
    }
    let styles = {
      'label_style': label_style,
      'body_style': body_style,
      'select_style': select_style
    }
    const dwidget = new DropDown(repo_names, 'Select Repository', styles);
    showDialog({
      title: "Repository Selection",
      body: dwidget,
      buttons: [
        Dialog.cancelButton(),
        Dialog.okButton({ label: "Next" })
      ]
    }).then(result => {
      if (!result.button.accept) {
        return;
      }
      let repo_name = dwidget.getTo();
      show_file_selection_dialog(repo_name, command);
    });
  }

  function show_file_selection_dialog(repo_path: string, command: string) {
    const files = get_open_files(editorTracker, notebookTracker);
    let relevant_files: string[] = []

    for (const f of files) {
      if (f.startsWith(repo_path)) {
        relevant_files.push(f.substring(repo_path.length + 1))
      }
    }

    const cwidget = new CheckBoxes(relevant_files);
    showDialog({
      title: "Select Files",
      body: cwidget,
      buttons: [
        Dialog.cancelButton(),
        Dialog.okButton({ label: "Next" })
      ]
    }).then(result => {
      if (!result.button.accept) {
        return;
      }
      let files = cwidget.getSelected();

      if (command == createPRCommand) {
        show_commit_pr_message_dialog(repo_path, files);
      } else if (command == pushCommitCommand) {
        show_commit_message_dialog(repo_path, files);
      }
    });
  }

  function show_commit_message_dialog(repo_path: string, files: string[]) {
    console.log(`${repo_path} --show_commit_message_dialog-- ${files}`);
    const cmwidget = new CommitMessageDialog();

    showDialog({
      title: "Provide Details",
      body: cmwidget,
      buttons: [
        Dialog.cancelButton(),
        Dialog.okButton({ label: "Create & Push Commit" })
      ]
    }).then(result => {
      if (!result.button.accept) {
        return;
      }
      let commit_message = cmwidget.getCommitMessage();
      let body = {
        "files": files,
        "repo_path": repo_path,
        "commit_message": commit_message,
      }
      create_and_push_commit(body, show_commit_pushed_dialog);
    });
  }

  function show_commit_pr_message_dialog(repo_path: string, files: string[]) {
    console.log(`${repo_path} --show_commit_pr_message_dialog-- ${files}`);
    const cprwidget = new CommitPRMessageDialog();

    showDialog({
      title: "Provide Details",
      body: cprwidget,
      buttons: [
        Dialog.cancelButton(),
        Dialog.okButton({ label: "Create PR" })
      ]
    }).then(result => {
      if (!result.button.accept) {
        return;
      }
      let commit_message = cprwidget.getCommitMessage();
      let pr_title = cprwidget.getPRTitle();
      let body = {
        "files": files,
        "repo_path": repo_path,
        "commit_message": commit_message,
        "pr_title": pr_title
      }
      create_pull_request(body, show_pr_created_dialog);
    });
  }

  function show_pr_created_dialog(github_url: string = '', reviewnb_url: string = '') {
    if (github_url.length == 0 || reviewnb_url.length == 0) {
      showDialog({
        title: 'Failure',
        body: 'Failed to create pull request. Check Jupyter logs for error. \n\n If unable to resolve, open an issue here - https://github.com/ReviewNB/jupyterlab-gitplus/issues',
        buttons: [
          Dialog.okButton({ label: "Okay" })
        ]
      }).then(result => {
      });
    } else {
      const prcwidget = new PRCreated(github_url, reviewnb_url);

      showDialog({
        title: "Pull Request Created",
        body: prcwidget,
        buttons: [
          Dialog.cancelButton(),
          Dialog.okButton({ label: "Okay" })
        ]
      }).then(result => {
      });
    }
  }

  function show_commit_pushed_dialog(github_url: string = '', reviewnb_url: string = '') {
    if (github_url.length == 0 || reviewnb_url.length == 0) {
      showDialog({
        title: 'Failure',
        body: 'Failed to create/push commit. Check Jupyter logs for error. \n\n If unable to resolve, open an issue here - https://github.com/ReviewNB/jupyterlab-gitplus/issues',
        buttons: [
          Dialog.okButton({ label: "Okay" })
        ]
      }).then(result => {
      });
    } else {
      const prcwidget = new CommitPushed(github_url, reviewnb_url);

      showDialog({
        title: "Commit pushed!",
        body: prcwidget,
        buttons: [
          Dialog.cancelButton(),
          Dialog.okButton({ label: "Okay" })
        ]
      }).then(result => {
        if (!result.button.accept) {
          return;
        }
      });

    }

    // Create new top level menu
    const menu = new Menu({ commands: app.commands });
    menu.title.label = 'Git-Plus';
    mainMenu.addMenu(menu, { rank: 40 });

    // Add commands to menu
    menu.addItem({
      command: createPRCommand,
      args: {},
    });
    menu.addItem({
      command: pushCommitCommand,
      args: {},
    });
  };
}
export function show_spinner() {
  const spinWidget = new SpinnerDialog();
  showDialog({
    title: "Waiting for response...",
    body: spinWidget,
    buttons: [
      Dialog.cancelButton()
    ]
  }).then(result => {
  });
}

function get_open_files(editorTracker: IEditorTracker, notebookTracker: INotebookTracker) {
  let result: string[] = []
  let base_dir = PageConfig.getOption('serverRoot');

  notebookTracker.forEach(notebook => {
    result.push(base_dir + '/' + notebook.context.path);
  });
  editorTracker.forEach(editor => {
    result.push(base_dir + '/' + editor.context.path);
  });
  return result;

}

export default gitPlusPlugin;