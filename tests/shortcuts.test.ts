import { describe, it, expect } from "vitest";
import {
  normalizeKeyCombo,
  parseKeyboardEventToCombo,
  isFormFieldOrEditable,
  validateShortcutRemap,
  resolveActiveShortcut,
} from "../src/core/shortcuts";


describe("A11Y-308: Keyboard shortcuts engine", () => {
  describe("normalizeKeyCombo", () => {
    it("normalizes and standardizes modifier ordering", () => {
      expect(normalizeKeyCombo("alt+shift+k")).toBe("Alt+Shift+K");
      expect(normalizeKeyCombo("shift+alt+a")).toBe("Alt+Shift+A");
      expect(normalizeKeyCombo("control+alt+r")).toBe("Ctrl+Alt+R");
      expect(normalizeKeyCombo("cmd+shift+m")).toBe("Shift+Meta+M");
      expect(normalizeKeyCombo("escape")).toBe("Escape");
    });

    it("handles empty or malformed strings gracefully", () => {
      expect(normalizeKeyCombo("")).toBe("");
      expect(normalizeKeyCombo("   ")).toBe("");
    });
  });

  describe("parseKeyboardEventToCombo", () => {
    it("parses KeyboardEvent with modifiers into standard combination", () => {
      const event = new KeyboardEvent("keydown", {
        key: "a",
        altKey: true,
      });
      expect(parseKeyboardEventToCombo(event)).toBe("Alt+A");
    });

    it("parses complex modifier combinations with shift and alt", () => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        altKey: true,
        shiftKey: true,
      });
      expect(parseKeyboardEventToCombo(event)).toBe("Alt+Shift+K");
    });

    it("does not duplicate modifier keys when modifier itself is pressed", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Alt",
        altKey: true,
      });
      expect(parseKeyboardEventToCombo(event)).toBe("Alt");
    });
  });

  describe("isFormFieldOrEditable", () => {
    it("identifies input, textarea, select, and contenteditable", () => {
      const input = document.createElement("input");
      const textarea = document.createElement("textarea");
      const select = document.createElement("select");
      const divEditable = document.createElement("div");
      divEditable.contentEditable = "true";

      expect(isFormFieldOrEditable(input)).toBe(true);
      expect(isFormFieldOrEditable(textarea)).toBe(true);
      expect(isFormFieldOrEditable(select)).toBe(true);
      expect(isFormFieldOrEditable(divEditable)).toBe(true);
    });

    it("identifies ARIA form roles", () => {
      const div = document.createElement("div");
      div.setAttribute("role", "textbox");
      expect(isFormFieldOrEditable(div)).toBe(true);

      const combobox = document.createElement("div");
      combobox.setAttribute("role", "combobox");
      expect(isFormFieldOrEditable(combobox)).toBe(true);
    });

    it("returns false for non-editable content elements", () => {
      const div = document.createElement("div");
      const p = document.createElement("p");
      const button = document.createElement("button");

      expect(isFormFieldOrEditable(div)).toBe(false);
      expect(isFormFieldOrEditable(p)).toBe(false);
      expect(isFormFieldOrEditable(button)).toBe(false);
      expect(isFormFieldOrEditable(null)).toBe(false);
    });
  });

  describe("validateShortcutRemap & collision prevention", () => {
    it("strictly rejects Ctrl+U and reserved browser shortcuts", () => {
      const ctrlU = validateShortcutRemap("toggleWidget", "Ctrl+U");
      expect(ctrlU.valid).toBe(false);
      expect(ctrlU.error).toContain("reserved browser command");

      const ctrlR = validateShortcutRemap("toggleWidget", "Ctrl+R");
      expect(ctrlR.valid).toBe(false);

      const f5 = validateShortcutRemap("toggleWidget", "F5");
      expect(f5.valid).toBe(false);

      const ctrlT = validateShortcutRemap("toggleWidget", "Ctrl+T");
      expect(ctrlT.valid).toBe(false);
    });

    it("rejects single alphanumeric keys without modifiers", () => {
      const bareKey = validateShortcutRemap("toggleWidget", "a");
      expect(bareKey.valid).toBe(false);
      expect(bareKey.error).toContain("must include a modifier key");
    });

    it("rejects empty combinations", () => {
      const empty = validateShortcutRemap("toggleWidget", "");
      expect(empty.valid).toBe(false);
      expect(empty.error).toContain("cannot be empty");
    });

    it("detects collisions with other active shortcuts", () => {
      // "Alt+A" is default for toggleWidget
      const collision = validateShortcutRemap("resetAll", "Alt+A");
      expect(collision.valid).toBe(false);
      expect(collision.error).toContain("conflicts with the shortcut");
    });

    it("allows valid non-colliding custom combination", () => {
      const valid = validateShortcutRemap("toggleWidget", "Alt+Shift+Z");
      expect(valid.valid).toBe(true);
      expect(valid.normalizedCombo).toBe("Alt+Shift+Z");
    });

    it("allows remapping to current combination for the same action", () => {
      const sameAction = validateShortcutRemap("toggleWidget", "Alt+A");
      expect(sameAction.valid).toBe(true);
    });
  });

  describe("resolveActiveShortcut", () => {
    it("returns default key when no custom overrides exist", () => {
      expect(resolveActiveShortcut("toggleWidget", {})).toBe("Alt+A");
      expect(resolveActiveShortcut("resetAll", {})).toBe("Alt+R");
      expect(resolveActiveShortcut("readingMode", {})).toBe("Alt+M");
    });

    it("returns custom override when present", () => {
      const overrides = { toggleWidget: "Alt+Shift+W" };
      expect(resolveActiveShortcut("toggleWidget", overrides)).toBe(
        "Alt+Shift+W",
      );
      expect(resolveActiveShortcut("resetAll", overrides)).toBe("Alt+R");
    });
  });
});
