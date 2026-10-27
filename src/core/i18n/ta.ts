import type { LocaleStrings } from "./types";

export const taCornerNames: Record<string, string> = {
  "bottom-right": "கீழ் வலது",
  "bottom-left": "கீழ் இடது",
  "top-right": "மேல் வலது",
  "top-left": "மேல் இடது",
};

export const taLocale: Readonly<LocaleStrings> = Object.freeze({
  title: "அணுகல்தன்மை அமைப்புகள்",
  description: "உங்கள் வாசிப்பு அனுபவத்தை மாற்றியமைக்கவும்",
  closeLabel: "அணுகல்தன்மை அமைப்புகளை மூடுக",
  skipToActions: "விரைவுச் செயல்களுக்குச் செல்க",
  skipToMain: "முக்கிய உள்ளடக்கத்திற்குச் செல்க",
  toolsLabel: "அணுகல்தன்மை கருவிகள்",
  quickActionsLabel: "விரைவுச் செயல்கள்",
  resetLabel: "அனைத்து அணுகல்தன்மை அமைப்புகளையும் மீட்டமை",
  resetAll: "அனைத்தையும் மீட்டமை",
  statementLink: "அணுகல்தன்மை அறிக்கை",
  openInNewTab: "புதிய தாவலில் திறக்கும்",
  creditsPrefix: "வடிவமைத்து உருவாக்கியவர்",
  creditsName: "பிரபோத்",
  documentationLink: "அதிகாரப்பூர்வ ஆவணங்கள்",
  buttonTitle: "அணுகல்தன்மை",
  dragHelp:
    "நகர்த்த இழுக்கவும், அல்லது Alt மற்றும் அம்புக்குறிகளைப் பயன்படுத்தவும். நகர்த்து பொத்தான் மெனு கிளிக் மற்றும் விசைப்பலகை கட்டுப்பாடுகளை வழங்குகிறது.",
  positionLabel: "பொத்தான் அமைவிடம்",
  moveButton: "பொத்தானை நகர்த்து",
  moveButtonLabel: "அணுகல்தன்மை பொத்தானை நகர்த்து",
  buttonPositionSelectLabel: "அணுகல்தன்மை பொத்தான் அமைவிடம்",
  customPosition: "தனிப்பயன் அமைவிடம்",
  resetPosition: "பொத்தான் அமைவிடத்தை மீட்டமை",
  doneMoving: "நகர்த்தல் முடிந்தது",
  moveLeft: "அணுகல்தன்மை பொத்தானை இடதுபுறம் நகர்த்து",
  moveUp: "அணுகல்தன்மை பொத்தானை மேலே நகர்த்து",
  moveDown: "அணுகல்தன்மை பொத்தானை கீழே நகர்த்து",
  moveRight: "அணுகல்தன்மை பொத்தானை வலதுபுறம் நகர்த்து",
  largeControlsLabel: "பெரிய விட்ஜெட் கட்டுப்பாடுகள்",
  cornerNames: taCornerNames,
  formatPointPosition: (x: number, y: number) =>
    `பொத்தான் அமைவிடம்: கிடைமட்டமாக ${Math.round(x * 100)}%, செங்குத்தாக ${Math.round(y * 100)}%.`,
  formatCornerPosition: (corner: string) => {
    const translated = taCornerNames[corner] ?? corner.split("-").join(" ");
    return `பொத்தான் அமைவிடம்: ${translated}.`;
  },
  searchPlaceholder: "கருவிகள் அல்லது சுயவிவரங்களைத் தேடுக...",
  searchClearLabel: "தேடலை அழி",
  formatSearchCount: (matched: number, total: number, query?: string) =>
    query
      ? `மொத்தமுள்ள ${total} கருவிகளில் "${query}" உடன் பொருந்தும் ${matched} காட்டப்படுகின்றன`
      : `அனைத்து ${total} கருவிகளும் காட்டப்படுகின்றன`,
  emptySearchTitle: "பொருந்தும் கருவிகள் எதுவும் கிடைக்கவில்லை",
  emptySearchDescription:
    "வேறு தேடல் வார்த்தையை முயற்சிக்கவும் அல்லது வடிப்பான்களை மீட்டமைக்கவும்.",
  clearSearchLabel: "தேடலை அழி",
  formatProfileApplied: (profileName: string) =>
    `✓ "${profileName}" சுயவிவரம் செயல்படுத்தப்பட்டது.`,
  formatProfileReverted: () =>
    "சுயவிவரம் அகற்றப்பட்டு தனிப்பயன் அமைப்புகளுக்கு மாற்றப்பட்டது.",
  formatPresetSaved: (presetName: string) =>
    `"${presetName}" முன்னமைவு வெற்றிகரமாகச் சேமிக்கப்பட்டது.`,
  formatPresetApplied: (presetName: string) =>
    `"${presetName}" முன்னமைவு செயல்படுத்தப்பட்டது.`,
  formatPresetDeleted: (presetName: string) =>
    `"${presetName}" முன்னமைவு நீக்கப்பட்டது.`,
  decreaseTextSize: "உரை அளவைக் குறைக்கவும்",
  increaseTextSize: "உரை அளவை அதிகரிக்கவும்",
  readingModeDescription: "கவனச்சிதறலற்ற கட்டுரை வாசிப்பு",
  readingModeOpen: "வாசிப்பு பயன்முறையைத் திற",
  readingModeClose: "வாசிப்பு பயன்முறையை மூடு",
  readingModeFailed:
    "இப்பக்கத்தில் படிக்கக்கூடிய கட்டுரை உள்ளடக்கம் எதுவும் இல்லை.",
  formatReadingWords: (words: number) => `${words} வார்த்தைகள்`,
  formatReadingTime: (minutes: number) => `${minutes} நிமிட வாசிப்பு`,
  features: {
    textScale: "பெரிய உரை",
    lineHeight: "வரி இடைவெளி",
    letterSpacing: "எழுத்து இடைவெளி",
    wordSpacing: "சொல் இடைவெளி",
    paragraphSpacing: "பத்தி இடைவெளி",
    textAlign: "உரை சீரமைப்பு",
    fontFamily: "தெளிவான எழுத்துரு",
    contrast: "மாறுபட்ட வண்ணம்",
    highlightLinks: "இணைப்புகளை முன்னிலைப்படுத்து",
    focusOutline: "கவன எல்லைக்கோட்டு",
    reduceMotion: "இயக்கத்தைக் குறைத்தல்",
    cursorGuide: "வாசிப்பு வழிகாட்டி",
    headingsNavigator: "பக்க வழிகாட்டி",
    profiles: "அணுகல்தன்மை சுயவிவரங்கள்",
    presets: "சேமிக்கப்பட்ட முன்னமைவுகள்",
    readingMode: "வாசிப்பு முறை",
  },
});
