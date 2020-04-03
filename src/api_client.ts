import { PageConfig } from "@jupyterlab/coreutils";
import { Dialog } from "@jupyterlab/apputils";
import axios from 'axios';
import { show_spinner } from './index';

export const HTTP = axios.create({
    baseURL: PageConfig.getBaseUrl()
});


export function get_modified_repositories(data: {}, show_repository_selection_dialog: Function, command: string) {
    let repo_names: string[][] = []
    return HTTP.post("gitplus/modified_repo", data)
        .then(function (response) {
            let repo_list = response.data;
            for (const repo of repo_list) {
                let display_name = repo['name'] + ' (' + repo['path'] + ')';
                repo_names.push([display_name, repo['path']])
            }
            show_repository_selection_dialog(repo_names, command);
        })
        .catch(function (error) {
            console.log(error)
        });
}


export function create_pull_request(data: {}, show_pr_created_dialog: Function) {
    show_spinner();
    return HTTP.post("gitplus/pull_request", data)
        .then(function (response) {
            let result = response.data;
            let github_url = result['github_url']
            let reviewnb_url = result['reviewnb_url']
            console.log(`${github_url} --create_pull_request-- ${reviewnb_url}`);
            Dialog.flush(); // remove spinner
            show_pr_created_dialog(github_url, reviewnb_url)
        })
        .catch(function (error) {
            console.log(error)
        });
}


export function create_and_push_commit(data: {}, show_commit_pushed_dialog: Function) {
    show_spinner();
    return HTTP.post("gitplus/commit", data)
        .then(function (response) {
            let result = response.data;
            let github_url = result['github_url']
            let reviewnb_url = result['reviewnb_url']
            console.log(`${github_url} --create_and_push_commit-- ${reviewnb_url}`);
            Dialog.flush(); // remove spinner
            show_commit_pushed_dialog(github_url, reviewnb_url)
        })
        .catch(function (error) {
            console.log(error)
        });
}