import { PageConfig } from "@jupyterlab/coreutils";
import axios from 'axios';

export const HTTP = axios.create({
    baseURL: PageConfig.getBaseUrl()
});


export function get_modified_repositories(data: {}, show_repository_selection_dialog: Function) {
    let repo_names: string[][] = []
    return HTTP.post("gitplus/modified_repo", data)
        .then(function (response) {
            let repo_list = response.data;
            for (const repo of repo_list) {
                let display_name = repo['name'] + ' (' + repo['path'] + ')';
                repo_names.push([display_name, repo['path']])
            }
            show_repository_selection_dialog(repo_names);
        })
        .catch(function (error) {
            console.log(error)
        });
}