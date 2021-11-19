import { log } from './log';

const success = msg => log.info('API method call executed successfully! returnValue:', msg);
const fail = msg => log.error('Something went wrong!', msg);

export const callBackGeneral = response => {
  log.info(`Success log ${JSON.stringify(response.returnValue)}`);
  if (response && response.returnValue) {
    success(response.returnValue);
    return;
  }

  if (response && response.error) {
    return fail(response.error);
  }

  return response && response.success ? success(response.returnValue) : fail(response && response.errors);
};
