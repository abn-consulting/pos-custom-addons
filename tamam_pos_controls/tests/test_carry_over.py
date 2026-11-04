from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@tagged("post_install", "-at_install")
class TestCarryOverOpenOrders(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.config = cls.basic_config
        cls.product = cls.create_product("Carry Tea", cls.categ_basic, 100.0)

    def _draft_order(self, with_line=True):
        order = self.env["pos.order"].create({
            "session_id": self.pos_session.id,
            "company_id": self.env.company.id,
            "amount_total": 100.0 if with_line else 0.0,
            "amount_tax": 0.0,
            "amount_paid": 0.0,
            "amount_return": 0.0,
            "lines": [(0, 0, {
                "product_id": self.product.id,
                "qty": 1,
                "price_unit": 100.0,
                "price_subtotal": 100.0,
                "price_subtotal_incl": 100.0,
            })] if with_line else [],
        })
        return order

    def test_carry_over_then_close(self):
        self.open_new_session()
        full = self._draft_order()
        empty = self._draft_order(with_line=False)
        res = self.pos_session.carry_over_open_orders(employee_name="Manager X")
        self.assertEqual(res, {"carried_over": 1, "cancelled": 1})
        self.assertFalse(full.session_id)
        self.assertEqual(full.state, "draft")
        self.assertEqual(empty.state, "cancel")
        self.assertIn("Manager X", full.message_ids[0].body)
        # The register now closes without the draft-orders error.
        self.pos_session.action_pos_session_closing_control()
        self.assertEqual(self.pos_session.state, "closed")
        # The carried-over order still loads for the till in the next shift.
        domain = self.env["pos.order"]._load_pos_data_domain({}, self.config)
        self.assertIn(full, self.env["pos.order"].search(domain))

    def test_order_ids_limit(self):
        self.open_new_session()
        a = self._draft_order()
        b = self._draft_order()
        self.pos_session.carry_over_open_orders(order_ids=[a.id])
        self.assertFalse(a.session_id)
        self.assertEqual(b.session_id, self.pos_session)
