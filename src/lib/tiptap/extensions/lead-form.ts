import { Node, mergeAttributes } from "@tiptap/core";

export type LeadFormAlignment = "left" | "center" | "right";

export interface LeadFormAttrs {
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  buttonTextColor: string;
  backgroundColor: string;
  borderColor: string;
  showLocation: boolean;
  successMessage: string;
  align: LeadFormAlignment;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    leadForm: {
      insertLeadForm: (attrs?: Partial<LeadFormAttrs>) => ReturnType;
      updateLeadForm: (attrs: Partial<LeadFormAttrs>) => ReturnType;
    };
  }
}

export const DEFAULT_LEAD_FORM_ATTRS: LeadFormAttrs = {
  title: "Join the waitlist",
  description: "Enter your details and we'll be in touch shortly.",
  buttonText: "Sign Up",
  buttonColor: "#111827",
  buttonTextColor: "#ffffff",
  backgroundColor: "#ffffff",
  borderColor: "#e5e7eb",
  showLocation: false,
  successMessage: "Thank you! Your details have been received.",
  align: "center",
};

// Attribute spec: every field reads from / writes to a data-* attribute so the
// node round-trips through HTML (paste / generateHTML) as well as JSON.
function attrSpec() {
  const spec: Record<string, any> = {};
  (Object.keys(DEFAULT_LEAD_FORM_ATTRS) as (keyof LeadFormAttrs)[]).forEach((key) => {
    const def = DEFAULT_LEAD_FORM_ATTRS[key];
    const dataKey = `data-${key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`;
    spec[key] = {
      default: def,
      parseHTML: (el: HTMLElement) => {
        const raw = el.getAttribute(dataKey);
        if (raw == null) return def;
        if (typeof def === "boolean") return raw === "true";
        return raw;
      },
      renderHTML: (attrs: Record<string, any>) => ({ [dataKey]: String(attrs[key]) }),
    };
  });
  return spec;
}

export const LeadForm = Node.create({
  name: "leadForm",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return attrSpec();
  },

  parseHTML() {
    return [{ tag: "div[data-lead-form]" }];
  },

  addCommands() {
    return {
      insertLeadForm:
        (attrs?: Partial<LeadFormAttrs>) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: this.name, attrs: { ...DEFAULT_LEAD_FORM_ATTRS, ...attrs } })
            .run(),
      updateLeadForm:
        (attrs: Partial<LeadFormAttrs>) =>
        ({ commands }) => commands.updateAttributes(this.name, attrs),
    };
  },

  renderHTML({ node }) {
    const a = { ...DEFAULT_LEAD_FORM_ATTRS, ...(node.attrs as Partial<LeadFormAttrs>) };

    const inputStyle =
      // font-size:16px prevents iOS Safari from auto-zooming the field on focus.
      "display:block;width:100%;box-sizing:border-box;height:44px;padding:0 14px;margin-bottom:12px;border:1px solid #d1d5db;border-radius:10px;font-size:16px;outline:none;background:#fff;color:#111827";
    const formStyle = [
      "display:inline-block",
      "text-align:left",
      "width:100%",
      "max-width:440px",
      `background:${a.backgroundColor}`,
      `border:1px solid ${a.borderColor}`,
      "border-radius:16px",
      "padding:24px",
      "box-shadow:0 10px 30px rgba(0,0,0,0.06)",
    ].join(";");

    const children: any[] = [];
    if (a.title) {
      children.push(["h3", { style: "font-size:1.25rem;font-weight:700;margin:0 0 6px;color:#111827" }, a.title]);
    }
    if (a.description) {
      children.push(["p", { style: "font-size:0.875rem;color:#6b7280;margin:0 0 16px" }, a.description]);
    }
    children.push(["input", { name: "firstName", "data-field": "firstName", type: "text", placeholder: "Your name", required: "required", style: inputStyle }]);
    children.push(["input", { name: "email", "data-field": "email", type: "email", placeholder: "Email address", required: "required", style: inputStyle }]);
    children.push(["input", { name: "whatsapp", "data-field": "whatsapp", type: "tel", placeholder: "Mobile number", required: "required", style: inputStyle }]);
    if (a.showLocation) {
      children.push(["input", { name: "location", "data-field": "location", type: "text", placeholder: "Location (City, Country)", style: inputStyle }]);
    }
    children.push([
      "button",
      {
        type: "submit",
        "data-lead-form-submit": "",
        style: `display:block;width:100%;height:46px;border:none;border-radius:10px;background:${a.buttonColor};color:${a.buttonTextColor};font-weight:600;font-size:0.95rem;cursor:pointer`,
      },
      a.buttonText || "Sign Up",
    ]);
    children.push(["div", { "data-lead-form-message": "", style: "display:none;margin-top:12px;padding:10px 12px;border-radius:10px;font-size:0.875rem" }]);

    return [
      "div",
      mergeAttributes({ "data-lead-form": "", "data-success": a.successMessage, style: `text-align:${a.align};margin:2rem 0` }),
      ["form", { style: formStyle }, ...children],
    ];
  },
});
