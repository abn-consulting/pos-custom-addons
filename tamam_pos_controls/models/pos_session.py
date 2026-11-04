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
        domain = [("session_id", "=", self.id), ("state", "=", "draft")]
        if order_ids:
            # Only whole-number ids sent by the till; anything else is ignored.
            domain.append(("id", "in", [i for i in order_ids if isinstance(i, int)]))
        orders = self.env["pos.order"].search(domain)
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
