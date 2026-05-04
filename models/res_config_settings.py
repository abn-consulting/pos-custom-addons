from odoo import api, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    @api.depends("pos_module_pos_restaurant", "pos_config_id")
    def _compute_pos_module_pos_restaurant(self):
        """Allow bill printing to stay enabled outside restaurant mode.

        Odoo's pos_restaurant computes both bill printing and bill splitting
        as false when the Restaurant/Bar option is disabled. For this module,
        bill printing is the one feature we intentionally expose on a normal
        POS; bill splitting remains restaurant-only.
        """
        for settings in self:
            if settings.pos_module_pos_restaurant:
                settings.update(
                    {
                        "pos_iface_printbill": settings.pos_config_id.iface_printbill,
                        "pos_iface_splitbill": settings.pos_config_id.iface_splitbill,
                    }
                )
            else:
                settings.update(
                    {
                        "pos_iface_printbill": settings.pos_config_id.iface_printbill,
                        "pos_iface_splitbill": False,
                    }
                )
