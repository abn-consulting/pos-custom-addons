{
    "name": "POS Early Receipt Printing",
    "summary": "Print POS bills before payment without enabling restaurant mode",
    "version": "19.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Odoo Community Association (OCA), ABN Consulting Group",
    "license": "AGPL-3",
    "depends": ["pos_restaurant"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_early_receipt_printing/static/src/xml/early_receipt_button.xml",
        ],
    },
    "installable": True,
    "application": False,
}
