/** @odoo-module */
import { ActionpadWidget } from "@point_of_sale/app/screens/product_screen/action_pad/action_pad";
import { patch } from "@web/core/utils/patch";

patch(ActionpadWidget.prototype, {
    get sblHidePayment() {
        const employee = this.pos.getCashier();
        return employee?.sbl_hide_pos_payment || false;
    },
    get sblHideOrderButton() {
        const employee = this.pos.getCashier();
        return employee?.sbl_hide_restaurant_order_button || false;
    },
    get sblShowOriginalPayButton() {
        return !this.swapButton && !this.sblHidePayment;
    },
    get sblShowRestaurantPayButton() {
        return this.currentOrder && !this.currentOrder.isEmpty() && this.pos.numpadMode !== 'table' && !this.sblHidePayment;
    },
});
