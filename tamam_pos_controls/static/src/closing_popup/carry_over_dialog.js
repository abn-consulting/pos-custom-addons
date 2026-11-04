import { Component } from "@odoo/owl";
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

    async run(callback) {
        this.props.close();
        await callback();
    }
}
