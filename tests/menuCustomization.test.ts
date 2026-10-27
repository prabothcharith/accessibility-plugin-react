import { describe, it, expect, vi } from "vitest";
import {
  validateMenuConfig,
  getMenuConfigSignature,
  KNOWN_FEATURE_IDS,
  DEFAULT_MENU_GROUPS,
  DEFAULT_FEATURE_GROUP_MAP,
  type MenuCustomizationConfig,
} from "../src/core/menuCustomization";

describe("menuCustomization - validateMenuConfig", () => {
  it("produces standard fallback configuration for undefined or null input", () => {
    const resultUndefined = validateMenuConfig(undefined);
    expect(resultUndefined.valid).toBe(true);
    expect(resultUndefined.issues).toHaveLength(0);
    expect(resultUndefined.normalizedConfig.items).toHaveLength(
      KNOWN_FEATURE_IDS.length,
    );
    expect(resultUndefined.normalizedConfig.showReset).toBe(true);
    expect(resultUndefined.normalizedConfig.showProfiles).toBe(true);

    const resultNull = validateMenuConfig(null);
    expect(resultNull.valid).toBe(true);
    expect(resultNull.normalizedConfig.items).toHaveLength(
      KNOWN_FEATURE_IDS.length,
    );
  });

  it("diagnoses invalid non-object types without throwing an end-user crash", () => {
    const primitiveInputs = ["invalid-string", 12345, true, Symbol("test")];

    for (const input of primitiveInputs) {
      expect(() => {
        const result = validateMenuConfig(input);
        expect(result.valid).toBe(false);
        expect(
          result.issues.some((i) => i.code === "INVALID_CONFIG_TYPE"),
        ).toBe(true);
        expect(result.normalizedConfig.items).toHaveLength(
          KNOWN_FEATURE_IDS.length,
        );
      }).not.toThrow();
    }
  });

  it("preserves canonical IDs and applies custom ordering", () => {
    const config: MenuCustomizationConfig = {
      items: [
        { id: "dictionary", order: 1 },
        { id: "readAloud", order: 2 },
        { id: "contrast", order: 3 },
      ],
    };

    const result = validateMenuConfig(config);
    expect(result.valid).toBe(true);
    expect(result.normalizedConfig.items.map((i) => i.id)).toEqual([
      "dictionary",
      "readAloud",
      "contrast",
    ]);
  });

  it("diagnoses unknown feature IDs as info items without crashing", () => {
    const config: MenuCustomizationConfig = {
      items: ["fontSize", "myCustomFeature"],
    };

    const result = validateMenuConfig(config);
    expect(result.valid).toBe(true); // Warnings/info do not invalidate usability
    const unknownIssue = result.issues.find(
      (i) => i.code === "UNKNOWN_FEATURE_ID",
    );
    expect(unknownIssue).toBeDefined();
    expect(unknownIssue?.featureId).toBe("myCustomFeature");
    expect(result.normalizedConfig.items).toHaveLength(2);
    expect(result.normalizedConfig.items[1].id).toBe("myCustomFeature");
  });

  it("deduplicates duplicate feature IDs and emits a warning", () => {
    const config: MenuCustomizationConfig = {
      items: ["fontSize", "contrast", "fontSize"],
    };

    const result = validateMenuConfig(config);
    expect(result.valid).toBe(true); // Usable configuration is preserved
    const duplicateIssue = result.issues.find(
      (i) => i.code === "DUPLICATE_FEATURE_ID",
    );
    expect(duplicateIssue).toBeDefined();
    expect(duplicateIssue?.featureId).toBe("fontSize");
    expect(result.normalizedConfig.items).toHaveLength(2);
  });

  it("validates suggested default values against builtins schema", () => {
    // Valid fontSize (120 is between 50 and 200)
    const validConfig: MenuCustomizationConfig = {
      items: [{ id: "fontSize", suggestedDefault: 120 }],
    };
    const validResult = validateMenuConfig(validConfig);
    expect(
      validResult.issues.filter((i) => i.code === "INVALID_DEFAULT_VALUE"),
    ).toHaveLength(0);
    expect(validResult.normalizedConfig.items[0].suggestedDefault).toBe(120);

    // Invalid fontSize (500 is > 200)
    const invalidConfig: MenuCustomizationConfig = {
      items: [{ id: "fontSize", suggestedDefault: 500 }],
    };
    const invalidResult = validateMenuConfig(invalidConfig);
    const invalidIssue = invalidResult.issues.find(
      (i) => i.code === "INVALID_DEFAULT_VALUE",
    );
    expect(invalidIssue).toBeDefined();
    expect(invalidIssue?.featureId).toBe("fontSize");
    expect(
      invalidResult.normalizedConfig.items[0].suggestedDefault,
    ).toBeUndefined();
  });

  it("warns if reset functionality is unreachable or disabled", () => {
    const configDisabledReset: MenuCustomizationConfig = {
      showReset: false,
    };
    const result = validateMenuConfig(configDisabledReset);
    expect(result.issues.some((i) => i.code === "UNREACHABLE_RESET")).toBe(
      true,
    );

    const configExplicitItemsWithoutReset: MenuCustomizationConfig = {
      items: ["fontSize", "contrast"],
    };
    const result2 = validateMenuConfig(configExplicitItemsWithoutReset);
    expect(result2.issues.some((i) => i.code === "UNREACHABLE_RESET")).toBe(
      true,
    );
  });

  it("warns if all menu features are disabled (EMPTY_MENU)", () => {
    const config: MenuCustomizationConfig = {
      items: [
        { id: "fontSize", enabled: false },
        { id: "contrast", enabled: false },
      ],
    };
    const result = validateMenuConfig(config);
    expect(result.issues.some((i) => i.code === "EMPTY_MENU")).toBe(true);
  });

  it("invokes diagnosticsCallback when provided", () => {
    const callback = vi.fn();
    const config: MenuCustomizationConfig = {
      items: ["unknownOne", "unknownTwo"],
      diagnosticsCallback: callback,
    };

    validateMenuConfig(config);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ code: "UNKNOWN_FEATURE_ID" }),
      ]),
    );
  });

  it("organizes items into groups correctly", () => {
    const config: MenuCustomizationConfig = {
      grouped: true,
      groups: [
        { id: "text", title: "Text Group", order: 1 },
        { id: "color", title: "Color Group", order: 2 },
      ],
      items: [
        { id: "fontSize", group: "text" },
        { id: "lineHeight", group: "text" },
        { id: "contrast", group: "color" },
      ],
    };

    const result = validateMenuConfig(config);
    expect(result.normalizedConfig.groups).toHaveLength(2);
    expect(result.normalizedConfig.groups[0].id).toBe("text");
    expect(result.normalizedConfig.groups[0].itemIds).toEqual([
      "fontSize",
      "lineHeight",
    ]);
    expect(result.normalizedConfig.groups[1].id).toBe("color");
    expect(result.normalizedConfig.groups[1].itemIds).toEqual(["contrast"]);
  });

  it("exposes default groups and default feature group mappings", () => {
    expect(DEFAULT_MENU_GROUPS.length).toBeGreaterThan(0);
    expect(DEFAULT_FEATURE_GROUP_MAP.fontSize).toBe("typography");
    expect(DEFAULT_FEATURE_GROUP_MAP.contrast).toBe("color");
    expect(DEFAULT_FEATURE_GROUP_MAP.dictionary).toBe("reading");
    expect(DEFAULT_FEATURE_GROUP_MAP.reduceMotion).toBe("media");
    expect(DEFAULT_FEATURE_GROUP_MAP.profiles).toBe("preferences");
  });
});

describe("menuCustomization - getMenuConfigSignature", () => {
  it("produces deterministic, stable signatures for equivalent configs", () => {
    const configA: MenuCustomizationConfig = {
      items: [
        { id: "fontSize", order: 1 },
        { id: "contrast", order: 2 },
      ],
      showReset: true,
    };

    const configB: MenuCustomizationConfig = {
      items: [
        { id: "fontSize", order: 1 },
        { id: "contrast", order: 2 },
      ],
      showReset: true,
    };

    expect(getMenuConfigSignature(configA)).toBe(
      getMenuConfigSignature(configB),
    );
  });

  it("produces different signatures when configuration changes", () => {
    const configA: MenuCustomizationConfig = {
      items: ["fontSize", "contrast"],
    };

    const configB: MenuCustomizationConfig = {
      items: ["contrast", "fontSize"],
    };

    expect(getMenuConfigSignature(configA)).not.toBe(
      getMenuConfigSignature(configB),
    );
  });
});
