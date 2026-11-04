# Tamam POS Controls (Odoo 19)

1. **Carry over open orders at Close Register.** When a manager closes a shift with unpaid
   orders still open, the dialog now offers *Carry Over to Next Shift* next to Review Orders and
   Cancel Orders. Carried orders keep their items, get a note in their history naming the
   employee who closed, and appear in the Orders list of the next shift on every device of that
   till. Empty orders are cancelled. Uses Odoo's own mechanism for orders without a session (the
   same one used for future pre-orders).
2. **No change from M-Pesa or other non-cash payments.** Validation is blocked when the non-cash
   payments are more than the bill (e.g. "1000" typed and a barcode scanned into the amount).
   Cash can still give change.
3. **Waiters (minimal role) never see Cancel Order, Refund or Pricelist.** The Sensible access
   rights template drops Odoo's own minimal-role check on these buttons; this puts it back, so a
   missing tick box on a waiter profile no longer exposes them.

Install after `sensible_pos_access_rights_employee`. Tests: `--test-tags /tamam_pos_controls`.
