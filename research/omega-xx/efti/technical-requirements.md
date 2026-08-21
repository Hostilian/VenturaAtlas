# eFTI technical requirements

Initial requirement inventory derived from Regulation (EU) 2020/1056 and the Commission implementation page. Mark `verify_against_final_spec` until the remaining specifications land.

| area | requirement | MVP test |
|---|---|---|
| identity/access | authenticated authority and business access | valid/invalid principal |
| integrity | preserve original values and detect mutation | hash/replay test |
| identifiers | stable shipment/document identifiers | idempotency test |
| interoperability | common data set/subsets and interfaces | schema fixture test |
| logging | operation/access history | append-only event test |
| availability | authority retrieval/access path | timeout/retry test |
| security | platform controls and access boundaries | denied-access test |
| conformance | repeatable implementation evidence | CI report |

The official page lists the 2024 common data set/subsets, access procedures and 2025 functional requirements as the legal/technical baseline.
