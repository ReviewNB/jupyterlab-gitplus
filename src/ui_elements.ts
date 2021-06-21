import { Widget } from '@lumino/widgets';
import { Spinner } from '@jupyterlab/apputils';

export class SpinnerDialog extends Widget {
  constructor() {
    const spinner_style = {
      'margin-top': '6em'
    };
    const body = document.createElement('div');
    const basic = document.createElement('div');
    Private.apply_style(basic, spinner_style);
    body.appendChild(basic);
    const spinner = new Spinner();
    basic.appendChild(spinner.node);
    super({ node: body });
  }
}
export class PRCreated extends Widget {
  constructor(github_url: string, reviewnb_url: string) {
    const anchor_style = {
      color: '#106ba3',
      'text-decoration': 'underline'
    };

    const body = document.createElement('div');
    const basic = document.createElement('div');
    basic.classList.add('gitPlusDialogBody');
    body.appendChild(basic);
    basic.appendChild(Private.buildLabel('See pull request on GitHub: '));
    basic.appendChild(Private.buildNewline());
    basic.appendChild(
      Private.buildAnchor(github_url, github_url, anchor_style)
    );
    basic.appendChild(Private.buildNewline());
    basic.appendChild(Private.buildNewline());
    basic.appendChild(Private.buildNewline());
    basic.appendChild(Private.buildLabel('See pull request on ReviewNB: '));
    basic.appendChild(Private.buildNewline());
    basic.appendChild(
      Private.buildAnchor(reviewnb_url, reviewnb_url, anchor_style)
    );
    basic.appendChild(Private.buildNewline());
    super({ node: body });
  }
}

export class CommitPushed extends Widget {
  constructor(github_url: string, reviewnb_url: string) {
    const anchor_style = {
      color: '#106ba3',
      'text-decoration': 'underline'
    };

    const body = document.createElement('div');
    const basic = document.createElement('div');
    basic.classList.add('gitPlusDialogBody');
    body.appendChild(basic);
    basic.appendChild(Private.buildLabel('See commit on GitHub: '));
    basic.appendChild(Private.buildNewline());
    basic.appendChild(
      Private.buildAnchor(github_url, github_url, anchor_style)
    );
    basic.appendChild(Private.buildNewline());
    basic.appendChild(Private.buildNewline());
    basic.appendChild(Private.buildNewline());
    basic.appendChild(Private.buildLabel('See commit on ReviewNB: '));
    basic.appendChild(Private.buildNewline());
    basic.appendChild(
      Private.buildAnchor(reviewnb_url, reviewnb_url, anchor_style)
    );
    basic.appendChild(Private.buildNewline());
    super({ node: body });
  }
}

export class DropDown extends Widget {
  constructor(options: string[][] = [], label = '', styles: {} = {}) {
    let body_style = {};
    let label_style = {};
    let select_style = {};

    if ('body_style' in styles) {
      body_style = styles['body_style'];
    }
    if ('label_style' in styles) {
      label_style = styles['label_style'];
    }
    if ('select_style' in styles) {
      select_style = styles['select_style'];
    }

    const body = document.createElement('div');
    Private.apply_style(body, body_style);
    const basic = document.createElement('div');
    body.appendChild(basic);
    basic.appendChild(Private.buildLabel(label, label_style));
    basic.appendChild(Private.buildSelect(options, select_style));
    super({ node: body });
  }

  get toNode(): HTMLSelectElement {
    return this.node.getElementsByTagName('select')[0] as HTMLSelectElement;
  }

  public getTo(): string {
    return this.toNode.value;
  }
}

export class CheckBoxes extends Widget {
  constructor(items: string[] = []) {
    const basic = document.createElement('div');
    basic.classList.add('gitPlusDialogBody');

    for (const item of items) {
      basic.appendChild(Private.buildCheckbox(item));
    }
    super({ node: basic });
  }

  public getSelected(): string[] {
    const result: string[] = [];
    const inputs = this.node.getElementsByTagName('input');

    for (const input of inputs) {
      if (input.checked) {
        result.push(input.id);
      }
    }

    return result;
  }
}

export class CommitPRMessageDialog extends Widget {
  constructor() {
    const body = document.createElement('div');
    const basic = document.createElement('div');
    basic.classList.add('gitPlusDialogBody');
    body.appendChild(basic);
    basic.appendChild(Private.buildLabel('Commit message: '));
    basic.appendChild(
      Private.buildTextarea(
        'Enter your commit message',
        'gitplus-commit-message',
        'gitPlusMessageTextArea'
      )
    );
    basic.appendChild(Private.buildLabel('PR title: '));
    basic.appendChild(
      Private.buildTextarea(
        'Enter title for pull request',
        'gitplus-pr-message',
        'gitPlusMessageTextArea'
      )
    );
    super({ node: body });
  }

  public getCommitMessage(): string {
    const textareas = this.node.getElementsByTagName('textarea');
    for (const textarea of textareas) {
      if (textarea.id == 'gitplus-commit-message') {
        return textarea.value;
      }
    }
    return '';
  }

  public getPRTitle(): string {
    const textareas = this.node.getElementsByTagName('textarea');
    for (const textarea of textareas) {
      if (textarea.id == 'gitplus-pr-message') {
        return textarea.value;
      }
    }
    return '';
  }
}

export class CommitMessageDialog extends Widget {
  constructor() {
    const body = document.createElement('div');
    const basic = document.createElement('div');
    basic.classList.add('gitPlusDialogBody');
    body.appendChild(basic);
    basic.appendChild(Private.buildLabel('Commit message: '));
    basic.appendChild(
      Private.buildTextarea(
        'Enter your commit message',
        'gitplus-commit-message',
        'gitPlusMessageTextArea'
      )
    );
    super({ node: body });
  }

  public getCommitMessage(): string {
    const textareas = this.node.getElementsByTagName('textarea');
    for (const textarea of textareas) {
      if (textarea.id == 'gitplus-commit-message') {
        return textarea.value;
      }
    }
    return '';
  }
}

namespace Private {
  const default_none = document.createElement('option');
  default_none.selected = false;
  default_none.disabled = true;
  default_none.hidden = false;
  default_none.style.display = 'none';
  default_none.value = '';

  export function buildLabel(text: string, style: {} = {}): HTMLLabelElement {
    const label = document.createElement('label');
    label.textContent = text;
    apply_style(label, style);
    return label;
  }

  export function buildAnchor(
    url: string,
    text: string,
    style: {} = {}
  ): HTMLAnchorElement {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.text = text;
    anchor.target = '_blank';
    apply_style(anchor, style);
    return anchor;
  }

  export function buildNewline(): HTMLBRElement {
    return document.createElement('br');
  }

  export function buildCheckbox(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.classList.add('gitPlusCheckbox');
    input.id = text;
    input.type = 'checkbox';
    label.htmlFor = text;
    label.textContent = text;
    span.appendChild(input);
    span.appendChild(label);
    return span;
  }

  export function buildTextarea(
    text: string,
    id: string,
    _class: string
  ): HTMLTextAreaElement {
    const area = document.createElement('textarea');
    area.placeholder = text;
    area.id = id;
    area.classList.add(_class);
    return area;
  }

  export function buildSelect(
    list: string[][],
    style: {} = {},
    def?: string
  ): HTMLSelectElement {
    const select = document.createElement('select');
    select.appendChild(default_none);
    for (const x of list) {
      const option = document.createElement('option');
      option.value = x[1];
      option.textContent = x[0];
      select.appendChild(option);

      if (def && x[0] === def) {
        option.selected = true;
      }
    }
    apply_style(select, style);
    return select;
  }

  export function apply_style(element: HTMLElement, style: {}) {
    if ('margin-top' in style) {
      element.style.marginTop = style['margin-top'];
    }
    if ('margin-bottom' in style) {
      element.style.marginBottom = style['margin-bottom'];
    }
    if ('padding-top' in style) {
      element.style.paddingTop = style['padding-top'];
    }
    if ('padding-bottom' in style) {
      element.style.paddingBottom = style['padding-bottom'];
    }
    if ('border-top' in style) {
      element.style.borderTop = style['border-top'];
    }
    if ('display' in style) {
      element.style.display = style['display'];
    }
    if ('min-width' in style) {
      element.style.minWidth = style['min-width'];
    }
    if ('min-height' in style) {
      element.style.minHeight = style['min-height'];
    }
    if ('color' in style) {
      element.style.color = style['color'];
    }
    if ('text-decoration' in style) {
      element.style.textDecoration = style['text-decoration'];
    }
    if ('font-size' in style) {
      element.style.fontSize = style['font-size'];
    }
    return element;
  }
}
