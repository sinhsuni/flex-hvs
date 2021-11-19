import { isSalesForce } from './helpers/salesforce';
import { loadScript } from './helpers/load-script';
import { log } from './helpers/log';
import { getOpenCTIScript } from './helpers/get-crm-script';


export class SalesForceIntegration {
  constructor(flex, manager, sfdcBaseUrl) {
    this.flex = flex;
    this.manager = manager;
    this.sfdcBaseUrl = sfdcBaseUrl;
    this.hvsWorkerId='';
    this.completeWorkWhen='';
    this.toVal='';
  }

  get sfApi() {
    return window.sforce.opencti;
  }


  async init() {
    const sfApiScript = getOpenCTIScript(this.sfdcBaseUrl);

    this.sfApiUrl = `${this.sfdcBaseUrl}/support/api/52.0/${sfApiScript}`;
    // Load salesforce API
    await loadScript(this.sfApiUrl);

    if (!window.sforce) {
      log.error('Saleforce cannot be found');
      return;
    }

    this.enableHvsOnWorkStart();
    this.attachListeners();
  }

  enableHvsOnWorkStart() {
    this.sfApi.hvs.onWorkStart({
      listener: function(payload){
        log.info(`onWorkStart Payload ${JSON.stringify(payload)}`);
        localStorage.setItem('hvsWorkerId', payload.workId);
        localStorage.setItem('completeWorkWhen', payload.completeWorkWhen);
        localStorage.setItem('toVal', payload.attributes.to);
      }
    });
  }

  attachListeners() {
    console.log('SFDC Plug in  attachListeners');
    this.flex.Actions.addListener('beforeAcceptTask', this.beforeAcceptTask.bind(this));
    this.flex.Actions.addListener('afterCompleteTask', this.afterCompleteTask.bind(this)); 

  }

  beforeAcceptTask(payload) {
    
    log.info(`beforeAcceptTask ==>>>>>>>>>>>>>>>>>>`);
    
    let param = {apexClass: 'TaskHelper', methodName: 'createTask', methodParams: `phoneNumber=${payload.task.attributes.outbound_to}&direction=${payload.task.attributes.direction}&channel=voice&sid=${payload.sid}`};
    param.callback = (payload) => {
      let taskId = payload.returnValue.runApex.Id;
      log.info(`beforeAcceptTask--> ${taskId}`);
      localStorage.setItem('taskId', taskId);
      this.screenPop(payload.returnValue.runApex.Id);
    }
    this.sfApi.runApex(param);
    
  }

  afterCompleteTask(payload) {

    log.info(`afterCompleteTask ==>>>>>>>>>>>>>>>>>>`);
    const hvsWorkId = localStorage.getItem("hvsWorkerId");
    const completeWorkWhen = localStorage.getItem("completeWorkWhen");
    const taskId = localStorage.getItem("taskId");

    log.info(`afterCompleteTask--> hvsWorkId ${hvsWorkId}`);
    log.info(`afterCompleteTask--> taskId ${taskId}`);

    
    let param = {apexClass: 'TaskHelper', methodName: 'fatchDesposition', methodParams: `taskId=${taskId}`};
    param.callback = (payload) => {
      log.info(`despositionCode payload--> ${JSON.stringify(payload.returnValue)}`);
      let despositionCode = payload.returnValue.runApex.Call_Result__c;
      log.info(`despositionCode--> ${despositionCode}`);

      if(hvsWorkId != "" && taskId != "")
      {
        log.info(`despositionCode--> ${despositionCode}`);
        log.info(`afterCompleteTask--> taskId ${taskId}`);
        log.info(`afterCompleteTask--> hvsWorkId ${hvsWorkId}`);

        this.sfApi.hvs.completeWork({
          workId: hvsWorkId,          
          attributes: {
            disposition: despositionCode,   
            taskId: taskId 
          },
          callback: function(){
            log.info(`Updated HVS Cadence`);
            localStorage.setItem('hvsWorkerId', "");
            localStorage.setItem('taskId', "");
          }
        });
      }
    }
    this.sfApi.runApex(param);
  }
 
  screenPop(sObjectId) {
    this.sfApi.screenPop({
      type: this.sfApi.SCREENPOP_TYPE.SOBJECT,
      params: { recordId: sObjectId }
    });
  }
}
