# DPP access rights

DPP data is not one public blob. Product-group rules may distinguish public, economic-operator, authority, service-provider, and other role-based access.

```text
subject (human/system/authority)
purpose
role
product identifier
field/subset
operation (read/write/export/restore)
validity interval
legal/source version
decision + receipt
```

Tests must cover over-broad field disclosure, expired roles, revoked providers, restored-copy parity, authority access, and data that changes classification between semantic versions. Exact classes and rules remain delegated-act dependent.

