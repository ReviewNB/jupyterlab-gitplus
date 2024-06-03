
import json
from pathlib import Path
from urllib.parse import urlparse
import logging
logger = logging.getLogger(__name__)

from ._version import __version__

from notebook.utils import url_path_join
from .handlers import ModifiedRepositoryListHandler, PullRequestHandler, CommitHandler, ServerConfigHandler

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)

def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": data["name"]
    }]


def _jupyter_server_extension_paths():
    return [{
        "module": "jupyterlab_gitplus"
    }]


__version__ = "0.3.3"


def _load_jupyter_server_extension(nb_server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    nb_server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    web_app = nb_server_app.web_app
    base_url = web_app.settings['base_url']
    server_root_dir = web_app.settings['server_root_dir']
    host_pattern = '.*$'

    gh_token = nb_server_app.config.get('GitPlus', {}).get('github_token', '')
    reviewnb_endpoint =  nb_server_app.config.get('GitPlus', {}).get(
        'self_hosted_reviewnb_endpoint',
        'https://app.reviewnb.com/'
    )
    try:
        x = urlparse(reviewnb_endpoint)
        if x.path not in ["", "/"]:
            raise ValueError(f"reviewnb_endpoint URL must not have a path component. Probably you should change it to https://{x.netloc}/")
        if not reviewnb_endpoint.endswith("/"):
            reviewnb_endpoint += "/"
        logger.info(f"Reviewnb_endpoing has been set to: {reviewnb_endpoint}")
    except ValueError:
        logger.error(f"Unable to parse GitPlus.reviewnb_endpoint, value was {reviewnb_endpoint}")
        raise

    context = {}
    context['github_token'] = gh_token
    context['server_root_dir'] = server_root_dir
    context['reviewnb_endpoint'] = reviewnb_endpoint

    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'gitplus/expanded_server_root'), ServerConfigHandler, {"context": context})])
    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'gitplus/modified_repo'), ModifiedRepositoryListHandler, {"context": context})])
    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'gitplus/pull_request'), PullRequestHandler, {"context": context})])
    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'gitplus/commit'), CommitHandler, {"context": context})])
    nb_server_app.log.info("Registered GitPlus extension at URL path /jupyterlab-gitplus")


# For backward compatibility with notebook server - useful for Binder/JupyterHub
load_jupyter_server_extension = _load_jupyter_server_extension
