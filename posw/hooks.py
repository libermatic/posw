# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__

app_name = "posw"
app_version = __version__
app_title = "posw"
app_publisher = "Libermatic"
app_description = "POS on Service Worker"
app_icon = "fa fa-shopping-basket"
app_color = "green"
app_email = "info@libermatic.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/posw/css/posw.css"
app_include_js = ["/assets/js/posw.min.js"]

# include js, css files in header of web template
# web_include_css = "/assets/posw/css/posw.css"
# web_include_js = "/assets/posw/js/posw.js"

# include js in page
page_js = {"point-of-sale": "public/js/point_of_sale.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#   "Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "posw.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "posw.install.before_install"
# after_install = "posw.install.after_install"

boot_session = "posw.boot.boot_session"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "posw.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"posw.tasks.all"
# 	],
# 	"daily": [
# 		"posw.tasks.daily"
# 	],
# 	"hourly": [
# 		"posw.tasks.hourly"
# 	],
# 	"weekly": [
# 		"posw.tasks.weekly"
# 	]
# 	"monthly": [
# 		"posw.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "posw.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "posw.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "posw.task.get_dashboard_data"
# }
