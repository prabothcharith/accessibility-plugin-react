import { AccessibilityPlugin } from "./components/AccessibilityPlugin";
import { ContrastTool } from "./components/tools/ContrastTool";
import { FontSizeTool } from "./components/tools/FontSizeTool";
import { LineHeightTool } from "./components/tools/LineHeightTool";
import { LetterSpacingTool } from "./components/tools/LetterSpacingTool";
import { TextAlignTool } from "./components/tools/TextAlignTool";
import { CursorTool } from "./components/tools/CursorTool";
import { VisualTogglesTool } from "./components/tools/VisualTogglesTool";

function App() {
  return (
    <AccessibilityPlugin
      tools={
        <>
          <ContrastTool />
          <FontSizeTool />
          <LineHeightTool />
          <LetterSpacingTool />
          <TextAlignTool />
          <CursorTool />
          <VisualTogglesTool />
        </>
      }
    >
      <div className="min-h-screen bg-background text-foreground p-8 transition-colors duration-300">
        <main className="max-w-3xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Accessibility Plugin Demo
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore the accessibility tools by clicking the settings icon in
              the bottom right.
            </p>
          </header>

          <section className="prose dark:prose-invert max-w-none">
            <h2>Sample Content</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>

            <h3>Features</h3>
            <ul>
              <li>
                <a href="#">High Contrast Modes</a>
              </li>
              <li>Adjustable Font Size</li>
              <li>Line Height & Letter Spacing</li>
              <li>Text Alignment</li>
              <li>Cursor Customization</li>
              <li>Hide Images & Highlight Links</li>
            </ul>

            <div className="my-8">
              <img
                src="https://images.unsplash.com/photo-1732456862377-036578027734?q=80&w=2070&auto=format&fit=crop"
                alt="Sample landscape"
                className="rounded-lg shadow-lg w-full h-64 object-cover"
              />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Sample image to test "Hide Images" feature
              </p>
            </div>
          </section>
        </main>
      </div>
    </AccessibilityPlugin>
  );
}

export default App;
