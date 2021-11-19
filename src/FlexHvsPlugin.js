import { FlexPlugin } from 'flex-plugin';
import { isSalesForce } from './helpers/salesforce';
import { loadScript } from './helpers/load-script';
import { log } from './helpers/log';
import { SalesForceIntegration } from './SalesForceIntegration';



const PLUGIN_NAME = 'FlexHvsPlugin';

export default class FlexHvsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex, manager) {
    log.setLevel(manager.store.getState().flex.config.logLevel || 'INFO');
    log.info(`Initialising ${PLUGIN_NAME}`);

    const sfdcBaseUrl = window.location.ancestorOrigins[0];

    if (!isSalesForce(sfdcBaseUrl)) {
      // Continue as usual
      log.warn('Not initializing Salesforce since this instance has been launched independently.');
      return;
    }

    if (!window.sforce) {
        console.log('Saleforce cannot be found');
        return;
    }

    const salesforceIntegration = new SalesForceIntegration(flex, manager, sfdcBaseUrl)
    salesforceIntegration.init();

  }

}
