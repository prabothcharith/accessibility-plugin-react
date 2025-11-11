import { 
  AccessibilityMenu, 
  Cursor, 
  Fonts, 
  Text, 
  Colors, 
  Contrast, 
  Images, 
  Videos, 
  LinkHighlight,
  ReadingTools 
} from '../../src';
import './App.css';

function App() {
  return (
    <>
      <AccessibilityMenu position="right">
        <Cursor />
        <Fonts />
        <Text />
        <Colors />
        <Contrast />
        <LinkHighlight />
        <Images />
        <Videos />
        <ReadingTools />
      </AccessibilityMenu>

      <div className="app">
        <header className="header">
          <h1>Accessibility Plugin for React</h1>
          <p>A modern, modular accessibility solution for React applications</p>
        </header>

        <section className="section">
          <h2>Welcome to the Demo</h2>
          <p>
            This is a demonstration of the Accessibility Plugin for React. Click the accessibility 
            icon (♿) in the right side of the screen to open the accessibility menu and try out 
            different features.
          </p>
          <p>
            The plugin provides a wide range of accessibility features that help users with various 
            disabilities to better interact with web content. All settings are automatically saved 
            to localStorage and will persist across page reloads.
          </p>
        </section>

        <section className="section">
          <h2>Key Features</h2>
          <div className="features">
            <div className="feature-card">
              <h3>🎨 Visual Adjustments</h3>
              <p>
                Invert colors, enable grayscale, adjust saturation levels, and control contrast 
                settings to improve readability for users with visual impairments.
              </p>
            </div>
            <div className="feature-card">
              <h3>📝 Text Controls</h3>
              <p>
                Adjust font size, line height, letter spacing, and text alignment to create a more 
                comfortable reading experience.
              </p>
            </div>
            <div className="feature-card">
              <h3>🖱️ Cursor Enhancements</h3>
              <p>
                Enable a big circle cursor for better visibility and tracking on the screen.
              </p>
            </div>
            <div className="feature-card">
              <h3>📖 Reading Tools</h3>
              <p>
                Use the reading mask or reading guide to help focus on specific lines of text and 
                reduce visual distractions.
              </p>
            </div>
            <div className="feature-card">
              <h3>🔗 Link Highlighting</h3>
              <p>
                Highlight all links on the page with a bright background to make them easier to 
                identify and click.
              </p>
            </div>
            <div className="feature-card">
              <h3>🖼️ Content Controls</h3>
              <p>
                Hide images and videos to reduce visual clutter and improve focus on text content.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>How to Use</h2>
          <p>
            Simply click on the accessibility icon on the right side of your screen. The menu is 
            draggable, so you can move it to any position that's comfortable for you. Try different 
            features and see how they improve your reading experience!
          </p>
          <p>
            All your preferences are automatically saved and will be restored the next time you 
            visit the page. Use the "Reset All Settings" button at the bottom of the menu to 
            restore default values.
          </p>
        </section>

        <section className="section demo-content">
          <h3>Test the Features Here</h3>
          <p>
            This colorful section is perfect for testing color inversion, grayscale, and saturation 
            adjustments. Try different combinations to see what works best for you.
          </p>
          <div className="links">
            <a href="#features">Test Link Highlighting</a>
            <a href="#demo">Another Link</a>
            <a href="#accessibility">Third Link</a>
          </div>
        </section>

        <section className="section">
          <h2>Installation</h2>
          <p>To use this plugin in your own React project, install it via npm:</p>
          <pre><code>npm install accessibility-plugin-for-react</code></pre>
          <p>Then import and use it in your React app:</p>
          <pre><code>{`import { 
  AccessibilityMenu, 
  Cursor, 
  Fonts, 
  Text 
} from 'accessibility-plugin-for-react';

function App() {
  return (
    <>
      <AccessibilityMenu>
        <Cursor />
        <Fonts />
        <Text />
      </AccessibilityMenu>
      {/* Your app content */}
    </>
  );
}`}</code></pre>
        </section>

        <section className="section image-section">
          <h2>Test Image Visibility</h2>
          <p>
            Use the "Hide Images" feature to hide all images on the page. This can help reduce 
            visual distractions and improve page load times.
          </p>
          <img 
            src="https://via.placeholder.com/800x400/667eea/ffffff?text=Sample+Image" 
            alt="Sample placeholder" 
          />
        </section>

        <section className="section">
          <h2>Accessibility is Important</h2>
          <p>
            Making your website accessible ensures that everyone, regardless of their abilities, 
            can access and enjoy your content. The Web Content Accessibility Guidelines (WCAG) 
            provide standards for creating accessible web content.
          </p>
          <p>
            This plugin helps implement many WCAG recommendations, making it easier for developers 
            to provide accessibility features without building everything from scratch.
          </p>
        </section>

        <section className="section">
          <h2>Modern Technology Stack</h2>
          <p>
            This plugin is built with modern technologies including React 18, TypeScript, and 
            Framer Motion for smooth animations. It uses React Context for state management and 
            CSS Modules for styling.
          </p>
          <p>
            The modular architecture means you only include the features you need, keeping your 
            bundle size small and your application performant.
          </p>
        </section>
      </div>
    </>
  );
}

export default App;
