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
  formatPointPosition?: (x: number, y: number) => string;
  formatCornerPosition?: (corner: string) => string;
}

export type SupportedLocale = "en" | string;
