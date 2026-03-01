# Audit Logging & Troubleshooting

The Self-Healing framework maintains a detailed audit log to help developers understand why and how healing occurred.

## Log Location
Logs are stored in: `logs/healing-audit.log`

## Log Format
Each entry is a JSON object with the following fields:

| Field | Description |
|---|---|
| `timestamp` | ISO time of the event. |
| `locatorName` | The logical name used in the test. |
| `oldSelector` | The selector that failed. |
| `newSelector` | The new selector found by the engine (or "NONE"). |
| `confidence` | The score (0.0 - 1.0) of the healing attempt. |
| `method` | `DOM`, `VISUAL`, or `OCR`. |
| `success` | Boolean indicating if healing succeeded. |

## How to use Logs

### For Debugging
If a test passed but felt "slow", check the logs. You might find that a locator is constantly failing and being healed. You should update the repository with the healed locator to improve speed.

### For Verification
When implementing a new feature, intentionally break a locator and check the audit log to verify that your preferred healing method (e.g., Visual) is being triggered and succeeding with high confidence.

### Monitoring Stability
A high frequency of `OCR` healing might indicate that your DOM and Visual strategies need refinement, as OCR is the slowest fallback.
