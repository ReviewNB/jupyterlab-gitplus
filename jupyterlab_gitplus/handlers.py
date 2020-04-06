import json
import git
import os
import random
import string
from notebook.base.handlers import IPythonHandler
from git import Repo
from shutil import copyfile, rmtree
from .github_v3 import create_pull_request, get_repository_details_for_pr
from .utils import get_owner_login_and_repo_name


import traceback
import logging
logger = logging.getLogger(__name__)


GITHUB_ENDPOINT = 'https://github.com/'
REVIEWNB_ENDPOINT = 'https://app.reviewnb.com/'


class ModifiedRepositoryListHandler(IPythonHandler):
    '''
    Given a list of recently opened files we return repositories to which these files belong to (if the file is under a git repository)
    '''
    def post(self):
        body = {}
        try:
            body = json.loads(self.request.body)
            body = body['files']
            repositories = []
            unique_paths = set()
            response = []

            for file in body:
                try:
                    repo = Repo(file['path'], search_parent_directories=True)

                    if GITHUB_ENDPOINT not in repo.remotes.origin.url:
                        logger.info('File is not a part of GitHub repository: ' + file['path'])
                    elif repo.working_dir not in unique_paths:
                        unique_paths.add(repo.working_dir)
                        repositories.append(repo)
                except git.exc.NoSuchPathError:
                    logger.info('File not found: ' + file['path'])
                except git.exc.InvalidGitRepositoryError:
                    logger.info('File is not under Git repository: ' + file['path'])

            for repo in repositories:
                path = repo.working_dir
                name = os.path.basename(path)
                response.append({
                    "path": path,
                    "name": name
                })

            self.finish(json.dumps(response))
        except Exception as ex:
            logger.error('gitplus/modified_repo request payload: ' + str(body))
            logger.error(traceback.format_exc())
            raise(ex)


class PullRequestHandler(IPythonHandler):
    def initialize(self, github_token=''):
        self.github_token = github_token

    def post(self):
        '''
        Create a pull request
        '''
        body = {}
        try:
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
            repo.remotes.origin.fetch(new_branch_name + ':' + new_branch_name)  # fetch newly created branch
            owner_login, repo_name = get_owner_login_and_repo_name(new_repo)
            base_owner_login, base_repo_name, head, base = get_repository_details_for_pr(owner_login, repo_name, self.github_token, new_branch_name)
            result = create_pull_request(
                    owner_login=base_owner_login,
                    repo_name=base_repo_name,
                    title=pr_title,
                    head=head,
                    base=base,
                    access_token=self.github_token)
            self.finish(json.dumps(result))
        except Exception as ex:
            logger.error('/gitplus/pull_request request payload: ' + str(body))
            logger.error(traceback.format_exc())
            raise(ex)


class CommitHandler(IPythonHandler):
    def initialize(self, github_token=''):
        self.github_token = github_token

    def post(self):
        '''
        Push commit
        '''
        body = {}
        try:
            body = json.loads(self.request.body)
            file_paths = body['files']
            repo_path = body['repo_path']
            commit_msg = body['commit_message']
            repo = Repo(repo_path)
            old_commit = repo.head.commit.hexsha

            for file in file_paths:
                repo.git.add(file)

            repo.index.commit(commit_msg)
            repo.git.push('--set-upstream', 'origin', repo.active_branch.name)  # --set-upstream will create remote branch if required
            new_commit = repo.head.commit.hexsha

            if old_commit != new_commit:
                owner_login, repo_name = get_owner_login_and_repo_name(repo)
                github_url = GITHUB_ENDPOINT + owner_login + '/' + repo_name + '/commit/' + new_commit
                reviewnb_url = REVIEWNB_ENDPOINT + owner_login + '/' + repo_name + '/commit/' + new_commit


                result = {
                    "github_url": github_url,
                    "reviewnb_url": reviewnb_url
                }

                self.finish(json.dumps(result))
        except Exception as ex:
            logger.error('/gitplus/commit request payload: ' + str(body))
            logger.error(traceback.format_exc())
            raise(ex)
