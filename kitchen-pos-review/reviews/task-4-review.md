# Task 4 review gate — CRM and marketing

## APPROVED

Round 2 review completed 2026-08-10 against the updated Task 4 report, the brief, all 45 Task 4 screenshots, representative visual inspection of `42`–`45`, and read-only source inspection of the CRM, promotions, vouchers, and voucher-update route code.

## Accepted evidence and scope boundary

- The evidence count is **45**. The original **4 × 6** route/viewport matrix remains complete, and report references resolve to its numbered screenshots.
- `42` accurately documents a valid, active quantity-promotion create attempt that did **not** persist: the modal remains after the attempted save and the report records the observed `DexieError`. It does not misrepresent the create-dialog type coverage as a persisted status/type card.
- `43` proves the labeled voucher fixture is persisted, active, quota-limited (`0 / 2`); `44` proves its owned-fixture inactive toggle; and `45` supports the reported expiry-update mismatch when read with the documented database truth. The report correctly preserves the distinction between an attempted expiry update and an actually expired stored state.
- The fixture ledger now supplies the voucher UUID `33107313-5eb4-455e-ac36-47e3de0b8363` and its final stored values. For CRM `crm-001`, it explicitly records the critical boundary: the original UUID cannot be recovered, acceptance of the native delete prompt was not observed, and only the current absence/non-retention is established by the authorized read-only query. This is an appropriate limit, not an unsupported claim of an observed deletion action.
- The report has accurately widened the native-dialog finding: CRM, promotions, and vouchers use native `alert()` and/or `confirm()`, while their create/edit overlays lack dialog semantics. Its required remedy is an application-owned accessible dialog/error experience with title/body/actions, semantic dialog contract, focus handling, Escape/cancel, and focus restoration. This meets the system-wide rule.
- Remaining promotion persistence variants and actual expired/exhausted voucher states are clearly reported as product-blocked or unavailable under the required in-app Browser workflow; they are not substituted by fabricated/direct-database fixtures or claimed as successfully exercised.

## Review boundary

This acceptance concerns the audit report and evidence quality only. No repository/source/Git/browser/business-data changes were made during either review pass; this external review file is the only review output.
