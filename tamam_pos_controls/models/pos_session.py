from odoo import _, fields, models
from odoo.exceptions import UserError


class PosSession(models.Model):
    _inherit = "pos.session"

    def carry_over_open_orders(self, order_ids=None, employee_name=None):
        """Detach this session's open (draft) orders so the next shift picks them up.

        Odoo loads every draft order of a till when a session opens, and moves an
        order to the current session as soon as it is touched again, so an order
        without a session is simply waiting for the next shift. Empty drafts carry
        no sale and are cancelled instead.

        :param order_ids: optional ids to limit the carry over to; by default all
            open orders of the session are handled.
        :param employee_name: name of the POS employee who closed the register,
            written in the order history.
        :returns: dict with the number of orders carried over and cancelled.
        """
        self.ensure_one()
        if self.state == "closed":
            raise UserError(_("This session is already closed."))
        orders = self.get_session_orders().filtered(lambda o: o.state == "draft")
        if order_ids:
            orders = orders.filtered(lambda o: o.id in order_ids)
        empty = orders.filtered(lambda o: not o.lines)
        to_carry = orders - empty
        if empty:
            empty.action_pos_order_cancel()
        if to_carry:
            to_carry.sudo().write({"session_id": False})
            who = employee_name or self.env.user.name
            body = _(
                "Carried over to the next shift from %(session)s by %(who)s.",
                session=self.name,
                who=who,
            )
            for order in to_carry:
                order.sudo().message_post(body=body)
            self.message_post(
                body=_(
                    "%(count)s open order(s) carried over to the next shift by %(who)s: %(names)s",
                    count=len(to_carry),
                    who=who,
                    names=", ".join(to_carry.mapped("name")),
                )
            )
        return {"carried_over": len(to_carry), "cancelled": len(empty)}
