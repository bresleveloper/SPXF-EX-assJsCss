import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'AddCssJsToSiteApplicationCustomizerStrings';

const LOG_SOURCE: string = 'AddCssJsToSiteApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IAddCssJsToSiteApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class AddCssJsToSiteApplicationCustomizer
  extends BaseApplicationCustomizer<IAddCssJsToSiteApplicationCustomizerProperties> {

    
  //private _JS: string = "https://*******.sharepoint.com/sites/CommunicationSiteTopic/Shared%20Documents/MyScript.js";
  private _JS: string = "/sites/CommArielRonit/CustomFiles/CustomSiteScript.js";
  private _CSS: string = "/sites/CommArielRonit/CustomFiles/CustomSiteScript.css";

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    let message: string = this.properties.testMessage;
    if (!message) {
      message = '(No properties were provided.)';
    }

    //Dialog.alert(`Hello from ${strings.Title}:\n\n${message}`);
    console.log(`Hello from ${strings.Title}:\n\n${message}`);
    console.log('window._spPageContextInfo', window['_spPageContextInfo']);
    console.log('this.context.pageContext', this.context.pageContext);

    if (window['_spPageContextInfo']) {
      console.log('system page, moving on');
    } else {
      console.log('add csss to end of head');
      const head: any = document.getElementsByTagName("head")[0] || document.documentElement;
      let customStyle: HTMLLinkElement = document.createElement("link");
      customStyle.href = this._CSS;
      customStyle.rel = "stylesheet";
      customStyle.type = "text/css";
      head.insertAdjacentElement("beforeEnd", customStyle);


      console.log('add js to end of body');
      let myScriptTag: HTMLScriptElement = document.createElement("script");
      myScriptTag.src = this._JS;
      myScriptTag.type = "text/javascript";
      document.body.appendChild(myScriptTag);
    }

    console.log('done');
    return Promise.resolve();
  }
}
