# OMEGA XII Implementation Contract

- Main thread owns integration and high-risk writes.
- Parallel specialists are read-only independent reviewers unless explicitly assigned isolated ownership later.
- Never edit generated `_site/` as source truth.
- Never mass-edit canonical or staging data to manufacture maturity, dependency coverage, or research completion.
- New contracts must be additive where possible and preserve legacy history.
- Publisher remains deterministic: it validates upstream receipts but does not pretend to perform semantic research judgment.
- Public projection independently validates earned maturity and otherwise publishes safe unverified defaults.
- Required orchestration failure must skip dependent steps, produce a failed receipt, and return nonzero.
- Exact-artifact claims bind to the artifact actually scanned and hashed.
