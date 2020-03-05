import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
//import { Dialog, showDialog } from "@jupyterlab/apputils";
import { IEditorTracker } from "@jupyterlab/fileeditor";
import { INotebookTracker } from "@jupyterlab/notebook";
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';

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
  console.log('JupyterLab extension @reviewnb/gitplus is activated! - v13');
  // Create new command
  const commandID = 'create-pr';
  app.commands.addCommand(commandID, {
    label: 'Create Pull Request',
    execute: () => {
      //const current = tracker.currentWidget;
      //const path = current.context.path;
      const files = get_open_files(editorTracker, notebookTracker);
      console.log(`Open files -- ${files}`);
    }
  });

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

  notebookTracker.forEach(notebook => {
    result.push(notebook.context.path);
  });
  editorTracker.forEach(editor => {
    result.push(editor.context.path);
  });
  return result;

}

export default gitPlusPlugin;
