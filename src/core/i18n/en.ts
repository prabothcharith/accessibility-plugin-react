import type { LocaleStrings } from "./types";

export const enLocale: Readonly<LocaleStrings> = Object.freeze({
  title: "Accessibility settings",
  description: "Adjust your reading experience",
  closeLabel: "Close accessibility settings",
  skipToActions: "Jump to quick actions",
  skipToMain: "Skip to main content",
  toolsLabel: "Accessibility tools",
  quickActionsLabel: "Quick actions",
  resetLabel: "Reset all accessibility settings",
  resetAll: "Reset All",
  statementLink: "Accessibility Statement",
  openInNewTab: "opens in a new tab",
  creditsPrefix: "Designed and developed by",
  creditsName: "Praboth",
  documentationLink: "Official documentation",
  buttonTitle: "Accessibility",
  dragHelp:
    "Drag to move, or use Alt and arrow keys. The Move button menu offers click and keyboard controls.",
  positionLabel: "Button position",
  moveButton: "Move button",
  moveButtonLabel: "Move accessibility button",
  buttonPositionSelectLabel: "Accessibility button position",
  customPosition: "Custom position",
  resetPosition: "Reset button position",
  doneMoving: "Done moving",
  moveLeft: "Move accessibility button left",
  moveUp: "Move accessibility button up",
  moveDown: "Move accessibility button down",
  moveRight: "Move accessibility button right",
  largeControlsLabel: "Oversized widget controls",
  formatPointPosition: (x: number, y: number) =>
    `Button position: ${Math.round(x * 100)}% horizontally, ${Math.round(y * 100)}% vertically.`,
  formatCornerPosition: (corner: string) =>
    `Button position: ${corner.split("-").join(" ")}.`,
});
