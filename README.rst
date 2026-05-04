POS Early Receipt Printing
==========================

This module enables Odoo's native POS bill printing flow on a regular Point of
Sale configuration, without enabling the Restaurant/Bar option.

The module depends on ``pos_restaurant`` because Odoo defines the reusable
``iface_printbill`` setting and ``clickPrintBill`` frontend action there.

Configuration
-------------

#. Go to Point of Sale settings.
#. Select the relevant Point of Sale.
#. In Bills & Receipts, enable Early Receipt Printing.
#. Save and reopen the POS session.

Usage
-----

In the POS interface, open the extra control buttons and click Bill. Odoo prints
the current open order before payment and keeps the order editable.
