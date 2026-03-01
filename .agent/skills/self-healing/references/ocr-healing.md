# OCR Healing Playbook

OCR (Optical Character Recognition) healing is the final level of defense in the self-healing pipeline. It uses `tesseract.js` to "read" the text on the screen and find elements based on their visible labels.

## How it Works

1. **Failure Trigger**: When both DOM and Visual healing fail, the `OcrHealingEngine` is invoked.
2. **Text Extraction**:
    - A screenshot of the page is captured.
    - Tesseract scans the entire image for text.
    - A confidence score for each detected word/phrase is generated.
3. **Fuzzy Matching**:
    - The engine fetches the `description` field of the locator from `locators.json`.
    - It performs a case-insensitive search in the extracted text for this description.
4. **Threshold**:
    - **≥ 0.7**: If the text is found with high confidence, the element is resolved using Playwright's `text=` selector.
    - **< 0.7**: Healing is marked as failed.

## Best Practices for AI Agents

- **Descriptions are Critical**: OCR healing relies entirely on the `description` field in `locators.json`. Make sure this value matches the *actual text* visible on the button or label.
- **Language Support**: Currently configured for English (`eng`). If the application is multi-lingual, the engine needs to be initialized with additional language packs.

## Troubleshooting

- **Low OCR Confidence**: This often happens with small fonts, low contrast, or complex backgrounds.
- **Verification**: If OCR finds the text but the click still fails, it might be because the text is present in multiple places. Ensure descriptions are specific enough.
