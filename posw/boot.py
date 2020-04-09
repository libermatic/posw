from dotenv import load_dotenv
import os
import frappe

load_dotenv()


def boot_session(bootinfo):
    if frappe.session.user != "Guest":
        bootinfo.sentry_dsn = os.getenv("SENTRY_DSN")
