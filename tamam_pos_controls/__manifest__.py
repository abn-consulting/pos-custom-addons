{
    "name": "Tamam POS Controls",
    "summary": "Carry open orders to the next shift, keep waiter limits on Cancel and Refund",
    "version": "19.0.1.1.0",
    "category": "Point of Sale",
    "author": "ABN Consulting Group",
    "website": "https://www.abn.consulting",
    "license": "LGPL-3",
    "depends": ["point_of_sale", "sensible_pos_access_rights_employee"],
    "assets": {
        "point_of_sale._assets_pos": [
            "tamam_pos_controls/static/src/**/*",
        ],
    },
    "installable": True,
    "application": False,
}
