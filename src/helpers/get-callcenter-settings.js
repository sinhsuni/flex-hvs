import { callBackGeneral } from './callback-general';

/**
 * getCallCenterSettings
 *
 * @param {boolean} isLightning   set to tru for Salesforce Lightning
 */
export const getCallCenterSettings = (isLightning = true) => {
  if (!window.sforce) {
    return;
  }

  if (!isLightning) {
    window.sforce.interaction.cti.getCallCenterSettings(callBackGeneral);
    return;
  }

  window.sforce.opencti.getCallCenterSettings({
    callback: callBackGeneral,
  });
};
