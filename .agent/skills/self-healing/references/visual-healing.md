# Visual Healing Playbook

Visual healing is the second stage of the self-healing pipeline. It uses image template matching to find elements that have changed their DOM properties but remain visually identical.

## How it Works

1. **Failure Trigger**: If DOM-based healing fails to find a high-confidence match, the `VisualHealingEngine` is called.
2. **Template Lookup**: The engine looks for a PNG template in `resources/templates/<locatorName>.png`.
3. **Template Matching**: 
    - A screenshot of the current page is taken.
    - Template matching (via OpenCV or Jimp) searches the screenshot for the template.
    - A confidence score (0.0 to 1.0) is calculated.
4. **Threshold**: 
    - **≥ 0.75**: Considered a successful match. The engine returns a generated XPath/Selector based on the visual coordinates.
    - **< 0.75**: Falls back to the next healing stage (OCR).

## Best Practices for AI Agents

- **Template Generation**: When adding new locators, ensure a high-quality snippet of the element is saved as a template.
- **Dynamic Elements**: Avoid visual healing for elements that change appearance frequently (e.g., charts or dynamic badges) unless the overall shape remains stable.
- **Mock Implementation**: In its current scaffolded state, the engine uses Jimp for pixel comparison. For production use, `opencv-wasm` is the recommended engine for robustness against slight color/font changes.

## Troubleshooting

If visual healing fails:
- Check if the template exists in the `resources/templates` directory.
- Verify that the page is fully loaded before the screenshot is taken.
- Review `logs/healing-audit.log` for the confidence score returned.
