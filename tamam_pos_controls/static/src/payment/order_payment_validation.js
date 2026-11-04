import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import OrderPaymentValidation from "@point_of_sale/app/utils/order_payment_validation";

patch(OrderPaymentValidation.prototype, {
    async isOrderValid(isForceValidate) {
        const order = this.order;
        const total = order.priceIncl;
        if (total > 0) {
            // Only cash can give change. A non-cash amount (M-Pesa, card...) above the bill
            // is always a typing or barcode-scan slip, e.g. "1000" + a scanned barcode.
            const nonCash = order.payment_ids
                .filter((p) => !p.payment_method_id.is_cash_count && p.amount > 0)
                .reduce((sum, p) => sum + p.amount, 0);
            if (this.pos.currency.isPositive(nonCash - total - (order.appliedRounding || 0))) {
                this.pos.dialog.add(AlertDialog, {
                    title: _t("Amount too high"),
                    body: _t(
                        "The non-cash payments (%(paid)s) are more than the bill (%(total)s). Only cash can give change. Please correct the amount.",
                        {
                            paid: this.pos.env.utils.formatCurrency(nonCash),
                            total: this.pos.env.utils.formatCurrency(total),
                        }
                    ),
                });
                return false;
            }
        }
        return super.isOrderValid(...arguments);
    },
});
