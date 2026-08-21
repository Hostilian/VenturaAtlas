# DPP semantic repository map

The semantic repository is the likely upstream source for shared concepts; product-group delegated acts remain the source of required passport content. The automation opportunity is versioned compilation and migration, not inventing semantics.

| Artifact | Needed compiler behavior | Current status |
|---|---|---|
| concept identifier | stable internal key | official package not captured |
| labels/definitions | multilingual docs and UI | unknown |
| datatype/cardinality | JSON Schema/types/forms | product-group dependent |
| controlled vocabulary | enums and validation | product-group dependent |
| access class | audience filtering | delegated-act dependent |
| provenance requirement | evidence link generation | delegated-act dependent |
| version/deprecation | migration diff | policy not captured |

Safe-to-build today: source-bundle checksum, deterministic model compiler, explicit unknown handling, schema diff, fixture generation, and migration reports. Unsafe-to-claim: complete legal passport generation before product-group rules and official semantics are available.

