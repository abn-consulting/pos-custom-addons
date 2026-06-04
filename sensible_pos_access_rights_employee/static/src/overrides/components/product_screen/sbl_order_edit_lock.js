import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { OrderSummary } from "@point_of_sale/app/screens/product_screen/order_summary/order_summary";

function isOrderEditingLocked(pos) {
    return Boolean(pos.cashier?.sbl_hide_pos_numpad);
}

function isOrderlineReductionLocked(pos) {
    return Boolean(pos.cashier?.sbl_prevent_pos_orderline_reduction);
}

function showLockedDialog(dialog) {
    dialog.add(AlertDialog, {
        title: _t("Order editing disabled"),
        body: _t("This cashier is not allowed to edit order lines while the numpad is hidden."),
    });
}

function showReductionLockedDialog(dialog) {
    dialog.add(AlertDialog, {
        title: _t("Orderline removal disabled"),
        body: _t("This cashier is not allowed to reduce quantities or remove order lines."),
    });
}

patch(ProductScreen.prototype, {
    onNumpadClick(buttonValue) {
        if (isOrderEditingLocked(this.pos)) {
            this.numberBuffer.reset();
            showLockedDialog(this.dialog);
            return;
        }
        if (isOrderlineReductionLocked(this.pos) && buttonValue === "Backspace") {
            this.numberBuffer.reset();
            showReductionLockedDialog(this.dialog);
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
    async onOrderlineLongPress(ev, orderline) {
        if (isOrderEditingLocked(this.pos)) {
            showLockedDialog(this.dialog);
            return false;
        }
        if (isOrderlineReductionLocked(this.pos)) {
            showReductionLockedDialog(this.dialog);
            return false;
        }
        return super.onOrderlineLongPress(...arguments);
    },

    async updateSelectedOrderline({ buffer, key }) {
        if (isOrderEditingLocked(this.pos)) {
            this.numberBuffer.reset();
            showLockedDialog(this.dialog);
            return;
        }
        if (isOrderlineReductionLocked(this.pos) && this._isReductionOrRemoval(buffer, key)) {
            this.numberBuffer.reset();
            showReductionLockedDialog(this.dialog);
            return;
        }
        return super.updateSelectedOrderline(...arguments);
    },

    _setValue(val) {
        if (isOrderEditingLocked(this.pos)) {
            this.numberBuffer.reset();
            return;
        }
        if (isOrderlineReductionLocked(this.pos) && this._isReductionOrRemovalValue(val)) {
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
        if (isOrderlineReductionLocked(this.pos) && this._isReductionOrRemovalValue(newQuantity)) {
            this.numberBuffer.reset();
            showReductionLockedDialog(this.dialog);
            return;
        }
        return super.updateQuantityNumber(...arguments);
    },

    _isReductionOrRemoval(buffer, key) {
        return key === "Backspace" || this._isReductionOrRemovalValue(buffer === null ? "remove" : buffer);
    },

    _isReductionOrRemovalValue(value) {
        const order = this.pos.getOrder();
        let selectedLine = order?.getSelectedOrderline();
        if (!selectedLine) {
            return false;
        }
        if (selectedLine.combo_parent_id) {
            selectedLine = selectedLine.combo_parent_id;
        }
        if (value === "remove") {
            return true;
        }
        if (this.pos.numpadMode !== "quantity") {
            return false;
        }
        const nextQuantity = Number.parseFloat(value);
        return Number.isFinite(nextQuantity) && nextQuantity < selectedLine.getQuantity();
    },
});
