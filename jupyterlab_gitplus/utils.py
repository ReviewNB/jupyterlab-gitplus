
import re
import os
import stat

GITHUB_REMOTE_URL_REGEX = re.compile(r"github\.com\/(.*?)\/(.*?)\.git")

def get_owner_login_and_repo_name(repo):
    owner_login, repo_name = '', ''
    remote_url = repo.remotes.origin.url

    if not remote_url.endswith('.git'):
        remote_url += '.git'

    match = GITHUB_REMOTE_URL_REGEX.search(remote_url)

    if match:
        owner_login = match.group(1)
        repo_name = match.group(2)

    return owner_login, repo_name


def onerror(func, path, exc_info):
    """
    Error handler for ``shutil.rmtree``.

    If the error is due to an access error (read only file)
    it attempts to add write permission and then retries.

    If the error is for another reason it re-raises the error.

    Usage : ``shutil.rmtree(path, onerror=onerror)``

    Copied from: https://stackoverflow.com/a/2656405/10674324
    """
    if exc_info[0].__name__ == 'FileNotFoundError':
        # folder does not exist, no need to delete
        pass
    elif not os.access(path, os.W_OK):
        # Is the error an access error ?
        os.chmod(path, stat.S_IWUSR)
        func(path)
    else:
        raise