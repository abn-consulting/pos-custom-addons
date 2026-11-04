import { Component, onMounted, useRef } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";

export class CarryOverDialog extends Component {
    static template = "tamam_pos_controls.CarryOverDialog";
    static components = { Dialog };
    static props = {
        title: String,
        body: String,
        onReview: Function,
        onCarryOver: Function,
        onCancelOrders: Function,
        close: Function,
    };

    setup() {
        // Carry over is the default choice: it has focus, so Enter picks it.
        this.carryButton = useRef("carryButton");
        onMounted(() => this.carryButton.el?.focus());
    }

    async run(callback) {
        this.props.close();
        await callback();
    }
}
