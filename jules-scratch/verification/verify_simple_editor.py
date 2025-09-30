import re
import sys
import time
from playwright.sync_api import sync_playwright, Page, expect

def test_simple_editor_live_preview(page: Page):
    """
    This test verifies that the live preview in the simple card editor
    updates in real-time as the user modifies the form inputs.
    """
    # 1. Arrange: Go to the new simple generator page.
    # The dev server is running on port 3003.
    try:
        # Give the server a moment to start up
        time.sleep(10)
        page.goto("http://localhost:3003/generator/simple", timeout=60000)
    except Exception as e:
        print("Could not navigate to the page. Is the dev server running? `pnpm run dev`")
        print(f"Error: {e}")
        sys.exit(1)

    # Wait for page to load by looking for the main heading.
    expect(page.get_by_role("heading", name="Create Your Card")).to_be_visible(timeout=30000)

    # 2. Act & Assert: Interact with each form element and verify the preview updates.

    # a. Change the message
    message_input = page.get_by_label("Message")
    new_message = "Hello, World! This is a test."
    message_input.clear()
    message_input.fill(new_message)

    # Locate the preview panel to check for updates
    preview_panel = page.locator("div[style*='background-color']")
    expect(preview_panel).to_have_text(new_message, timeout=10000)

    # b. Change the background color
    # Use a more specific locator for the text input for the hex code
    color_input = page.locator('input[type="text"][value^="#"]')
    new_color_hex = "#D1E7DD"
    color_input.fill(new_color_hex)
    # Use a less strict assertion for the style attribute
    expect(preview_panel).to_have_attribute("style", re.compile(r"background-color: rgb\(209, 231, 221\);"))

    # c. Change the font style
    font_select_trigger = page.get_by_label("Font Style")
    font_select_trigger.click()
    page.get_by_role("option", name="Caveat").click()
    expect(preview_panel).to_have_attribute("style", re.compile('font-family: "Caveat"'))

    # 3. Screenshot: Capture the final state for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot saved to jules-scratch/verification/verification.png")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_simple_editor_live_preview(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred during verification: {e}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    main()