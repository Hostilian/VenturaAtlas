# Importing Conversations Safely

1. Export only material you have the right to publish.
2. Work on a private branch first.
3. Remove API keys, passwords, cookies, tokens, financial-account details, addresses, phone numbers, academic identifiers, health information, and unnecessary personal data.
4. Preserve timestamps, source IDs, exact wording, and redaction markers.
5. Add each raw mention to `data/extraction-ledger.json`.
6. Link canonical ideas without deleting variants.
7. Update `data/sources.json` and the completeness audit.
8. Run all validation scripts.

Deleted Git content remains in history. Rotate any credential that was ever committed.
