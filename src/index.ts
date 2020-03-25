import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { Dialog, showDialog } from "@jupyterlab/apputils";
import { IEditorTracker } from "@jupyterlab/fileeditor";
import { INotebookTracker } from "@jupyterlab/notebook";
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';
import { get_json_request_payload_from_file_list } from './utility';
import { get_modified_repositories, create_pull_request } from './api_client';
import { PageConfig } from "@jupyterlab/coreutils";
import { CheckBoxes, DropDown, CommitPRMessageDialog, PRCreated } from './ui_elements';

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
  console.log('JupyterLab extension @reviewnb/gitplus is activated! - v38');
  // Create new command
  const commandID = 'create-pr';
  app.commands.addCommand(commandID, {
    label: 'Create Pull Request',
    execute: () => {
      const files = get_open_files(editorTracker, notebookTracker);
      console.log(`Open files -- ${files}`);
      const data = get_json_request_payload_from_file_list(files);
      get_modified_repositories(data, show_repository_selection_dialog);
    }
  });


  function show_repository_selection_dialog(repo_names: string[][]) {
    console.log(`repo_names -- ${repo_names}`);
    const dwidget = new DropDown(repo_names, "Select Repository");
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
      show_file_selection_dialog(repo_name);
    });
  }

  function show_file_selection_dialog(repo_path: string) {
    console.log(`repo_path -- ${repo_path}`);
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
      show_commit_pr_message_dialog(repo_path, files);
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

  function show_pr_created_dialog(github_url: string, reviewnb_url: string) {
    console.log(`${github_url} --show_pr_created_dialog-- ${reviewnb_url}`);
    const prcwidget = new PRCreated(github_url, reviewnb_url);

    showDialog({
      title: "Pull Request Created",
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

  // Add command to menu
  menu.addItem({
    command: commandID,
    args: {},
  });
};

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