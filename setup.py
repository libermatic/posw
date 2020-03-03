# -*- coding: utf-8 -*-
from setuptools import setup, find_packages
from posw import __version__

with open("requirements.txt") as f:
    install_requires = f.read().strip().split("\n")

setup(
    name="posw",
    version=__version__,
    description="POS on Service Worker",
    author="Libermatic",
    author_email="info@libermatic.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires,
)
