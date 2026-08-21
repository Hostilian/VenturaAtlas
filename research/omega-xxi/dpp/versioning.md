# DPP versioning

Every compiled or stored passport must separately record:

- ESPR/legal version;
- product-group delegated-act version;
- semantic-repository version;
- registry contract version;
- source-system snapshot version;
- compiler/validator version;
- passport content version;
- backup snapshot version.

Changes are classified as `compatible`, `migration_required`, `access_policy_change`, `identifier_change`, or `unknown`. No automatic migration may silently discard evidence or broaden access.

Retention and supersession rules remain product-group dependent and must not be guessed.

