try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

import re

version = re.search(
    '^__version__\s*=\s*"(.*)"',
    open('jupyterlab_gitplus/__init__.py').read(),
    re.M
    ).group(1)


with open("README.md", "rb") as f:
    long_descr = f.read().decode("utf-8")


setup(
    name = "jupyterlab_gitplus",
    packages = ["jupyterlab_gitplus"],
    python_requires='>=3',
    version = version,
    description = "JupyterLab extension to create GitHub pull requests",
    long_description = long_descr,
    long_description_content_type="text/markdown",
    author = "Amit Rathi",
    author_email = "amit@reviewnb.com",
    url = "https://github.com/ReviewNB/jupyterlab-gitplus",
    keywords=['github', 'jupyter', 'notebook', 'pull request', 'version control', 'git'],
    install_requires=[
        'jupyterlab',
        'gitpython'
    ]
)