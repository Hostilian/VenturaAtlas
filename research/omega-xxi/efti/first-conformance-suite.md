# First eFTI conformance suite

Boundary: deterministic pre-certification checks derived from the first legal/technical matrix. This suite does not issue certification and does not replace an accredited conformity assessment body.

| Test | Input/action | Expected result |
|---|---|---|
| `gate_only_authority_access` | attempt authority access outside Gate channel | denied and audited |
| `reject_invalid_gate_key` | sign request with invalid/expired Gate key | denied without data disclosure |
| `resolve_uuid_and_subsets` | valid request for permitted subset | only identified CMDS/subset returned |
| `audit_follow_up` | submit follow-up communication | request ID and receipt timestamp retrievable |
| `user_auth_matrix` | onboarded, temporary, expired, revoked users | rights applied exactly |
| `session_reauthentication` | start new session after prior authorisation | identity/auth/authz rerun |
| `least_privilege_profile` | grant one operation, one subset, bounded time | all excess operations/data denied |
| `retention_alignment` | expire CMDS retention | auth audit retained/deleted per policy and law |
| `operation_rights_matrix` | exercise create/edit/read/download/sign/stamp/archive | only authorised/applicable operations pass |
| `copy_mark_and_timestamp` | download human-readable copy | certification reference and timestamp present |
| `session_access_protection` | idle/uncontrolled-device scenario | protected against unauthorised reuse |
| `availability_by_state` | query active/inactive/archived CMDS | availability follows official state rules |
| `message_contract` | malformed and valid Gate messages | strict contract validation |
| `tributary_system_security` | rotate/revoke tributary credential | revoked key rejected; event audited |
| `data_residency` | inspect storage and backups | every copy under permitted jurisdiction |

Missing before credible suite: the remaining certification acts, official technical guidance, complete Annex state/operation rules, eDelivery profiles, real Gate fixtures, and conformity-body interpretation.

