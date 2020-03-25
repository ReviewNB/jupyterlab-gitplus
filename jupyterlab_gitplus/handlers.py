import json
import git
import os
import random
import string
from notebook.base.handlers import IPythonHandler
from git import Repo
from shutil import copyfile, rmtree
from .github_v3 import create_pull_request
from .utils import get_owner_login_and_repo_name


class ModifiedRepositoryListHandler(IPythonHandler):
    '''
    Given a list of recently opened files we return repositories to which these files belong to (if the file is under a git repository)
    '''
    def post(self):
        body = json.loads(self.request.body)
        body = body['files']
        repositories = []
        unique_paths = set()
        response = []

        for file in body:
            try:
                repo = Repo(file['path'], search_parent_directories=True)

                if repo.working_dir not in unique_paths:
                    unique_paths.add(repo.working_dir)
                    repositories.append(repo)
            except git.exc.NoSuchPathError:
                print('File not found: ' + file['path'])
            except git.exc.InvalidGitRepositoryError:
                print('File is not under Git repository: ' + file['path'])

        for repo in repositories:
            path = repo.working_dir
            name = os.path.basename(path)
            response.append({
                "path": path,
                "name": name
            })

        self.finish(json.dumps(response))


class PullRequestHandler(IPythonHandler):
    def initialize(self, github_token=''):
        self.github_token = github_token

    def post(self):
        body = json.loads(self.request.body)
        file_paths = body['files']
        repo_path = body['repo_path']
        commit_msg = body['commit_message']
        pr_title = body['pr_title']
        temp_repo_path = "/tmp/temp_repo.git"
        rmtree(temp_repo_path, ignore_errors=True)
        existing_files = [repo_path + '/' + file_path for file_path in file_paths]
        new_files = [temp_repo_path + '/' + file_path for file_path in file_paths]

        repo = Repo(repo_path)
        new_repo = repo.clone(temp_repo_path)
        new_repo.remotes.origin.set_url(repo.remotes.origin.url)
        new_repo.git.checkout("master")
        new_branch_name = 'gitplus-' + ''.join(random.choices(string.ascii_lowercase + string.digits, k = 8))
        new_repo.git.checkout('-b', new_branch_name)

        for i, existing_file in enumerate(existing_files):
            copyfile(existing_file, new_files[i])

        for file in file_paths:
            new_repo.git.add(file)

        new_repo.index.commit(commit_msg)
        new_repo.git.push('--set-upstream', 'origin', new_repo.active_branch.name)
        owner_login, repo_name = get_owner_login_and_repo_name(new_repo)
        result = create_pull_request(
                owner_login=owner_login,
                repo_name=repo_name,
                title=pr_title,
                head=new_branch_name,
                base='master',
                access_token=self.github_token)
        self.finish(json.dumps(result))









