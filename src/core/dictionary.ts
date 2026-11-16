/**
 * Dictionary provider interface, local curated dictionary, and sanitization policy.
 *
 * Implements A11Y-403:
 * - Explicit user action required (never auto-looks up on hover/focus)
 * - Zero network requests by default (100% offline static dictionary)
 * - Truthful unknown results (never hallucinates or fabricates definitions)
 * - Strict sanitization (strips HTML, limits length, rejects sensitive/token patterns)
 * - Rate-limited provider interface for custom backends
 * - Privacy protection (never sends whole-page DOM, cookies, or clipboard data)
 */

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  source: "local" | "custom" | "provider";
  language?: string;
}

export interface DictionaryLookupResult {
  found: boolean;
  term?: string;
  entry?: DictionaryEntry;
  suggestions?: string[];
  error?: string;
}

export interface DictionaryProvider {
  id: string;
  name: string;
  lookup: (word: string, lang?: string) => Promise<DictionaryLookupResult>;
  allowedOrigins?: string[];
  rateLimitMs?: number;
}

/**
 * Built-in curated accessibility & web dictionary entries.
 * Guaranteed 100% offline with zero network requests.
 */
export const LOCAL_DICTIONARY_EN: Record<
  string,
  Omit<DictionaryEntry, "word" | "source">
> = {
  accessibility: {
    phonetic: "/əkˌsesəˈbɪləti/",
    partOfSpeech: "noun",
    definition:
      "The practice of designing software, websites, and environments usable by people with diverse abilities and disabilities.",
    example:
      "Web accessibility ensures screen reader users can navigate and interact with all page controls.",
    language: "en",
  },
  aria: {
    phonetic: "/ˈɑːriə/",
    partOfSpeech: "abbreviation",
    definition:
      "Accessible Rich Internet Applications; a W3C specification of HTML attributes that convey roles, states, and properties to assistive technologies.",
    example:
      "The button specifies aria-expanded to indicate whether its associated menu is open.",
    language: "en",
  },
  contrast: {
    phonetic: "/ˈkɒntrɑːst/",
    partOfSpeech: "noun",
    definition:
      "The visual difference in luminance between text or foreground graphics and their background surface.",
    example: "WCAG AA requires a 4.5:1 contrast ratio for normal body text.",
    language: "en",
  },
  dyslexia: {
    phonetic: "/dɪsˈleksiə/",
    partOfSpeech: "noun",
    definition:
      "A neurodivergent learning variation that primarily impacts reading, word decoding, and spelling fluency.",
    example:
      "Increased letter spacing and specialized legible typefaces can support readers with dyslexia.",
    language: "en",
  },
  focus: {
    phonetic: "/ˈfoʊkəs/",
    partOfSpeech: "noun",
    definition:
      "The visual and programmatic state indicating which interactive element currently receives keyboard input.",
    example:
      "A clear visible focus indicator is essential for keyboard-only navigation.",
    language: "en",
  },
  grayscale: {
    phonetic: "/ˈɡreɪskeɪl/",
    partOfSpeech: "noun",
    definition:
      "A visual mode displaying content exclusively in shades of gray, removing all chromatic hue and color saturation.",
    example:
      "Grayscale mode helps users who experience visual overstimulation or migraine triggers from vibrant colors.",
    language: "en",
  },
  reflow: {
    phonetic: "/ˌriːˈfloʊ/",
    partOfSpeech: "noun",
    definition:
      "The browser's ability to reorganize and wrap text content to fit the viewport width without requiring two-dimensional scrolling.",
    example:
      "WCAG 1.4.10 requires responsive reflow up to 400% zoom without horizontal scrollbars.",
    language: "en",
  },
  saturation: {
    phonetic: "/ˌsætʃəˈreɪʃn/",
    partOfSpeech: "noun",
    definition:
      "The relative purity, vividness, or chromatic intensity of a color.",
    example:
      "Lowering saturation reduces eye strain while maintaining natural color separation.",
    language: "en",
  },
  "screen reader": {
    phonetic: "/ˈskriːn ˌriːdər/",
    partOfSpeech: "noun",
    definition:
      "Assistive software that translates digital text and interface elements into synthetic speech or refreshable braille displays.",
    example:
      "Screen readers announce the role and state of native button elements automatically.",
    language: "en",
  },
  semantic: {
    phonetic: "/sɪˈmæntɪk/",
    partOfSpeech: "adjective",
    definition:
      "HTML elements and code structures that convey inherent meaning, structure, and hierarchy rather than presentation alone.",
    example:
      "Using semantic headings h1 through h6 creates an operable page outline for assistive technologies.",
    language: "en",
  },
  wcag: {
    phonetic: "/ˈwɪkæɡ/",
    partOfSpeech: "abbreviation",
    definition:
      "Web Content Accessibility Guidelines; international standards published by the W3C defining technical criteria for digital accessibility.",
    example:
      "The site targets WCAG 2.1 Level AA conformance across all interactive features.",
    language: "en",
  },
  voice: {
    phonetic: "/vɔɪs/",
    partOfSpeech: "noun",
    definition:
      "Spoken human sound or synthetic speech used to control interfaces via voice commands or listen to page content aloud.",
    example:
      "Voice navigation lets hands-free users trigger display adjustments with simple spoken phrases.",
    language: "en",
  },
  "voice navigation": {
    phonetic: "/vɔɪs ˌnævɪˈɡeɪʃn/",
    partOfSpeech: "noun",
    definition:
      "An assistive control method that maps spoken commands via browser speech recognition to trigger UI actions without a keyboard or pointer.",
    example:
      "Say 'increase text' or 'high contrast' after granting microphone consent to adjust the display.",
    language: "en",
  },
  "read aloud": {
    phonetic: "/riːd əˈlaʊd/",
    partOfSpeech: "noun phrase",
    definition:
      "Text-to-speech playback that reads selected text or main page articles audibly using browser speech synthesis.",
    example:
      "Activate Read Aloud to listen to an article while following along with adjustable playback speed.",
    language: "en",
  },
  "text to speech": {
    phonetic: "/tekst tə spiːtʃ/",
    partOfSpeech: "noun",
    definition:
      "Assistive technology (TTS) that converts written digital text on screen into synthesized spoken audio.",
    example:
      "Text to speech supports readers with low vision, dyslexia, or auditory learning preferences.",
    language: "en",
  },
  tts: {
    phonetic: "/ˌtiː.tiːˈes/",
    partOfSpeech: "abbreviation",
    definition:
      "Text-to-Speech; computerized voice synthesis that reads digital content aloud.",
    example:
      "The Read Aloud controller uses native Web Speech API TTS locally in the browser.",
    language: "en",
  },
  speech: {
    phonetic: "/spiːtʃ/",
    partOfSpeech: "noun",
    definition:
      "Vocalized language used as either input (speech recognition) or output (speech synthesis) in accessible computing.",
    example:
      "Adjusting speech rate slows playback so dense technical passages are easier to follow.",
    language: "en",
  },
  translation: {
    phonetic: "/trænzˈleɪʃn/",
    partOfSpeech: "noun",
    definition:
      "Converting visible host text content into another target language while leaving interactive controls and sensitive values untouched.",
    example:
      "Page translation restores original text nodes seamlessly when disabled.",
    language: "en",
  },
  keyboard: {
    phonetic: "/ˈkiːbɔːrd/",
    partOfSpeech: "noun",
    definition:
      "A physical or on-screen input device enabling non-pointer navigation through Tab, Enter, Space, Escape, and arrow keys.",
    example:
      "Every interactive plugin control must remain fully operable using only a keyboard.",
    language: "en",
  },
  "keyboard navigation": {
    phonetic: "/ˈkiːbɔːrd ˌnævɪˈɡeɪʃn/",
    partOfSpeech: "noun",
    definition:
      "Moving focus and activating controls across links, buttons, forms, and dialogs exclusively via keystrokes.",
    example:
      "Press Escape to dismiss dialogs and return focus reliably to the opening button.",
    language: "en",
  },
  landmark: {
    phonetic: "/ˈlændmɑːrk/",
    partOfSpeech: "noun",
    definition:
      "A programmatic region on a web page (such as main, nav, header, footer, or aside) allowing assistive technology users to jump quickly between sections.",
    example:
      "Page Navigator lists all semantic landmarks alongside document headings and links.",
    language: "en",
  },
  heading: {
    phonetic: "/ˈhedɪŋ/",
    partOfSpeech: "noun",
    definition:
      "A hierarchical section title (h1 to h6) that structures a document outline for visual scanning and screen reader navigation.",
    example:
      "Screen readers can jump directly from one heading level to the next.",
    language: "en",
  },
  "skip link": {
    phonetic: "/skɪp lɪŋk/",
    partOfSpeech: "noun",
    definition:
      "An internal anchor link typically placed first in tab order so keyboard users can bypass repeated navigation menus straight to main content.",
    example:
      "Pressing Tab once reveals the Skip to main content link at the top of the page.",
    language: "en",
  },
  tooltip: {
    phonetic: "/ˈtuːltɪp/",
    partOfSpeech: "noun",
    definition:
      "A supplementary label box displayed when hovering or focusing an interface element with a descriptive name or title attribute.",
    example:
      "Accessible tooltips reveal supplemental labels reliably on keyboard focus as well as hover.",
    language: "en",
  },
  "big cursor": {
    phonetic: "/bɪɡ ˈkɜːrsər/",
    partOfSpeech: "noun",
    definition:
      "An enlarged high-contrast pointer appearance designed to make tracking mouse position easier for users with low vision.",
    example:
      "Choose Black or White Big Cursor variants to keep the pointer visible against any page background.",
    language: "en",
  },
  cursor: {
    phonetic: "/ˈkɜːrsər/",
    partOfSpeech: "noun",
    definition:
      "The movable visual indicator tracking pointer movement or text insertion position on screen.",
    example:
      "Enlarging the cursor helps prevent losing track of links on dense web pages.",
    language: "en",
  },
  "reading guide": {
    phonetic: "/ˈriːdɪŋ ɡaɪd/",
    partOfSpeech: "noun",
    definition:
      "A horizontal tracking bar that follows pointer or keyboard position across lines of text to aid line-by-line focus.",
    example:
      "Readers with tracking difficulties use the reading guide to stay anchored to the active line.",
    language: "en",
  },
  "reading mask": {
    phonetic: "/ˈriːdɪŋ mæsk/",
    partOfSpeech: "noun",
    definition:
      "A dimmed page overlay that leaves a bright horizontal reading band uncovered to minimize visual distraction above and below.",
    example:
      "Resize the reading mask height to highlight one or two sentences at a time.",
    language: "en",
  },
  "reading mode": {
    phonetic: "/ˈriːdɪŋ moʊd/",
    partOfSpeech: "noun",
    definition:
      "A stripped-down, distraction-free article view that isolates sanitized main prose with customizable font, theme, and width.",
    example:
      "Open Reading Mode when surrounding sidebars and banners make long articles tiring to read.",
    language: "en",
  },
  "font size": {
    phonetic: "/fɒnt saɪz/",
    partOfSpeech: "noun",
    definition:
      "The vertical scale of rendered typography across text elements, configurable from 100% up to 200%.",
    example:
      "Increasing font size preserves layout integrity while making body copy comfortable to read.",
    language: "en",
  },
  "line height": {
    phonetic: "/laɪn haɪt/",
    partOfSpeech: "noun",
    definition:
      "The vertical spacing (leading) between consecutive lines of text inside a paragraph.",
    example:
      "WCAG text spacing benchmarks recommend at least 1.5 times font size for line height.",
    language: "en",
  },
  "letter spacing": {
    phonetic: "/ˈletər ˌspeɪsɪŋ/",
    partOfSpeech: "noun",
    definition:
      "Horizontal kerning or tracking added between individual characters in rendered words.",
    example:
      "Modest letter spacing reduces visual crowding for readers experiencing letter-swapping.",
    language: "en",
  },
  "word spacing": {
    phonetic: "/wɜːrd ˌspeɪsɪŋ/",
    partOfSpeech: "noun",
    definition:
      "The horizontal whitespace gap separating adjacent words along a line of text.",
    example:
      "Wider word spacing helps delineate word boundaries cleanly on mobile displays.",
    language: "en",
  },
  "paragraph spacing": {
    phonetic: "/ˈpærəɡræf ˌspeɪsɪŋ/",
    partOfSpeech: "noun",
    definition:
      "Vertical separation inserted after or between blocks of paragraphs to clarify document chunks.",
    example:
      "Clear paragraph spacing prevents multi-paragraph essays from fusing into a dense wall of text.",
    language: "en",
  },
  "text align": {
    phonetic: "/tekst əˈlaɪn/",
    partOfSpeech: "noun",
    definition:
      "The horizontal justification rule of text lines (left, right, center, or justified).",
    example:
      "Switching justified text to left-aligned eliminates irregular rivers of whitespace.",
    language: "en",
  },
  "reduce motion": {
    phonetic: "/rɪˈduːs ˈmoʊʃn/",
    partOfSpeech: "verb phrase",
    definition:
      "A preference that minimizes non-essential transitions, scrolling animations, and parallax motion.",
    example:
      "Reducing motion helps prevent vestibular discomfort, dizziness, and motion sickness.",
    language: "en",
  },
  "focus outline": {
    phonetic: "/ˈfoʊkəs ˈaʊtlaɪn/",
    partOfSpeech: "noun",
    definition:
      "A high-visibility ring or border drawn around whichever control presently holds keyboard focus.",
    example:
      "Strong focus outlines remain clearly discernible across both light and dark page surfaces.",
    language: "en",
  },
  "link highlight": {
    phonetic: "/lɪŋk ˈhaɪlaɪt/",
    partOfSpeech: "noun",
    definition:
      "Visual emphasis added to hyperlinks so interactive destinations stand out clearly from static body copy.",
    example:
      "Highlighting links avoids relying solely on subtle color differences within paragraphs.",
    language: "en",
  },
  invert: {
    phonetic: "/ɪnˈvɜːrt/",
    partOfSpeech: "verb",
    definition:
      "A display contrast adjustment reversing dark and light tones across the page surface while keeping embedded media natural where safe.",
    example:
      "Invert colors swaps black-on-white pages into light-on-dark surfaces for light sensitivity.",
    language: "en",
  },
  "high contrast": {
    phonetic: "/haɪ ˈkɒntrɑːst/",
    partOfSpeech: "noun",
    definition:
      "A theme mode maximizing luminance separation between foreground text, borders, controls, and surfaces.",
    example:
      "High contrast themes improve legibility outdoors and for users with low contrast sensitivity.",
    language: "en",
  },
  "alt text": {
    phonetic: "/ɔːlt tekst/",
    partOfSpeech: "noun",
    definition:
      "Alternative text supplied via HTML alt attributes describing the meaning or function of an image for screen readers or failed loads.",
    example:
      "Decorative images use empty alt='' so assistive tools skip them while informative graphics retain clear alt text.",
    language: "en",
  },
  profile: {
    phonetic: "/ˈproʊfaɪl/",
    partOfSpeech: "noun",
    definition:
      "A curated multi-setting bundle tailored to specific accessibility needs such as Low Vision, Dyslexia Friendly, or Seizure Safe.",
    example:
      "Applying an accessibility profile configures several coordinated display settings in one click.",
    language: "en",
  },
  preset: {
    phonetic: "/ˈpriːset/",
    partOfSpeech: "noun",
    definition:
      "A user-saved or exported JSON configuration snapshot of active accessibility preferences.",
    example:
      "Save your custom settings as a preset to restore or share your setup across devices.",
    language: "en",
  },
  zoom: {
    phonetic: "/zuːm/",
    partOfSpeech: "noun",
    definition:
      "Optical or browser viewport magnification (such as 200% or 400%) requiring responsive content reflow.",
    example:
      "Well-designed accessibility controls remain usable without horizontal clipping at 400% zoom.",
    language: "en",
  },
  caption: {
    phonetic: "/ˈkæpʃn/",
    partOfSpeech: "noun",
    definition:
      "Synchronized visible text representing spoken dialogue, narration, and important sound cues in video media.",
    example:
      "Adding WebVTT captions makes instructional videos accessible to deaf and hard-of-hearing viewers.",
    language: "en",
  },
  "assistive technology": {
    phonetic: "/əˈsɪstɪv tekˈnɒlədʒi/",
    partOfSpeech: "noun",
    definition:
      "Hardware or software tools (such as screen readers, switch devices, magnifiers, and voice control) used by people with disabilities.",
    example:
      "Standard HTML semantics ensure compatibility with diverse assistive technologies.",
    language: "en",
  },
};

export const LOCAL_DICTIONARY_SI: Record<
  string,
  Omit<DictionaryEntry, "word" | "source">
> = {
  accessibility: {
    phonetic: "ප්‍රවේශ්‍යතාව",
    partOfSpeech: "නාම පදය",
    definition:
      "සියලු හැකියාවන් සහ ආබාධ සහිත පුද්ගලයින්ට පහසුවෙන් සහ ස්වාධීනව භාවිතා කළ හැකි වන පරිදි මෘදුකාංග සහ පරිසරයන් නිර්මාණය කිරීම.",
    example:
      "ඩිජිටල් ප්‍රවේශ්‍යතාව මඟින් තිර කියවනය භාවිතා කරන්නන්ට වෙබ් අඩවි පහසුවෙන් භාවිතා කිරීමට ඉඩ සලසයි.",
    language: "si",
  },
  ප්‍රවේශ්‍යතාව: {
    phonetic: "accessibility",
    partOfSpeech: "නාම පදය",
    definition:
      "සියලු හැකියාවන් සහ ආබාධ සහිත පුද්ගලයින්ට පහසුවෙන් සහ ස්වාධීනව භාවිතා කළ හැකි වන පරිදි මෘදුකාංග සහ පරිසරයන් නිර්මාණය කිරීම.",
    example:
      "ඩිජිටල් ප්‍රවේශ්‍යතාව මඟින් තිර කියවනය භාවිතා කරන්නන්ට වෙබ් අඩවි පහසුවෙන් භාවිතා කිරීමට ඉඩ සලසයි.",
    language: "si",
  },
  contrast: {
    phonetic: "වර්ණ වෙනස",
    partOfSpeech: "නාම පදය",
    definition: "පෙළ සහ එහි පසුබිම අතර ඇති දීප්තියේ දෘශ්‍ය වෙනස.",
    example:
      "පැහැදිලි කියවීමේ හැකියාව සඳහා ප්‍රමාණවත් වර්ණ වෙනසක් තිබීම අත්‍යවශ්‍ය වේ.",
    language: "si",
  },
  "වර්ණ වෙනස": {
    phonetic: "contrast",
    partOfSpeech: "නාම පදය",
    definition: "පෙළ සහ එහි පසුබිම අතර ඇති දීප්තියේ දෘශ්‍ය වෙනස.",
    example:
      "පැහැදිලි කියවීමේ හැකියාව සඳහා ප්‍රමාණවත් වර්ණ වෙනසක් තිබීම අත්‍යවශ්‍ය වේ.",
    language: "si",
  },
  saturation: {
    phonetic: "සන්තෘප්තිය",
    partOfSpeech: "නාම පදය",
    definition: "වර්ණයක තීව්‍රතාව හෝ දීප්තිමත් බව.",
    example: "වර්ණ සන්තෘප්තිය අඩු කිරීමෙන් ඇස්වල වෙහෙස අවම කරගත හැක.",
    language: "si",
  },
  සන්තෘප්තිය: {
    phonetic: "saturation",
    partOfSpeech: "නාම පදය",
    definition: "වර්ණයක තීව්‍රතාව හෝ දීප්තිමත් බව.",
    example: "වර්ණ සන්තෘප්තිය අඩු කිරීමෙන් ඇස්වල වෙහෙස අවම කරගත හැක.",
    language: "si",
  },
  grayscale: {
    phonetic: "අළු පරිමාණය",
    partOfSpeech: "නාම පදය",
    definition:
      "සියලු වර්ණ ඉවත් කර අළු පැහැයේ විවිධ ඡායාවන්ගෙන් පමණක් දර්ශනය වන මාදිලිය.",
    example:
      "අළු පරිමාණ මාදිලිය මඟින් දීප්තිමත් වර්ණ නිසා ඇතිවන අපහසුතා මඟහරවා ගත හැක.",
    language: "si",
  },
  "අළු පරිමාණය": {
    phonetic: "grayscale",
    partOfSpeech: "නාම පදය",
    definition:
      "සියලු වර්ණ ඉවත් කර අළු පැහැයේ විවිධ ඡායාවන්ගෙන් පමණක් දර්ශනය වන මාදිලිය.",
    example:
      "අළු පරිමාණ මාදිලිය මඟින් දීප්තිමත් වර්ණ නිසා ඇතිවන අපහසුතා මඟහරවා ගත හැක.",
    language: "si",
  },
  voice: {
    phonetic: "හඬ",
    partOfSpeech: "නාම පදය",
    definition:
      "හඬ විධාන මඟින් පාලනය කිරීමට හෝ පිටුවේ අන්තර්ගතය ශබ්ද නඟා ඇසීමට භාවිතා කරන කථන මාධ්‍යය.",
    example: "හඬ සංචාලනය මඟින් අත් රහිතව ප්‍රවේශ්‍යතා සැකසුම් වෙනස් කළ හැක.",
    language: "si",
  },
  translation: {
    phonetic: "පරිවර්තනය",
    partOfSpeech: "නාම පදය",
    definition: "පිටුවේ ප්‍රධාන පෙළ වෙනත් භාෂාවකට පරිවර්තනය කර පෙන්වීම.",
    example:
      "පිටු පරිවර්තනය මඟින් ඉංග්‍රීසි ලිපි සිංහලෙන් හෝ දෙමළෙන් කියවීමට පහසු වේ.",
    language: "si",
  },
};

export const LOCAL_DICTIONARY_TA: Record<
  string,
  Omit<DictionaryEntry, "word" | "source">
> = {
  accessibility: {
    phonetic: "அணுகல்தன்மை",
    partOfSpeech: "பெயர்ச்சொல்",
    definition:
      "அனைத்து திறன் மற்றும் குறைபாடுகள் கொண்ட நபர்களும் பயன்படுத்தக்கூடிய வகையில் மென்பொருள் மற்றும் இணையதளங்களை வடிவமைத்தல்.",
    example:
      "திரை வாசிப்பான் பயனர்களுக்கு டிஜிட்டல் அணுகல்தன்மை மிகவும் அவசியம்.",
    language: "ta",
  },
  அணுகல்தன்மை: {
    phonetic: "accessibility",
    partOfSpeech: "பெயர்ச்சொல்",
    definition:
      "அனைத்து திறன் மற்றும் குறைபாடுகள் கொண்ட நபர்களும் பயன்படுத்தக்கூடிய வகையில் மென்பொருள் மற்றும் இணையதளங்களை வடிவமைத்தல்.",
    example:
      "திரை வாசிப்பான் பயனர்களுக்கு டிஜிட்டல் அணுகல்தன்மை மிகவும் அவசியம்.",
    language: "ta",
  },
  contrast: {
    phonetic: "மாறுபட்ட வண்ணம்",
    partOfSpeech: "பெயர்ச்சொல்",
    definition:
      "உரைக்கும் அதன் பின்னணிக்கும் இடையே உள்ள பிரகாசத்தின் காட்சி வேறுபாடு.",
    example: "தெளிவான வாசிப்புக்கு போதுமான வண்ண மாறுபாடு அவசியம்.",
    language: "ta",
  },
  "மாறுபட்ட வண்ணம்": {
    phonetic: "contrast",
    partOfSpeech: "பெயர்ச்சொல்",
    definition:
      "உரைக்கும் அதன் பின்னணிக்கும் இடையே உள்ள பிரகாசத்தின் காட்சி வேறுபாடு.",
    example: "தெளிவான வாசிப்புக்கு போதுமான வண்ண மாறுபாடு அவசியம்.",
    language: "ta",
  },
  saturation: {
    phonetic: "நிறச்செறிவூட்டல்",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "ஒரு நிறத்தின் தூய்மை மற்றும் தீவிரம்.",
    example: "நிறச்செறிவைக் குறைப்பது கண் சோர்வைத் தடுக்கிறது.",
    language: "ta",
  },
  நிறச்செறிவூட்டல்: {
    phonetic: "saturation",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "ஒரு நிறத்தின் தூய்மை மற்றும் தீவிரம்.",
    example: "நிறச்செறிவைக் குறைப்பது கண் சோர்வைத் தடுக்கிறது.",
    language: "ta",
  },
  grayscale: {
    phonetic: "சாம்பல் நிறம்",
    partOfSpeech: "பெயர்ச்சொல்",
    definition:
      "அனைத்து வண்ணங்களையும் நீக்கி, சாம்பல் நிற நிழல்களில் மட்டுமே காட்சிகளை வழங்கும் முறை.",
    example:
      "சாம்பல் நிற முறை அதிகப்படியான வண்ண ஒளிர்தலைத் தவிர்க்க உதவுகிறது.",
    language: "ta",
  },
  "சாம்பல் நிறம்": {
    phonetic: "grayscale",
    partOfSpeech: "பெயர்ச்சொல்",
    definition:
      "அனைத்து வண்ணங்களையும் நீக்கி, சாம்பல் நிற நிழல்களில் மட்டுமே காட்சிகளை வழங்கும் முறை.",
    example:
      "சாம்பல் நிற முறை அதிகப்படியான வண்ண ஒளிர்தலைத் தவிர்க்க உதவுகிறது.",
    language: "ta",
  },
  voice: {
    phonetic: "குரல்",
    partOfSpeech: "பெயர்ச்சொல்",
    definition:
      "குரல் கட்டளைகள் மூலம் கட்டுப்படுத்தவோ பக்க உரையைச் சத்தமாகக் கேட்கவோ பயன்படும் பேச்சு ஊடகம்.",
    example:
      "குரல் வழிசெலுத்தல் கைகள் இன்றி காட்சி அமைப்புகளை மாற்ற உதவுகிறது.",
    language: "ta",
  },
  translation: {
    phonetic: "மொழிபெயர்ப்பு",
    partOfSpeech: "பெயர்ச்சொல்",
    definition:
      "பக்கத்தின் முதன்மை உரையை மற்றொரு மொழியில் மாற்றி காண்பிக்கும் வசதி.",
    example:
      "பக்க மொழிபெயர்ப்பு உள்ளடக்கத்தைத் தேர்ந்தெடுத்த மொழியில் படிக்க உதவுகிறது.",
    language: "ta",
  },
};

/** Patterns that indicate sensitive, token, or private content that must never be sent or looked up. */
const SENSITIVE_INPUT_PATTERNS = [
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i, // Email
  /^(https?:\/\/|www\.)[^\s]+$/i, // URL
  /^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$/, // Credit card
  /^[A-Za-z0-9-_]{20,}$/, // Auth tokens, API keys, hashes
  /\b(bearer\s+|token\s+|apikey\s+|key\s+)[A-Za-z0-9._-]+/i, // Bearer tokens / auth headers
  /^(eyJh|ghp_|gho_|sk_live|pk_live)[A-Za-z0-9._-]+/i, // Common API token prefixes
];

/**
 * Sanitizes and validates a lookup term.
 * Removes HTML tags, excess whitespace, and control characters.
 * Enforces length bounds (1 to 50 characters).
 */
export function sanitizeLookupTerm(term: unknown): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  if (typeof term !== "string") {
    return { valid: false, sanitized: "", error: "Please enter a valid word." };
  }

  // Strip HTML tags and control characters
  let clean = term
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();

  // Strip leading/trailing punctuation except quotes
  clean = clean.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}\p{M}]+$/gu, "");

  if (!clean || clean.length < 1) {
    return {
      valid: false,
      sanitized: "",
      error: "Please enter a word to look up.",
    };
  }

  if (clean.length > 50) {
    return {
      valid: false,
      sanitized: clean.slice(0, 50),
      error: "Search term is too long (maximum 50 characters).",
    };
  }

  // Check against sensitive patterns (emails, credit cards, auth tokens)
  for (const pattern of SENSITIVE_INPUT_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        valid: false,
        sanitized: "",
        error: "Private or sensitive content cannot be looked up.",
      };
    }
  }

  return { valid: true, sanitized: clean.toLowerCase() };
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return dp[n];
}

function collectDictionarySuggestions(
  query: string,
  candidateKeys: string[],
): string[] {
  const normalizedQuery = query
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const queryTokens = normalizedQuery.split(" ").filter((t) => t.length >= 2);
  const scored: { key: string; score: number }[] = [];

  for (const rawKey of candidateKeys) {
    const key = rawKey.toLowerCase();
    if (key === normalizedQuery) continue;

    let score = 0;
    if (key.startsWith(normalizedQuery)) {
      score = 100 - Math.abs(key.length - normalizedQuery.length);
    } else if (key.includes(normalizedQuery)) {
      score = 80 - Math.abs(key.length - normalizedQuery.length);
    } else {
      const keyTokens = key.split(/[\s-]+/).filter((t) => t.length >= 2);
      const tokenOverlap = queryTokens.some((qt) =>
        keyTokens.some((kt) => kt === qt || kt.startsWith(qt)),
      );
      if (tokenOverlap) {
        score = 65;
      } else {
        const dist = levenshtein(normalizedQuery, key);
        const maxDist = normalizedQuery.length <= 5 ? 1 : 2;
        if (dist <= maxDist && normalizedQuery.length >= 3) {
          score = 50 - dist * 10;
        }
      }
    }

    if (score > 0) {
      scored.push({ key: rawKey, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
  const unique: string[] = [];
  for (const item of scored) {
    if (!unique.includes(item.key)) {
      unique.push(item.key);
    }
    if (unique.length >= 5) break;
  }
  return unique;
}

/**
 * Looks up a term in the built-in local static dictionary.
 * Guaranteed 100% offline, zero network requests, zero hallucination.
 */
export function lookupLocalDictionary(
  term: string,
  locale = "en",
): DictionaryLookupResult {
  const check = sanitizeLookupTerm(term);
  if (!check.valid) {
    return {
      found: false,
      term: typeof term === "string" ? term : "",
      error: check.error,
    };
  }

  const query = check.sanitized.replace(/\s+/g, " ").trim();
  const hyphenToSpace = query.replace(/[-_]+/g, " ").trim();
  const candidates = Array.from(
    new Set([
      query,
      hyphenToSpace,
      ...(query.endsWith("s") && query.length > 3 ? [query.slice(0, -1)] : []),
      ...(query.endsWith("es") && query.length > 4 ? [query.slice(0, -2)] : []),
    ]),
  );
  const lang = locale.toLowerCase().split("-")[0];

  let dict = LOCAL_DICTIONARY_EN;
  if (lang === "si") dict = LOCAL_DICTIONARY_SI;
  else if (lang === "ta") dict = LOCAL_DICTIONARY_TA;

  // 1. Direct or normalized match in selected locale
  for (const candidate of candidates) {
    if (dict[candidate]) {
      return {
        found: true,
        term: candidate,
        entry: {
          word: candidate,
          ...dict[candidate],
          source: "local",
        },
      };
    }
  }

  // 2. Fallback to English dictionary if not found in translated glossary
  if (dict !== LOCAL_DICTIONARY_EN) {
    for (const candidate of candidates) {
      if (LOCAL_DICTIONARY_EN[candidate]) {
        return {
          found: true,
          term: candidate,
          entry: {
            word: candidate,
            ...LOCAL_DICTIONARY_EN[candidate],
            source: "local",
          },
        };
      }
    }
  }

  // 3. Find ranked prefix/substring/token/typo suggestions across active and English dictionaries
  const allKeys = Array.from(
    new Set([...Object.keys(dict), ...Object.keys(LOCAL_DICTIONARY_EN)]),
  );
  const suggestions = collectDictionarySuggestions(query, allKeys);

  return {
    found: false,
    term: query,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

/** Rate limiter tracking per provider to prevent request flooding. */
const lastProviderRequestMap = new Map<string, number>();

/**
 * Executes a dictionary lookup using the configured provider or falling back to the local dictionary.
 * When provider is null or undefined (provider-off), performs zero network requests.
 */
export async function lookupWord(
  term: string,
  options: {
    locale?: string;
    provider?: DictionaryProvider | null;
  } = {},
): Promise<DictionaryLookupResult> {
  const { locale = "en", provider } = options;

  const check = sanitizeLookupTerm(term);
  if (!check.valid) {
    return { found: false, error: check.error };
  }

  const query = check.sanitized;

  // 1. If no provider is configured, use local static dictionary (zero network requests)
  if (!provider) {
    return lookupLocalDictionary(query, locale);
  }

  // 2. Enforce rate limiting for external providers
  const rateLimit = provider.rateLimitMs ?? 400;
  const now = Date.now();
  const lastRequest = lastProviderRequestMap.get(provider.id) ?? 0;
  if (now - lastRequest < rateLimit) {
    return {
      found: false,
      error: "Please wait a moment before looking up another word.",
    };
  }
  lastProviderRequestMap.set(provider.id, now);

  try {
    const result = await provider.lookup(query, locale);
    if (result && result.found && result.entry) {
      return {
        ...result,
        entry: {
          ...result.entry,
          source: result.entry.source ?? "provider",
        },
      };
    }
  } catch (err) {
    // Graceful fallback to local dictionary on provider network failure
    const localFallback = lookupLocalDictionary(query, locale);
    if (localFallback.found) {
      return localFallback;
    }
    return {
      found: false,
      error:
        err instanceof Error ? err.message : "Dictionary service unavailable.",
    };
  }

  // Fallback to local dictionary if provider returned no results
  return lookupLocalDictionary(query, locale);
}
