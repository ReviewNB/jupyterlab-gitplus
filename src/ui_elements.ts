import { Widget } from '@lumino/widgets';


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
        basic.appendChild(Private.buildTextarea("Enter your commit message", style));
        basic.appendChild(Private.buildLabel("PR title: "));
        basic.appendChild(Private.buildTextarea("Enter title for pull request", style));
        super({ node: body });
    }

    get toNode(): HTMLSelectElement {
        return this.node.getElementsByTagName("select")[0] as HTMLSelectElement;
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
        function buildTextarea(text: string, style: {} = {}): HTMLTextAreaElement {
        let area = document.createElement("textarea");
        area.placeholder = text;
        apply_style(area, style)

        //area.style.marginTop = "3px";
        //area.style.display = "block";
        //area.style.marginBottom = "15px";
        //area.style.minWidth = "30em";
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