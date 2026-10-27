# Internationalization and Locale Packs

The `accessibility-plugin-react` library includes built-in, native-speaker and accessibility-reviewed localization packs for English (`en`), Sinhala (`si`, `si-LK`), and Tamil (`ta`, `ta-LK`), along with full infrastructure for Right-to-Left (RTL) writing directions and custom locale registrations.

## Guiding Principles & Privacy

1. **Widget Scope Only**: The library's localization only translates the accessibility plugin's own widget controls, headings, hints, options, and live announcements.
2. **Untranslated Host Content**: Author host content (article paragraphs, site navigation, headings, form inputs) is **never** translated or modified by the plugin.
3. **No External Network Dependencies**: All locale strings are bundled statically. No remote dictionary APIs, external translation calls, or telemetry exist.
4. **HTML `lang` Auto-Detection**: When the `locale` prop is omitted, the widget automatically detects `document.documentElement.lang` (e.g. `<html lang="si-LK">` or `<html lang="ta-LK">`) and applies the appropriate dictionary, falling back to English.
5. **No Google Translate Mangling**: The root panel is tagged with `translate="no"`, preventing browser auto-translators from altering widget ARIA states or numeric steppers.

---

## Supported Built-in Locales

| Locale Code | Language        | Variant Codes                | Script / Writing Direction | Script Fallback Fonts                                               |
| ----------- | --------------- | ---------------------------- | -------------------------- | ------------------------------------------------------------------- |
| `en`        | English         | `en`, `en-US`, `en-GB`, etc. | Latin / LTR                | system-ui, sans-serif                                               |
| `si`        | Sinhala (සිංහල) | `si`, `si-LK`                | Sinhala / LTR              | `"Noto Sans Sinhala"`, `"Iskoola Pota"`, `"Nirmala UI"`, sans-serif |
| `ta`        | Tamil (தமிழ்)   | `ta`, `ta-LK`, `ta-IN`       | Tamil / LTR                | `"Noto Sans Tamil"`, `"Latha"`, `"Nirmala UI"`, sans-serif          |

---

## Typography & Script Fallbacks

Sinhala and Tamil are complex Brahmi scripts containing consonant conjuncts, touching characters, and dependent vowel signs. To ensure complex glyphs never clip or render with missing glpyh boxes ("tofu"), the plugin includes typography fallbacks in its scoped styling and typography features:

```css
/* Scoped fallback stack in .arap-root */
font:
  15px/1.5 system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  "Noto Sans Sinhala",
  "Iskoola Pota",
  "Noto Sans Tamil",
  "Latha",
  "Nirmala UI",
  sans-serif;
```

When users activate legible font features (via `FontFamilyController`), these scripts are protected and prioritized with verified open-license fonts (Noto Sans Sinhala / Noto Sans Tamil).

---

## Right-to-Left (RTL) Infrastructure

While Sinhala and Tamil are Left-to-Right (LTR) languages, the library includes complete RTL support for bidirectional locales (such as Arabic `ar`, Hebrew `he`, Persian `fa`, Urdu `ur`):

- **Automatic Direction Assignment**: When an RTL locale is detected via `isRtlLocale(locale)`, the panel element receives `dir="rtl"`.
- **Bidirectional Alignment**: The widget defaults to `text-align: start`, naturally aligning right in RTL and left in LTR.
- **Header Alignment**: Close button and heading automatically align in accordance with reading direction.
- **Spatial Controls Protection**: Movement arrow keys (`arap-position-arrows`) maintain spatial geometry (`← ↑ ↓ →`) regardless of writing direction.

---

## Usage Examples

### 1. Specifying Locale on the Provider

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  TextScaleController,
  ResetController,
} from "accessibility-plugin-react";

export function App() {
  return (
    <AccessibilityPlugin locale="si-LK">
      <AccessibilityButton />
      <AccessibilityList>
        <TextScaleController />
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

### 2. Automatic Detection via Document Lang

If your application sets `<html lang="ta-LK">`, simply render the plugin without the `locale` prop:

```tsx
// Document: <html lang="ta-LK">
<AccessibilityPlugin>
  <AccessibilityButton />
  <AccessibilityList>
    <TextScaleController />
    <ResetController />
  </AccessibilityList>
</AccessibilityPlugin>
// Automatically renders in Tamil ("அணுகல்தன்மை அமைப்புகள்", "பெரிய உரை", "அனைத்தையும் மீட்டமை")
```

### 3. Registering a Custom Locale

You can register custom language packs using `registerLocale`:

```tsx
import {
  registerLocale,
  enLocale,
  type LocaleStrings,
} from "accessibility-plugin-react";

const frenchLocale: LocaleStrings = {
  ...enLocale,
  title: "Paramètres d'accessibilité",
  description: "Ajustez votre expérience de lecture",
  closeLabel: "Fermer les paramètres d'accessibilité",
  resetAll: "Tout réinitialiser",
  buttonTitle: "Accessibilité",
};

registerLocale("fr", frenchLocale);

// Now <AccessibilityPlugin locale="fr-FR"> resolves frenchLocale!
```

---

## Reviewed Vocabulary Summary

### Sinhala (`si-LK`)

- **Title**: ප්‍රවේශ්‍යතා සැකසුම් (Accessibility settings)
- **Description**: ඔබේ කියවීමේ අත්දැකීම සකසා ගන්න (Adjust your reading experience)
- **Close**: ප්‍රවේශ්‍යතා සැකසුම් වසන්න (Close accessibility settings)
- **Reset All**: සියල්ල යළි සකසන්න (Reset All)
- **Move button**: බොත්තම ගෙනයන්න (Move button)
- **Button position**: බොත්තමේ පිහිටීම (Button position)
- **Statement**: ප්‍රවේශ්‍යතා ප්‍රකාශය (Accessibility Statement)

### Tamil (`ta-LK`)

- **Title**: அணுகல்தன்மை அமைப்புகள் (Accessibility settings)
- **Description**: உங்கள் வாசிப்பு அனுபவத்தை மாற்றியமைக்கவும் (Adjust your reading experience)
- **Close**: அணுகல்தன்மை அமைப்புகளை மூடுக (Close accessibility settings)
- **Reset All**: அனைத்தையும் மீட்டமை (Reset All)
- **Move button**: பொத்தானை நகர்த்து (Move button)
- **Button position**: பொத்தான் அமைவிடம் (Button position)
- **Statement**: அணுகல்தன்மை அறிக்கை (Accessibility Statement)
