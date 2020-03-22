import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { Dialog, showDialog } from "@jupyterlab/apputils";
import { IEditorTracker } from "@jupyterlab/fileeditor";
import { INotebookTracker } from "@jupyterlab/notebook";
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu, Widget } from '@lumino/widgets';
import { get_json_request_payload_from_file_list } from './utility';
import { get_modified_repositories } from './api_client';

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
  console.log('JupyterLab extension @reviewnb/gitplus is activated! - v20');
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


  function show_repository_selection_dialog(repo_names: string[]) {
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

  notebookTracker.forEach(notebook => {
    result.push(notebook.context.path);
  });
  editorTracker.forEach(editor => {
    result.push(editor.context.path);
  });
  return result;

}

export default gitPlusPlugin;

class DropDown extends Widget {
  constructor(
    options: string[] = [],
    label: string = "") {

    const body = document.createElement("div");
    const basic = document.createElement("div");
    body.appendChild(basic);
    basic.appendChild(Private.buildLabel(label));
    basic.appendChild(Private.buildSelect(options));
    super({ node: body });
  }

  get toNode(): HTMLTextAreaElement {
    return this.node.getElementsByTagName("textarea")[0] as HTMLTextAreaElement;
  }

  public getTo(): string {
    return this.toNode.value;
  }

}



namespace Private {
  const default_none = document.createElement("option");
  default_none.selected = false;
  default_none.disabled = true;
  default_none.hidden = false;
  default_none.style.display = "none";
  default_none.value = "";

  export
    function buildLabel(text: string): HTMLLabelElement {
    const label = document.createElement("label");
    label.textContent = text;
    label.id = 'id123';
    return label;
  }

  export
    function buildTextarea(text: string): HTMLTextAreaElement {
    const area = document.createElement("textarea");
    area.placeholder = text;
    area.style.marginBottom = "15px";
    return area;
  }

  export
    function buildSelect(list: string[], _class = "", def?: string): HTMLSelectElement {
    const select = document.createElement("select");
    select.appendChild(default_none);
    for (const x of list) {
      const option = document.createElement("option");
      option.value = x;
      option.textContent = x;
      select.appendChild(option);

      if (def && x === def) {
        option.selected = true;
      }

      if (_class) {
        select.classList.add(_class);
      }
    }
    select.style.marginBottom = "15px";
    select.style.minHeight = "25px";
    return select;
  }
}