# Accessibility Plugin for React

A modern, modular React accessibility plugin that helps improve the accessibility of your web applications. Built with React, TypeScript, and Framer Motion.

## Features

- 🎨 **Visual Adjustments**: Invert colors, grayscale, saturation controls, contrast adjustments
- 📝 **Text Controls**: Font size, line height, letter spacing, text alignment
- 🔗 **Link Highlighting**: Highlight all links for better visibility
- 🖱️ **Cursor Options**: Big circle cursor, reading mask, reading guide
- 🖼️ **Content Controls**: Hide images and videos
- 💾 **Persistent Settings**: Saves user preferences to localStorage
- 🎯 **Draggable Menu**: Move the accessibility menu anywhere on the screen
- 🧩 **Modular Components**: Only include the features you need

## Installation

```bash
npm install accessibility-plugin-for-react
```

## Usage

### Basic Usage (All Features)

```jsx
import { AccessibilityMenu, Cursor, Fonts, Text, Colors, Contrast, Images, Videos, ReadingTools } from 'accessibility-plugin-for-react';

function App() {
  return (
    <div>
      <AccessibilityMenu>
        <Cursor />
        <Fonts />
        <Text />
        <Colors />
        <Contrast />
        <Images />
        <Videos />
        <ReadingTools />
      </AccessibilityMenu>
      
      {/* Your app content */}
    </div>
  );
}
```

### Minimal Usage (Selected Features)

```jsx
import { AccessibilityMenu, Fonts, Colors } from 'accessibility-plugin-for-react';

function App() {
  return (
    <div>
      <AccessibilityMenu>
        <Fonts />
        <Colors />
      </AccessibilityMenu>
      
      {/* Your app content */}
    </div>
  );
}
```

## Components

### AccessibilityMenu

The main container component that provides the accessibility menu interface.

**Props:**
- `position?: 'left' | 'right' | 'top' | 'bottom'` - Initial position of the menu (default: 'right')
- `children: ReactNode` - Feature components to include

### Feature Components

- **`<Cursor />`** - Big circle cursor and reading tools
- **`<Fonts />`** - Font size adjustments
- **`<Text />`** - Line height, letter spacing, and text alignment
- **`<Colors />`** - Color inversion, grayscale, and saturation controls
- **`<Contrast />`** - Contrast adjustments (low, high, extra)
- **`<Images />`** - Show/hide images
- **`<Videos />`** - Show/hide videos
- **`<ReadingTools />`** - Reading mask and reading guide
- **`<LinkHighlight />`** - Highlight all links on the page

## Customization

You can customize the appearance by passing a custom theme or overriding CSS variables.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

PrabothCharith
