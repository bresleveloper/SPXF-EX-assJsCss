




let Bresleveloper = {

    /*api calls for
    get items
    create item
    update item
    search
    getRequestDigest
    */

    getList : function getList(listTitle, callback, querystring){
        console.log('Bresleveloper SP api - getList');
        let url = Bresleveloper.ctx.web.absoluteUrl +
                    "/_api/lists/GetByTitle('" + listTitle + "')/items?" + 
                    (querystring ? querystring : '');
        Bresleveloper.AjaxSPRest(url, callback)
    },

    getListItem : function getList(listTitle, itemID, callback, querystring){
        console.log('Bresleveloper SP api - getListItem');
        let url = Bresleveloper.ctx.web.absoluteUrl +
                    "/_api/lists/GetByTitle('" + listTitle + "')/items('" + itemID + "')?" + 
                    (querystring ? querystring : '');
        Bresleveloper.AjaxSPRest(url, callback)
    },

    //payload example
    /*let data = {
        __metadata: { 'type': 'SP.Data.CouponsClickedListListItem' },
        Title: couponsObj.item.Title,
        DisplayText: couponsObj.item.DisplayText,
        UserId: couponsObj.currentUserId,
        CouponID: couponsObj.item.ID,
    }*/
    
    createItem : function createItem(listTitle, payload, callback){
        console.log('Bresleveloper SP api - createItem');
        let url = Bresleveloper.ctx.web.absoluteUrl +
                    "/_api/lists/GetByTitle('" + listTitle + "')/items"
        Bresleveloper.AjaxSPRest(url, callback, payload)
    },

    updateItem : function updateItem(listTitle, itemID, payload, callback){
        console.log('Bresleveloper SP api - updateItem');
        let url = Bresleveloper.ctx.web.absoluteUrl +
                    "/_api/lists/GetByTitle('" + listTitle + "')/items('" + itemID + "')"
        Bresleveloper.AjaxSPRest(url, callback, payload)
    },

    getUserId : function getUserId(){
        console.log('getUserId');
        try {
            function reqListener() {
                let results = JSON.parse(this.responseText)
                console.log('getUserId ajax results', results);
                Bresleveloper.currentUserId = results.d.Id
            }//end reqListener

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListener);
            oReq.open("GET", window['injected_pageContext'].web.absoluteUrl +
                "/_api/Web/CurrentUser?$select=id");
            oReq.setRequestHeader("Accept", "application/json;odata=verbose");
            oReq.send();
        } catch (e) {
            console.error('getUserId error')
            console.error(e)
        }
    },

    getRequestDigest : function getRequestDigest(callback){
        console.log('getRequestDigest');
        try {
            function reqListener2() {
                let results = JSON.parse(this.responseText)
                console.log('digest ajax results', results);
                Bresleveloper.RequestDigest = results.d.GetContextWebInformation.FormDigestValue
                callback()
            }//end reqListener

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListener2);
            oReq.open("POST", window['injected_pageContext'].web.absoluteUrl + "/_api/contextinfo");
            oReq.setRequestHeader("Accept", "application/json;odata=verbose");
            oReq.send();

        } catch (e) {
            console.error('getRequestDigest error')
            console.error(e)
        }
    },

    AjaxSPRest : function AjaxSPRest(url,callback, payload) 
    {
      try {
        let oReq = new XMLHttpRequest();
        oReq.addEventListener("load", function () {
          //if (this.status != 200 && this.status != 201 ) {
            if (this.status >= 300 ) {
              console.error('AjaxSPRest')
              console.error(JSON.parse(this.responseText))
            }
            if (this.status == 204) { // no content
                console.log('AjaxSPRest - 204')
                callback()
                return
            }
            let r = JSON.parse(this.responseText)
            let r2 = r.d ? r.d : (r.results ? r.results : r)
            console.log('AjaxSPRest result', r2)
            callback(r2)
        })
    
        let method = payload ? 'POST' : 'GET';
        //oReq.open(method, url);
        oReq.open(method, url);
        oReq.setRequestHeader("Accept", "application/json;odata=verbose");
        oReq.setRequestHeader("content-type", "application/json;odata=verbose");
    
        if (method == "POST") {
            Bresleveloper.getRequestDigest(() => {
                oReq.setRequestHeader("X-RequestDigest", Bresleveloper.RequestDigest);
                oReq.send(JSON.stringify(payload));
            });
        } else {
            oReq.send();
        }
    
      } catch (e) {
        console.error('AjaxSPRest error')
        console.error(e)
      }
    },//AjaxSPRest

    search : function search(querystring, callback) {
        try {
            function reqListenerSearchParser() {
                try {
                    let searchResultsFull = JSON.parse(this.responseText)
                    let results = searchResultsFull.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                    let arr = []

                    results.forEach(function (row) {
                        let item = {}
                        row.Cells.results.forEach(function (cell) { item[cell.Key] = cell.Value })
                        arr.push(item)
                    });

                    callback(arr);
                } catch (error) {
                    console.error('search error (reqListenerSearchParser)')
                    console.error(error)
                    callback(null)
                }
            }

            let oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListenerSearchParser);
            oReq.open("GET", _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?" + querystring);
            oReq.setRequestHeader("Accept", "application/json;odata=verbose");
            oReq.send();
        } catch (e) {
            console.error('search error')
            console.error(e)
            callback(null)
        }
    }
}//end Bresleveloper
Bresleveloper.ctx = window['injected_pageContext'];
Bresleveloper.getUserId();






