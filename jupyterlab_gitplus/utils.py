
import re

GITHUB_REMOTE_URL_REGEX = re.compile(r"github\.com\/(.*?)\/(.*?)\.git")

def get_owner_login_and_repo_name(repo):
    owner_login, repo_name = '', ''
    remote_url = repo.remotes.origin.url
    match = GITHUB_REMOTE_URL_REGEX.search(remote_url)

    if match:
        owner_login = match.group(1)
        repo_name = match.group(2)

    return owner_login, repo_name
