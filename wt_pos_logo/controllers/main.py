# -*- coding: utf-8 -*-
# Copyright (C) Wisenetic Technologies.
from email.policy import default
import os
from odoo import http
from odoo.http import request
from odoo.addons.web.controllers.binary import Binary


class Main(http.Controller):

    @http.route('/web/binary/pos_logo/<int:config_id>', type='http', auth="public")
    def pos_logo(self, config_id):
        PosConfig = request.env['pos.config'].sudo()
        config = PosConfig.browse(config_id)
        if not config.exists():
            return request.not_found()

        if (config.logo_option == 'custom'):
            return request.env['ir.binary']._get_image_stream_from(
                config,
                field_name='custom_logo',
            ).get_response()
        else:
            return Binary().company_logo()

    @http.route('/web/binary/pos_screen_saver/<int:config_id>', type='http', auth="public")
    def pos_screen_saver(self, config_id):
        PosConfig = request.env['pos.config'].sudo()
        config = PosConfig.browse(config_id)

        # CASE 1: If saver is enabled AND image exists → serve DB image
        if config.exists() and config.enable_saver_background and config.saver_background:
            return request.env['ir.binary']._get_image_stream_from(
                config,
                field_name='saver_background'
            ).get_response()

        # CASE 2: Fallback → serve static module background
        # default_path = get_resource_path(
        #     'hr_attendance',       # module name
        #     'static/img',          # folder
        #     'background-light.svg'  # file name
        # )
        default_path = False

        if not default_path or not os.path.isfile(default_path):
            return request.not_found()

        return http.send_file(
            default_path,
            filename="background-light.svg",
            mimetype="image/svg+xml"
        )
