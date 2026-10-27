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
  shortcutsTitle: "விசைப்பலகை குறுக்குவழிகள்",
  shortcutsDescription:
    "அணுகல்தன்மை விசைப்பலகை குறுக்குவழிகளைக் கண்டறிந்து மாற்றியமைக்கவும்",
  shortcutsOpen: "குறுக்குவழிகளைத் திற",
  shortcutsClose: "குறுக்குவழிகளை மூடு",
  shortcutsEnabledLabel: "முழு விசைப்பலகை குறுக்குவழிகளைச் செயல்படுத்து",
  shortcutsSearchPlaceholder: "குறுக்குவழிகளை வடிகட்டவும்...",
  shortcutsRemap: "மறுஒதுக்கீடு",
  shortcutsReset: "இயல்புநிலைக்கு மீட்டமை",
  shortcutsPressKey: "விரும்பிய விசை கலவையை அழுத்தவும்...",
  shortcutsCancel: "ரத்துசெய்",
  shortcutToggleWidget: "அணுகல்தன்மை பலகத்தை நிலைமாற்று",
  shortcutToggleWidgetDesc:
    "அணுகல்தன்மை அமைப்புகள் பலகத்தைத் திறக்கவும் அல்லது மூடவும்",
  shortcutResetAll: "அனைத்து காட்சி அமைப்புகளையும் மீட்டமை",
  shortcutResetAllDesc:
    "இயல்பு காட்சி மற்றும் மாறுபட்ட அமைப்புகளை மீட்டமைத்தல்",
  shortcutPageNavigator: "பக்க அமைப்பு மற்றும் இணைப்புகள்",
  shortcutPageNavigatorDesc:
    "தலைப்புகள், அடையாளங்கள் மற்றும் இணைப்புகளை ஆராயுங்கள்",
  shortcutSkipToMain: "முக்கிய உள்ளடக்கத்திற்குத் தாவவும்",
  shortcutSkipToMainDesc:
    "நேரடியாக முதன்மை உள்ளடக்க அடையாளத்திற்குச் செல்லவும்",
  shortcutReadingMode: "வாசிப்பு முறை",
  shortcutReadingModeDesc: "கவனச்சிதறலற்ற கட்டுரை பார்வை",
  shortcutProfiles: "அணுகல்தன்மை சுயவிவரங்கள்",
  shortcutProfilesDesc: "அணுகல்தன்மை பரிந்துரைகளை உலாவவும்",
  shortcutPresets: "சேமிக்கப்பட்ட முன்னமைவுகள்",
  shortcutPresetsDesc: "தனிப்பயன் முன்னமைவுகளைச் சேமிக்கவும் அல்லது ஏற்றவும்",
  shortcutHelp: "குறுக்குவழி உதவி",
  shortcutHelpDesc: "விசைப்பலகை குறுக்குவழிகள் வழிகாட்டியைத் திறக்கவும்",
  shortcutCloseDialog: "உரையாடலை மூடு",
  shortcutCloseDialogDesc: "திறந்துள்ள உரையாடல் அல்லது மேலடுக்கை மூடவும்",
  pageNavigatorLinksTab: "இணைப்புகள்",
  pageNavigatorLinksEmpty: "இப்பக்கத்தில் இணைப்புகள் எதுவும் இல்லை.",
  pageNavigatorLinksAmbiguous: "தெளிவற்றது",

  // Read Aloud TTS (A11Y-401)
  readAloudDescription:
    "உரையை பேச்சாக மாற்றும் தொழில்நுட்பத்தைப் பயன்படுத்தி பக்க உள்ளடக்கத்தைக் கேளுங்கள்",
  readAloudPlay: "சத்தமாகப் படியுங்கள்",
  readAloudPlaySelection: "தேர்வை வாசி",
  readAloudPlayArticle: "கட்டுரையை வாசி",
  readAloudPause: "இடைநிறுத்து",
  readAloudResume: "மீண்டும் தொடங்கு",
  readAloudStop: "வாசிப்பை நிறுத்து",
  readAloudRate: "வேகம்",
  readAloudPitch: "சுருதி",
  readAloudVoice: "குரல்",
  readAloudDefaultVoice: "இயல்புநிலை குரல்",
  readAloudStatusReading: "வாசிக்கப்படுகிறது...",
  readAloudStatusPaused: "இடைநிறுத்தப்பட்டுள்ளது",
  readAloudStatusStopped: "நிறுத்தப்பட்டது",
  readAloudUnsupported: "இந்த உலாவியில் உரை-பேச்சு வசதி ஆதரிக்கப்படவில்லை.",
  readAloudNoText: "படிக்கக்கூடிய உரை எதுவும் கிடைக்கவில்லை.",
  readAloudSensitiveSkipped:
    "தனிப்பட்ட அல்லது முக்கியமான படிவ புலங்கள் வாசிப்பில் இருந்து தவிர்க்கப்படுகின்றன.",
  readAloudSpeed: "வேகம்",
  shortcutReadAloud: "சத்தமாகப் படியுங்கள்",
  shortcutReadAloudDesc:
    "சத்தமாகப் படிப்பதைத் தொடங்கவும், இடைநிறுத்தவும் அல்லது நிறுத்தவும்",

  // Saturation & grayscale modes
  saturationOff: "முடக்கு",
  saturationLow: "குறைந்த",
  saturationHigh: "அதிக",
  saturationGrayscale: "சாம்பல் நிறம்",
  saturationLowWarning:
    "குறைந்த நிறச்செறிவூட்டல் நிற வேறுபாடுகளைக் குறைக்கிறது. வரைபடங்கள் மற்றும் நிறக் குறியீடுகளை வேறுபடுத்துவது கடினமாகலாம்.",
  saturationHighWarning:
    "அதிக நிறச்செறிவூட்டல் வண்ணத் தீவிரத்தை (200%) அதிகரிக்கிறது, இது கண் கூச்சம் அல்லது நிறச் சிதைவை ஏற்படுத்தலாம்.",
  grayscaleWarning:
    "சாம்பல் நிறம் அனைத்து வண்ணங்களையும் நீக்குகிறது. வண்ணங்களை மட்டுமே நம்பியிருக்கும் வரைபடங்களுக்கு மாற்று லேபிள்கள் தேவைப்படலாம்.",
  forcedColorsActiveWarning:
    "இயக்க முறைமையின் உயர் மாறுபாடு பயன்முறை செயலில் உள்ளது. கணினி மாறுபாட்டைப் பாதுகாக்க வடிகட்டி விளைவுகள் தவிர்க்கப்படுகின்றன.",
  shortcutGrayscale: "சாம்பல் நிறம்",
  // Dictionary
  dictionaryTitle: "அகராதி",
  dictionaryDescription: "சொல் விளக்கங்கள் மற்றும் அணுகல்தன்மை சொற்களஞ்சியத்தைத் தேடுங்கள்",
  dictionarySearchPlaceholder: "விளக்கம் தேட ஒரு சொல்லைத் தட்டச்சு செய்க...",
  dictionaryLookupButton: "தேடு",
  dictionaryClearButton: "சொல்லை அழி",
  dictionaryCloseDialog: "அகராதியை மூடு",
  dictionaryStatusSearching: "தேடப்படுகிறது...",
  dictionaryStatusFound: (word: string) => `"${word}" என்பதற்கான விளக்கம் கண்டறியப்பட்டது.`,
  dictionaryStatusNotFound: (word: string) =>
    `"${word}" என்பதற்கான விளக்கம் கிடைக்கவில்லை. எழுத்துப் பிழையைச் சரிபார்க்கவும் அல்லது பரிந்துரையைத் தேர்ந்தெடுக்கவும்.`,
  dictionarySuggestionsTitle: "நீங்கள் தேடியது இதையா:",
  dictionarySourceLocal: "உள்ளமைக்கப்பட்ட சொற்களஞ்சியம்",
  dictionarySourceProvider: "கட்டமைக்கப்பட்ட வழங்குநர்",
  dictionaryPartOfSpeech: "சொல் வகை",
  dictionaryExampleLabel: "உதாரணம்",
  shortcutDictionary: "அகராதி",
  shortcutDictionaryDesc: "அணுகல்தன்மை அகராதி தேடலைத் திறக்கவும்",

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
    keyboardShortcuts: "விசைப்பலகை குறுக்குவழிகள்",
    readAloud: "சத்தமாகப் படியுங்கள்",
    saturation: "நிறச்செறிவூட்டல்",
    grayscale: "சாம்பல் நிறம்",
    dictionary: "அகராதி",
  },
});
