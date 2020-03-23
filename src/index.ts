import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { Dialog, showDialog } from "@jupyterlab/apputils";
import { IEditorTracker } from "@jupyterlab/fileeditor";
import { INotebookTracker } from "@jupyterlab/notebook";
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu, Widget } from '@lumino/widgets';
import { get_json_request_payload_from_file_list } from './utility';
import { get_modified_repositories } from './api_client';
import { PageConfig } from "@jupyterlab/coreutils";

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
  console.log('JupyterLab extension @reviewnb/gitplus is activated! - v34');
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

class DropDown extends Widget {
  constructor(
    options: string[][] = [],
    label: string = "") {

    const body = document.createElement("div");
    const basic = document.createElement("div");
    body.appendChild(basic);
    basic.appendChild(Private.buildLabel(label));
    basic.appendChild(Private.buildSelect(options));
    super({ node: body });
  }

  get toNode(): HTMLSelectElement {
    return this.node.getElementsByTagName("select")[0] as HTMLSelectElement;
  }

  public getTo(): string {
    return this.toNode.value;
  }
}

class CheckBoxes extends Widget {
  constructor(items: string[] = []) {
    const basic = document.createElement("div");

    for (const item of items) {
      basic.appendChild(Private.buildCheckbox(item));
    }
    super({ node: basic });
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
    function buildCheckbox(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.id = text;
    input.type = "checkbox";
    label.htmlFor = text;
    label.textContent = text;
    span.appendChild(input);
    span.appendChild(label);
    return span;
  }

  export
    function buildTextarea(text: string): HTMLTextAreaElement {
    const area = document.createElement("textarea");
    area.placeholder = text;
    area.style.marginBottom = "15px";
    return area;
  }

  export
    function buildSelect(list: string[][], _class = "", def?: string): HTMLSelectElement {
    const select = document.createElement("select");
    select.appendChild(default_none);
    for (const x of list) {
      const option = document.createElement("option");
      option.value = x[1];
      option.textContent = x[0];
      select.appendChild(option);

      if (def && x[0] === def) {
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