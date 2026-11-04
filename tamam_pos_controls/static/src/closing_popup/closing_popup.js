import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { ClosePosPopup } from "@point_of_sale/app/components/popups/closing_popup/closing_popup";
import { CarryOverDialog } from "./carry_over_dialog";
import { ask } from "@point_of_sale/app/utils/make_awaitable_dialog";

const { DateTime } = luxon;

patch(ClosePosPopup.prototype, {
    async handleClosingError(response) {
        if (response.redirect || !response.open_order_ids?.length) {
            return super.handleClosingError(...arguments);
        }
        this.dialog.add(CarryOverDialog, {
            title: response.title || _t("Open orders"),
            body: response.message,
            onReview: async () => {
                this.props.close();
                this.pos.navigate("TicketScreen");
            },
            onCarryOver: async () => {
                await this.carryOverOpenOrders(response.open_order_ids);
            },
            onCancelOrders: async () => {
                const now = DateTime.now();
                const ordersDraft = this.pos.models["pos.order"].filter(
                    (o) => !o.finalized && !(o.preset_time && o.preset_time > now)
                );
                const count = new Set([
                    ...response.open_order_ids,
                    ...ordersDraft.filter((o) => typeof o.id === "number").map((o) => o.id),
                ]).size || ordersDraft.length;
                const confirmed = await ask(this.dialog, {
                    title: _t("Cancel %s open order(s)?", count),
                    body: _t(
                        "These orders have not been paid. Cancelling removes them from today's sales and they cannot be recovered. If any bill was printed or the customer has not paid yet, choose Carry Over to Next Shift instead."
                    ),
                    confirmLabel: _t("Yes, cancel the orders"),
                    cancelLabel: _t("Go back"),
                });
                if (!confirmed) {
                    return this.handleClosingError(response);
                }
                await this.pos.deleteOrders(ordersDraft, response.open_order_ids);
                this.closeSession();
            },
        });
    },

    async carryOverOpenOrders(serverIds) {
        // Make sure orders still only on this device reach the server first.
        const synced = await this.pos.pushOrdersWithClosingPopup();
        if (!synced) {
            return;
        }
        const localIds = this.pos.models["pos.order"]
            .filter((o) => !o.finalized && typeof o.id === "number")
            .map((o) => o.id);
        const ids = [...new Set([...serverIds, ...localIds])];
        await this.pos.data.call("pos.session", "carry_over_open_orders", [this.pos.session.id], {
            order_ids: ids,
            employee_name: this.pos.getCashier?.()?.name || false,
        });
        await this.closeSession();
    },
});
