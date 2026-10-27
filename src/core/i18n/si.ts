import type { LocaleStrings } from "./types";

export const siCornerNames: Record<string, string> = {
  "bottom-right": "පහළ දකුණ",
  "bottom-left": "පහළ වම",
  "top-right": "ඉහළ දකුණ",
  "top-left": "ඉහළ වම",
};

export const siLocale: Readonly<LocaleStrings> = Object.freeze({
  title: "ප්‍රවේශ්‍යතා සැකසුම්",
  description: "ඔබේ කියවීමේ අත්දැකීම සකසා ගන්න",
  closeLabel: "ප්‍රවේශ්‍යතා සැකසුම් වසන්න",
  skipToActions: "ක්ෂණික ක්‍රියා වෙත මඟ හරින්න",
  skipToMain: "ප්‍රධාන අන්තර්ගතය වෙත මඟ හරින්න",
  toolsLabel: "ප්‍රවේශ්‍යතා මෙවලම්",
  quickActionsLabel: "ක්ෂණික ක්‍රියා",
  resetLabel: "සියලු ප්‍රවේශ්‍යතා සැකසුම් යළි සකසන්න",
  resetAll: "සියල්ල යළි සකසන්න",
  statementLink: "ප්‍රවේශ්‍යතා ප්‍රකාශය",
  openInNewTab: "නව ටැබයක විවෘත වේ",
  creditsPrefix: "සැලසුම් කර නිර්මාණය කළේ",
  creditsName: "ප්‍රබෝද්",
  documentationLink: "නිල ලේඛනගත කිරීම",
  buttonTitle: "ප්‍රවේශ්‍යතාව",
  dragHelp:
    "ස්ථානය මාරු කිරීමට අදින්න, නැතහොත් Alt සමඟ ඊතල යතුරු භාවිතා කරන්න. චලන මෙනුව ක්ලික් සහ යතුරුපුවරු පාලන සපයයි.",
  positionLabel: "බොත්තමේ පිහිටීම",
  moveButton: "බොත්තම ගෙනයන්න",
  moveButtonLabel: "ප්‍රවේශ්‍යතා බොත්තම ගෙනයන්න",
  buttonPositionSelectLabel: "ප්‍රවේශ්‍යතා බොත්තමේ පිහිටීම",
  customPosition: "අභිරුචි පිහිටීම",
  resetPosition: "බොත්තමේ පිහිටීම යළි සකසන්න",
  doneMoving: "චලනය අවසන්",
  moveLeft: "ප්‍රවේශ්‍යතා බොත්තම වමට ගෙනයන්න",
  moveUp: "ප්‍රවේශ්‍යතා බොත්තම ඉහළට ගෙනයන්න",
  moveDown: "ප්‍රවේශ්‍යතා බොත්තම පහළට ගෙනයන්න",
  moveRight: "ප්‍රවේශ්‍යතා බොත්තම දකුණට ගෙනයන්න",
  largeControlsLabel: "විශාල ප්‍රමාණයේ පාලන",
  cornerNames: siCornerNames,
  formatPointPosition: (x: number, y: number) =>
    `බොත්තමේ පිහිටීම: තිරස් අතට ${Math.round(x * 100)}%, සිරස් අතට ${Math.round(y * 100)}%.`,
  formatCornerPosition: (corner: string) => {
    const translated = siCornerNames[corner] ?? corner.split("-").join(" ");
    return `බොත්තමේ පිහිටීම: ${translated}.`;
  },
  searchPlaceholder: "මෙවලම් හෝ පැතිකඩ සොයන්න...",
  searchClearLabel: "සෙවුම හිස් කරන්න",
  formatSearchCount: (matched: number, total: number, query?: string) =>
    query
      ? `මෙවලම් ${total} න් "${query}" ට ගැලපෙන ${matched} ක් පෙන්වයි`
      : `සියලු මෙවලම් ${total} ම පෙන්වයි`,
  emptySearchTitle: "ගැලපෙන මෙවලම් හමු නොවීය",
  emptySearchDescription:
    "වෙනත් සෙවුම් පදයක් භාවිතා කර බලන්න හෝ පෙරහන් යළි සකසන්න.",
  clearSearchLabel: "සෙවුම හිස් කරන්න",
  formatProfileApplied: (profileName: string) =>
    `✓ "${profileName}" පැතිකඩ සක්‍රිය කරන ලදී.`,
  formatProfileReverted: () => "පැතිකඩ ඉවත් කර අභිරුචි සැකසුම් වෙත මාරු විය.",
  formatPresetSaved: (presetName: string) =>
    `"${presetName}" පෙරසැකසුම සාර්ථකව සුරකින ලදී.`,
  formatPresetApplied: (presetName: string) =>
    `"${presetName}" පෙරසැකසුම ක්‍රියාත්මක කරන ලදී.`,
  formatPresetDeleted: (presetName: string) =>
    `"${presetName}" පෙරසැකසුම ඉවත් කරන ලදී.`,
  decreaseTextSize: "අකුරු ප්‍රමාණය අඩු කරන්න",
  increaseTextSize: "අකුරු ප්‍රමාණය වැඩි කරන්න",
  features: {
    textScale: "විශාල අකුරු",
    lineHeight: "පේළි පරතරය",
    letterSpacing: "අකුරු පරතරය",
    wordSpacing: "වචන පරතරය",
    paragraphSpacing: "ඡේද පරතරය",
    textAlign: "පෙළ පෙළගැස්ම",
    fontFamily: "පැහැදිලි අකුරු",
    contrast: "වර්ණ වෙනස",
    highlightLinks: "සබැඳි ඉස්මතු කිරීම",
    focusOutline: "නාභිගත මායිම",
    reduceMotion: "චලනය අවම කිරීම",
    cursorGuide: "කියවීමේ මඟපෙන්වුම",
    headingsNavigator: "පිටු ගවේශකය",
    profiles: "ප්‍රවේශ්‍යතා පැතිකඩ",
    presets: "සුරකින ලද පෙරසැකසුම්",
    readingMode: "කියවීමේ මාදිලිය",
  },
});
