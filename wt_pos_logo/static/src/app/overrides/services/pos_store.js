import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/services/pos_store";

patch(PosStore.prototype, {
  get idleTimeout() {
    const screenTimerInMinutes = this.config.screen_timer;
    const screenTimer = screenTimerInMinutes * 60 * 1000;

    return [
      {
        timeout: screenTimer,
        action: () =>
          this.router.state.current !== "PaymentScreen" &&
          this.navigate("SaverScreen", { config: this.config }),
      },
      {
        timeout: screenTimer,
        action: () =>
          this.router.state.current === "LoginScreen" &&
          this.navigate("SaverScreen", { config: this.config }),
      },
    ];
  },
});
