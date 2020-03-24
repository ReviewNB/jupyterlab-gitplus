import json
from requests import retriable_requests


GITHUB_REST_ENDPOINT = 'https://api.github.com/'

def create_pull_request(owner_login, repo_name, title, head, base, access_token):
    content = {}
    url = GITHUB_REST_ENDPOINT + 'repos/' + owner_login + '/' + repo_name + '/pulls'
    headers = {
        'Authorization': 'token ' + access_token,
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
            'github_url': response['html_url'],
            'reviewnb_url': response['html_url'].replace('github.com', 'app.reviewnb.com')
        }
        return result
    except Exception as ex:
        print(content)
        raise(ex)
