try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

import re
from pathlib import Path

version = re.search(
    '^__version__\s*=\s*"(.*)"',
    open('jupyterlab_gitplus/__init__.py').read(),
    re.M
    ).group(1)


with open("README.md", "rb") as f:
    long_descr = f.read().decode("utf-8")

HERE = Path(__file__).parent.resolve()

# The name of the project
name = "jupyterlab_gitplus"


lab_path = (HERE / name.replace("-", "_") / "labextension")
labext_name = "@reviewnb/jupyterlab_gitplus"

data_files_spec = [
    ("share/jupyter/labextensions/%s" % labext_name, str(lab_path), "**"),
    ("share/jupyter/labextensions/%s" % labext_name, str(HERE), "install.json"),
    ("etc/jupyter/jupyter_server_config.d",
     "jupyter-config/server-config", "jupyterlab_gitplus.json"),
    # For backward compatibility with notebook server
    ("etc/jupyter/jupyter_notebook_config.d",
     "jupyter-config/nb-config", "jupyterlab_gitplus.json"),
]

setup_args = dict(
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
    include_package_data=True,
    platforms="Linux, Mac OS X, Windows",
    install_requires=[
        'jupyterlab',
        'gitpython',
        'requests',
        'urllib3',
        'jupyter_packaging'
    ]
)


from jupyter_packaging import (
    wrap_installers,
    npm_builder,
    get_data_files
)

post_develop = npm_builder(build_cmd="install:extension", source_dir="src", build_dir=lab_path)
setup_args['cmdclass'] = wrap_installers(post_develop=post_develop)
setup_args['data_files'] = get_data_files(data_files_spec)

if __name__ == "__main__":
    setup(**setup_args)
