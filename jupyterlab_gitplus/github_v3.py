import json
from .requests import retriable_requests


import traceback
import logging
logger = logging.getLogger(__name__)


GITHUB_REST_ENDPOINT = 'https://api.github.com/'


def create_pull_request(owner_login, repo_name, title, head, base, access_token):
    content = {}
    url = GITHUB_REST_ENDPOINT + 'repos/' + owner_login + '/' + repo_name + '/pulls'
    headers = {
        'Authorization': 'token ' + access_token
    }
    data = {
        'title': title,
        'head': head,
        'base': base
    }

    try:
        response = retriable_requests().post(url, headers=headers, json=data)
        content = json.loads(response.content)
        response.raise_for_status()
        result = {
            'github_url': content['html_url'],
            'reviewnb_url': content['html_url'].replace('github.com', 'app.reviewnb.com')
        }
        return result
    except Exception as ex:
        logger.error('Request payload: ' + str(data))
        logger.error('API Response: ' + str(content))
        logger.error(traceback.format_exc())
        raise(ex)


def get_repository_details_for_pr(owner_login, repo_name, access_token, new_branch_name):
    '''
    Checks if the repository is forked from another repository.
    If yes, returns (parent_owner_login, parent_repo_name, owner_login:new_branch_name, parent_default_branch)
    If no, returns (owner_login, repo_name, new_branch_name, default_branch) of the repo passed in the argument.
    '''
    repo = get_repository(owner_login, repo_name, access_token)
    if repo['fork']:
        # passed in repo is a fork
        head = owner_login + ':' + new_branch_name
        return repo['parent']['owner']['login'], repo['parent']['name'], head, repo['parent']['default_branch']
    else:
        return owner_login, repo_name, new_branch_name, repo['default_branch']


def get_repository(owner_login, repo_name, access_token):
    content = {}
    url = GITHUB_REST_ENDPOINT + 'repos/' + owner_login + '/' + repo_name
    headers = {
        'Authorization': 'token ' + access_token
    }
    try:
        response = retriable_requests().get(url, headers=headers)
        content = json.loads(response.content)
        response.raise_for_status()
        return content
    except Exception as ex:
        logger.error('get_repository url: ' + str(url))
        logger.error('get_repository API Response: ' + str(content))
        logger.error(traceback.format_exc())
        raise(ex)
