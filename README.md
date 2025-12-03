# Accessibility Plugin

A customizable, accessible, and easy-to-integrate React accessibility widget.

## Features

- **Contrast & Color Modes**: Invert, Grayscale, Low/High Saturation, Yellow on Black, White on Black, Blue on Yellow.
- **Text Adjustments**: Font Size, Line Height, Letter Spacing, Text Alignment.
- **Cursor Enhancements**: Big Cursor, Reading Guide.
- **Visual Toggles**: Hide Images, Highlight Links.
- **Drag & Drop**: Draggable trigger button.
- **Persistence**: Settings are saved in local storage (implementation pending/optional).
- **Reset**: Easily reset all settings to default.

## Installation

```bash
npm install accessibility-plugin
# or
yarn add accessibility-plugin
```

(Note: Replace `accessibility-plugin` with the actual package name if different when published).

## Usage

Wrap your application (or the part you want to be accessible) with the `AccessibilityPlugin` component.

```tsx
import { AccessibilityPlugin } from 'accessibility-plugin';
import 'accessibility-plugin/dist/style.css'; // Import styles

function App() {
  return (
    <AccessibilityPlugin>
      <YourAppContent />
    </AccessibilityPlugin>
  );
}

export default App;
```

### Custom Trigger

You can provide a custom trigger button if you don't want to use the default one.

```tsx
<AccessibilityPlugin
  trigger={
    <button className="px-4 py-2 bg-blue-600 text-white rounded">
      Open Accessibility
    </button>
  }
>
  <YourAppContent />
</AccessibilityPlugin>
```

## Development

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.
4. Build the package: `npm run build`.

## License

MIT
