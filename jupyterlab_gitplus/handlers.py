import json
import git
import os
from notebook.base.handlers import IPythonHandler


class ModifiedRepositoryListHandler(IPythonHandler):
    '''
    Given a list of recently opened files we return repositories to which these files belong to (if the file is under a git repository)
    '''
    def post(self):
        body = json.loads(self.request.body)
        body = body['files']
        repositories = []
        response = []

        for file in body:
            try:
                repo = git.Repo(file['path'], search_parent_directories=True)
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




