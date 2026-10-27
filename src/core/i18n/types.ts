export interface FeatureLocaleLabels {
  textScale?: string;
  lineHeight?: string;
  letterSpacing?: string;
  wordSpacing?: string;
  paragraphSpacing?: string;
  textAlign?: string;
  fontFamily?: string;
  contrast?: string;
  highlightLinks?: string;
  focusOutline?: string;
  reduceMotion?: string;
  cursorGuide?: string;
  headingsNavigator?: string;
  profiles?: string;
  presets?: string;
  readingMode?: string;
  [key: string]: string | undefined;
}

export interface LocaleStrings {
  title: string;
  description: string;
  closeLabel: string;
  skipToActions: string;
  skipToMain?: string;
  toolsLabel: string;
  quickActionsLabel: string;
  resetLabel: string;
  resetAll: string;
  statementLink: string;
  openInNewTab: string;
  creditsPrefix?: string;
  creditsName?: string;
  documentationLink?: string;
  buttonTitle: string;
  dragHelp: string;
  positionLabel: string;
  moveButton: string;
  moveButtonLabel: string;
  buttonPositionSelectLabel: string;
  customPosition: string;
  resetPosition: string;
  doneMoving: string;
  moveLeft: string;
  moveUp: string;
  moveDown: string;
  moveRight: string;
  largeControlsLabel: string;
  cornerNames?: Record<string, string>;
  formatPointPosition?: (x: number, y: number) => string;
  formatCornerPosition?: (corner: string) => string;

  // Search & empty states
  searchPlaceholder?: string;
  searchClearLabel?: string;
  formatSearchCount?: (
    matched: number,
    total: number,
    query?: string,
  ) => string;
  emptySearchTitle?: string;
  emptySearchDescription?: string;
  clearSearchLabel?: string;

  // Announcements
  formatProfileApplied?: (profileName: string) => string;
  formatProfileReverted?: () => string;
  formatPresetSaved?: (presetName: string) => string;
  formatPresetApplied?: (presetName: string) => string;
  formatPresetDeleted?: (presetName: string) => string;

  // Steppers & controls
  decreaseTextSize?: string;
  increaseTextSize?: string;

  // Reading mode
  readingModeDescription?: string;
  readingModeOpen?: string;
  readingModeClose?: string;
  readingModeFailed?: string;
  formatReadingWords?: (words: number) => string;
  formatReadingTime?: (minutes: number) => string;

  // Keyboard Shortcuts & Link Explorer (A11Y-308)
  shortcutsTitle?: string;
  shortcutsDescription?: string;
  shortcutsOpen?: string;
  shortcutsClose?: string;
  shortcutsEnabledLabel?: string;
  shortcutsSearchPlaceholder?: string;
  shortcutsRemap?: string;
  shortcutsReset?: string;
  shortcutsPressKey?: string;
  shortcutsCancel?: string;
  shortcutToggleWidget?: string;
  shortcutToggleWidgetDesc?: string;
  shortcutResetAll?: string;
  shortcutResetAllDesc?: string;
  shortcutPageNavigator?: string;
  shortcutPageNavigatorDesc?: string;
  shortcutSkipToMain?: string;
  shortcutSkipToMainDesc?: string;
  shortcutReadingMode?: string;
  shortcutReadingModeDesc?: string;
  shortcutProfiles?: string;
  shortcutProfilesDesc?: string;
  shortcutPresets?: string;
  shortcutPresetsDesc?: string;
  shortcutHelp?: string;
  shortcutHelpDesc?: string;
  shortcutCloseDialog?: string;
  shortcutCloseDialogDesc?: string;
  pageNavigatorLinksTab?: string;
  pageNavigatorLinksEmpty?: string;
  pageNavigatorLinksAmbiguous?: string;

  // Feature names
  features?: FeatureLocaleLabels;
}

export type SupportedLocale =
  "en" | "en-US" | "en-GB" | "si" | "si-LK" | "ta" | "ta-LK" | string;
