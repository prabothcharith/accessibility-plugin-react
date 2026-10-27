"use client";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { PLACEMENT_KEY, validPlacement } from "./widgetPlacement";
import type { WidgetPlacement } from "./types";
import { validKey } from "./storage";
import { createPreferenceStore } from "./preferenceStore";
import { builtins, validValue } from "./featureSchema";
import { CustomEffect, useBuiltinEffects } from "./effects";
import type { AccessibilityPluginProps, FeatureRegistration } from "./types";

// Host-wide preferences have one owner. Fail explicitly rather than silently racing.
const owners = new WeakMap<Document, object>();
export function AccessibilityPlugin({
  children,
  position = "right",
  persistenceKey,
  persist = true,
  storage,
  locale,
  statementUrl,
  largeControls,
}: AccessibilityPluginProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [store] = useState(() =>
    createPreferenceStore(persistenceKey, persist, storage),
  );
  const features = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const setFeatures = store.update;
  const widgetPlacement = validPlacement(features[PLACEMENT_KEY])
    ? features[PLACEMENT_KEY]
    : null;
  const setWidgetPlacement = useCallback(
    (next: WidgetPlacement | null) => {
      if (next !== null && !validPlacement(next))
        throw new Error("Invalid widget placement.");
      setFeatures((previous) => {
        const copy = { ...previous };
        if (next) copy[PLACEMENT_KEY] = next;
        else delete copy[PLACEMENT_KEY];
        return copy;
      });
    },
    [setFeatures],
  );
  const registrations = useRef(new Map<string, FeatureRegistration>());
  const [definitions, setDefinitions] = useState<
    Record<string, FeatureRegistration>
  >({});
  const panelId = `arap-${useId()}`;
  const owner = useRef({});
  const [initialKey] = useState(persistenceKey);
  const [initialPersist] = useState(persist);
  if (initialKey !== persistenceKey || initialPersist !== persist)
    throw new Error(
      "Remount AccessibilityPlugin with a React key to change persistence configuration.",
    );
  const resetFns = useRef(new Map<string, () => void>());
  useEffect(() => {
    if (owners.has(document))
      throw new Error(
        "Only one AccessibilityPlugin may own a document. Mount it above your routes.",
      );
    const token = owner.current;
    owners.set(document, token);
    const flush = () => store.flush();
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      store.flush();
      if (owners.get(document) === token) owners.delete(document);
    };
  }, [store]);
  const registerFeature = useCallback(
    (key: string, definition: FeatureRegistration) => {
      if (!validKey(key) || key === PLACEMENT_KEY)
        throw new Error("Invalid feature key.");
      if (registrations.current.has(key)) return;
      // Registration must be visible to a consumer's subsequent mount effect.
      registrations.current.set(key, definition);
      setDefinitions((previous) => ({ ...previous, [key]: definition }));
    },
    [],
  );
  const getFeatureState = useCallback(
    <T,>(key: string, fallback: T): T => {
      const definition = Object.prototype.hasOwnProperty.call(definitions, key)
        ? definitions[key]
        : undefined;
      const value = features[key];
      return Object.prototype.hasOwnProperty.call(features, key) &&
        validValue(key, value, fallback, definition?.validate)
        ? (value as T)
        : fallback;
    },
    [features, definitions],
  );
  const setFeatureState = useCallback(
    <T,>(key: string, value: T) => {
      const definition = registrations.current.get(key);
      if (
        !validKey(key) ||
        !definition ||
        !validValue(key, value, definition.defaultValue, definition.validate)
      )
        throw new Error(`Invalid value or unregistered feature: ${key}`);
      setFeatures((previous) => {
        const copy: Record<string, unknown> = { ...previous, [key]: value };
        if (
          key !== "activeProfile" &&
          key !== PLACEMENT_KEY &&
          previous.activeProfile &&
          typeof previous.activeProfile === "object"
        ) {
          const profileState = previous.activeProfile as {
            profileId: string;
            baseSnapshot: Record<string, unknown>;
            overrides: Record<string, unknown>;
          };
          const targetKey =
            key === "fontSize" || key === "textScale"
              ? "fontScale"
              : key === "focusHighlight"
                ? "highlightFocus"
                : key === "linkHighlight"
                  ? "highlightLinks"
                  : key === "bigCursor"
                    ? "cursorSize"
                    : key === "readingGuide" || key === "readingMask"
                      ? "readerMode"
                      : key;
          if (
            profileState.baseSnapshot &&
            (targetKey in profileState.baseSnapshot ||
              key in profileState.baseSnapshot)
          ) {
            copy.activeProfile = {
              ...profileState,
              overrides: {
                ...profileState.overrides,
                [targetKey]: value,
                [key]: value,
              },
            };
          }
        }
        return copy;
      });
    },
    [setFeatures],
  );
  const resetAll = useCallback(() => {
    resetFns.current.forEach((fn) => fn());
    setFeatures((previous) => {
      const preserved: Record<string, unknown> = {};
      if (validPlacement(previous[PLACEMENT_KEY])) {
        preserved[PLACEMENT_KEY] = previous[PLACEMENT_KEY];
      }
      if (Array.isArray(previous.customPresets)) {
        preserved.customPresets = previous.customPresets;
      }
      return preserved;
    });
  }, [setFeatures]);
  const registerReset = useCallback((key: string, fn: () => void) => {
    resetFns.current.set(key, fn);
  }, []);
  const unregisterReset = useCallback((key: string) => {
    resetFns.current.delete(key);
  }, []);
  const toggleOpen = useCallback(() => setIsOpen((previous) => !previous), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const active = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(definitions)
          .filter(([key]) => key in builtins)
          .map(([key]) => [
            key,
            getFeatureState(key, builtins[key].defaultValue),
          ]),
      ),
    [definitions, getFeatureState],
  );

  const handleDisable = useCallback(
    (key: string) => {
      setFeatureState(key, builtins[key]?.defaultValue ?? false);
    },
    [setFeatureState],
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (
        custom.detail &&
        (custom.detail in builtins ||
          custom.detail === "readingMask" ||
          custom.detail === "readingGuide")
      ) {
        handleDisable(custom.detail);
      }
    };
    document.addEventListener("arap:disable-feature", handler);
    return () => document.removeEventListener("arap:disable-feature", handler);
  }, [handleDisable]);

  const effectiveLocale =
    locale ||
    (typeof document !== "undefined"
      ? document.documentElement.lang
      : undefined) ||
    undefined;

  useBuiltinEffects(active, handleDisable);
  const value = useMemo(
    () => ({
      state: { isOpen, features },
      isOpen,
      panelId,
      position,
      widgetPlacement,
      setWidgetPlacement,
      toggleOpen,
      closeMenu,
      getFeatureState,
      setFeatureState,
      registerFeature,
      resetAll,
      registerReset,
      unregisterReset,
      locale: effectiveLocale,
      statementUrl,
      largeControls,
    }),
    [
      isOpen,
      features,
      panelId,
      position,
      widgetPlacement,
      setWidgetPlacement,
      toggleOpen,
      closeMenu,
      getFeatureState,
      setFeatureState,
      registerFeature,
      resetAll,
      registerReset,
      unregisterReset,
      effectiveLocale,
      statementUrl,
      largeControls,
    ],
  );
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {Object.entries(definitions)
        .filter(([, definition]) => definition.apply)
        .map(([key, definition]) => (
          <CustomEffect
            key={key}
            definition={definition}
            value={getFeatureState(key, definition.defaultValue)}
          />
        ))}
    </AccessibilityContext.Provider>
  );
}
export default AccessibilityPlugin;
