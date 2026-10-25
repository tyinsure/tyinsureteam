# TYINSURE - Health update 2026-10-25

Source commit: b7ce368ab58c385d6de417ed0b3b84df2acd78d6

Includes Maochai Extra (3 plans, 4 exact modal rate tables), D Health Lite
combined Deduct / Copay selector and Convertible Option age selection,
conditional controls, projected premiums and report notes; Elite dropdown
labels now show coverage amounts. Existing OPD products remain included.

Run: node run-tests.mjs (37/37 suites expected).
Upload to tyinsure/tyinsureteam main, preserving unrelated files and .github/.
Keep mirrored root and dist/ website files identical; verify UPLOAD_MANIFEST.json.
Do not change GitHub Pages settings or trigger a deployment.
Do not upload .openai/, .git/, credentials or temporary runtime files.
Static website: no installation or build required; serve root or dist/ via HTTP.
