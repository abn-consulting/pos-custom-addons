import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { OrderSummary } from "@point_of_sale/app/screens/product_screen/order_summary/order_summary";

function isOrderEditingLocked(pos) {
    return Boolean(pos.cashier?.sbl_disable_pos_order_editing);
}

function showLockedDialog(dialog) {
    dialog.add(AlertDialog, {
        title: _t("Order editing disabled"),
        body: _t("This cashier is not allowed to add, remove, or modify order lines."),
    });
}

patch(ProductScreen.prototype, {
    onNumpadClick(buttonValue) {
        if (isOrderEditingLocked(this.pos)) {
            this.numberBuffer.reset();
            showLockedDialog(this.dialog);
            return;
        }
        return super.onNumpadClick(...arguments);
    },

    async addProductToOrder(product) {
        if (isOrderEditingLocked(this.pos)) {
            showLockedDialog(this.dialog);
            return;
        }
        return super.addProductToOrder(...arguments);
    },

    async _barcodeProductAction(code) {
        if (isOrderEditingLocked(this.pos)) {
            this.numberBuffer.reset();
            showLockedDialog(this.dialog);
            return;
        }
        return super._barcodeProductAction(...arguments);
    },

    async _barcodeGS1Action(code) {
        if (isOrderEditingLocked(this.pos)) {
            this.numberBuffer.reset();
            showLockedDialog(this.dialog);
            return;
        }
        return super._barcodeGS1Action(...arguments);
    },
});

patch(OrderSummary.prototype, {
    async updateSelectedOrderline({ buffer, key }) {
        if (isOrderEditingLocked(this.pos)) {
            this.numberBuffer.reset();
            showLockedDialog(this.dialog);
            return;
        }
        return super.updateSelectedOrderline(...arguments);
    },

    _setValue(val) {
        if (isOrderEditingLocked(this.pos)) {
            this.numberBuffer.reset();
            return;
        }
        return super._setValue(...arguments);
    },

    async setLinePrice(line, price) {
        if (isOrderEditingLocked(this.pos)) {
            return;
        }
        return super.setLinePrice(...arguments);
    },

    async updateQuantityNumber(newQuantity) {
        if (isOrderEditingLocked(this.pos)) {
            this.numberBuffer.reset();
            return;
        }
        return super.updateQuantityNumber(...arguments);
    },
});
