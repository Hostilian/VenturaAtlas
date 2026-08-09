# Cloud-control-plane instructions

- Do not deploy or mutate cloud resources by default.
- Treat Terraform and container definitions as configured, not deployed or healthy.
- Production authentication must fail closed; placeholder, missing, and wrong credentials must fail.
- Critical stage failures must propagate to task status and process exit; readiness must test dependencies.
- Never print credentials or place Git tokens in remote URLs or process arguments.
- Prove one authoritative production writer, task reachability, least-privilege IAM, immutable image identity, bounded job execution, and complete mutation receipts.
