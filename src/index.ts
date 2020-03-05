import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';


/**
 * Initialization data for the @reviewnb/gitplus extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@reviewnb/gitplus',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension @reviewnb/gitplus is activated!');
  }
};

export default extension;
