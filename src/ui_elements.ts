import { Widget } from '@lumino/widgets';

export class PRCreated extends Widget {
    constructor(
        github_url: string,
        reviewnb_url: string) {

        const body = document.createElement("div");
        const basic = document.createElement("div");
        body.appendChild(basic);
        basic.appendChild(Private.buildLabel("Pull Request on GitHub: "));
        basic.appendChild(Private.buildAnchor(github_url, github_url));
        basic.appendChild(Private.buildLabel("Pull Request on ReviewNB: "));
        basic.appendChild(Private.buildAnchor(reviewnb_url, reviewnb_url));
        super({ node: body });
    }
}

export class DropDown extends Widget {
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

export class CheckBoxes extends Widget {
    constructor(items: string[] = []) {
        const basic = document.createElement("div");

        for (const item of items) {
            basic.appendChild(Private.buildCheckbox(item));
        }
        super({ node: basic });
    }


    public getSelected(): string[] {
        let result: string[] = [];
        let inputs = this.node.getElementsByTagName("input");

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
        const style = {
            "marginTop": "3px",
            "display": "block",
            "marginBottom": "15px",
            "minWidth": "30em"
        }

        const body = document.createElement("div");
        const basic = document.createElement("div");
        body.appendChild(basic);
        basic.appendChild(Private.buildLabel("Commit message: "));
        basic.appendChild(Private.buildTextarea("Enter your commit message", "gitplus-commit-message", style));
        basic.appendChild(Private.buildLabel("PR title: "));
        basic.appendChild(Private.buildTextarea("Enter title for pull request", "gitplus-pr-message", style));
        super({ node: body });
    }

    public getCommitMessage(): string {
        let textareas = this.node.getElementsByTagName("textarea");
        for (const textarea of textareas) {
            if (textarea.id == 'gitplus-commit-message') {
                return textarea.value;
            }
        }
    }

    public getPRTitle(): string {
        let textareas = this.node.getElementsByTagName("textarea");
        for (const textarea of textareas) {
            if (textarea.id == 'gitplus-pr-message') {
                return textarea.value;
            }
        }
    }
}


namespace Private {
    const default_none = document.createElement("option");
    default_none.selected = false;
    default_none.disabled = true;
    default_none.hidden = false;
    default_none.style.display = "none";
    default_none.value = "";

    export function buildLabel(text: string): HTMLLabelElement {
        const label = document.createElement("label");
        label.textContent = text;
        return label;
    }

    export function buildAnchor(url: string, text: string): HTMLAnchorElement {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.text = text;
        return anchor;
    }

    export function buildCheckbox(text: string): HTMLSpanElement {
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

    export function buildTextarea(text: string, id: string, style: {} = {}): HTMLTextAreaElement {
        let area = document.createElement("textarea");
        area.placeholder = text;
        area.id = id;
        apply_style(area, style)
        return area;
    }

    export function buildSelect(list: string[][], _class = "", def?: string): HTMLSelectElement {
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

    function apply_style(element: HTMLElement, style: {}) {
        if ("marginTop" in style) {
            element.style.marginTop = style["marginTop"];
        }
        if ("marginBottom" in style) {
            element.style.marginBottom = style["marginBottom"];
        }
        if ("display" in style) {
            element.style.display = style["display"];
        }
        if ("minWidth" in style) {
            element.style.minWidth = style["minWidth"];
        }
        return element;
    }
}