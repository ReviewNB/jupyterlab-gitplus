import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
//import { Dialog, showDialog } from "@jupyterlab/apputils";
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';

/**
 * The plugin registration information.
 */
const gitPlusPlugin: JupyterFrontEndPlugin<void> = {
  activate,
  requires: [IMainMenu],
  id: '@reviewnb/gitplus',
  autoStart: true
};

/**
 * Activate the extension.
 */
function activate(app: JupyterFrontEnd, mainMenu: IMainMenu) {
  console.log('JupyterLab extension @reviewnb/gitplus is activated! - v6');
  // Create new command
  const commandID = 'create-pr';
  app.commands.addCommand(commandID, {
    label: 'Create Pull Request',
    execute: () => {
      console.log(`Executed ${commandID}`);
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


export default gitPlusPlugin;
