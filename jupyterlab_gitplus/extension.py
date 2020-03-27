from notebook.utils import url_path_join
from .handlers import ModifiedRepositoryListHandler, PullRequestHandler, CommitHandler


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.
    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    base_url = web_app.settings['base_url']
    host_pattern = '.*$'

    gh_token = nb_server_app.config.get('GitPlus', {}).get('github_token', '')
    context = {}
    context['github_token'] = gh_token

    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'gitplus/modified_repo'), ModifiedRepositoryListHandler)])
    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'gitplus/pull_request'), PullRequestHandler, context)])
    web_app.add_handlers(host_pattern, [(url_path_join(base_url, 'gitplus/commit'), CommitHandler, context)])