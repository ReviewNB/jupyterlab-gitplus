import { PageConfig } from '@jupyterlab/coreutils';
import { Dialog } from '@jupyterlab/apputils';
import axios from 'axios';
import { show_spinner } from './index';

export const HTTP = axios.create({
  baseURL: PageConfig.getBaseUrl()
});

HTTP.defaults.headers.post['X-CSRFToken'] = _get_cookie('_xsrf');

function _get_cookie(name: string) {
  // Source: https://blog.jupyter.org/security-release-jupyter-notebook-4-3-1-808e1f3bb5e2
  const r = document.cookie.match('\\b' + name + '=([^;]*)\\b');
  return r ? r[1] : undefined;
}

export function get_server_config() {
  return HTTP.get('gitplus/expanded_server_root')
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.log(error);
    });
}

export function get_modified_repositories(
  data: {},
  show_repository_selection_dialog: Function,
  command: string,
  show_repository_selection_failure_dialog: Function
) {
  const repo_names: string[][] = [];
  return HTTP.post('gitplus/modified_repo', data)
    .then(response => {
      const repo_list = response.data;
      for (const repo of repo_list) {
        const display_name = repo['name'] + ' (' + repo['path'] + ')';
        repo_names.push([display_name, repo['path']]);
      }
      show_repository_selection_dialog(repo_names, command);
    })
    .catch(error => {
      show_repository_selection_failure_dialog();
      console.log(error);
    });
}

export function create_pull_request(
  data: {},
  show_pr_created_dialog: Function
) {
  show_spinner();
  return HTTP.post('gitplus/pull_request', data)
    .then(response => {
      const result = response.data;
      const github_url = result['github_url'];
      const reviewnb_url = result['reviewnb_url'];
      Dialog.flush(); // remove spinner
      show_pr_created_dialog(github_url, reviewnb_url);
    })
    .catch(error => {
      console.log(error);
      Dialog.flush(); // remove spinner
      show_pr_created_dialog();
    });
}

export function create_and_push_commit(
  data: {},
  show_commit_pushed_dialog: Function
) {
  show_spinner();
  return HTTP.post('gitplus/commit', data)
    .then(response => {
      const result = response.data;
      const github_url = result['github_url'];
      const reviewnb_url = result['reviewnb_url'];
      Dialog.flush(); // remove spinner
      show_commit_pushed_dialog(github_url, reviewnb_url);
    })
    .catch(error => {
      console.log(error);
      Dialog.flush(); // remove spinner
      show_commit_pushed_dialog();
    });
}
