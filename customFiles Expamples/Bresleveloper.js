




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
    },

    buildMegaByMMD : function buildMegaByMMD(tsGuid, title, hrefFN, position, topHref){
        //expecting 2 levels
        console.log("buildMegaByMMD get the MMD lets go!");
        TermSetUtil.getTermSetAsTree(tsGuid,function(tree){
            console.log("buildMegaByMMD we have the tree", tree);
            Bresleveloper.__buildMegaByMMD(title, tree, hrefFN, position, topHref);
        })
    },

    __buildMegaByMMD : function __buildMegaByMMD(title, tree, hrefFN, position, topHref){
        console.log("__buildMegaByMMD ");

        //expecting 2 levels
        //currently not really using position
        let q = document.querySelector.bind(document)
        let qa = document.querySelectorAll.bind(document)
        if (!position){
            position = qa(".ms-HorizontalNavItems span").length;
        }

        //build tree
        let level2Html = ''

        for (let i = 0; i < tree.children.length; i++) {
            const level2 = tree.children[i];
            let level2Href = hrefFN ? hrefFN(level2) : level2.url;

            let level3Html = ''
            for (let j = 0; j < level2.children.length; j++) {
                const level3 = level2.children[j];
                let level3Href = hrefFN ? hrefFN(level3) : level3.url;
                level3Html += Bresleveloper.templates.megaLevel3
                    .replace("#TITLE#", level3.title).replace("#HREF#", level3Href);
            }

            level2Html += Bresleveloper.templates.megaLevel2
                .replace("#TITLE#", level2.title).replace("#HREF#", level2Href)
                .replace("#CONTENT#", level3Html);
        }

        //build final html
        let megaHtml = Bresleveloper.templates.megaContainer.replace("#CONTENT#", level2Html);
        let fullItemHtml = Bresleveloper.templates.megaSpan 
            .replace("#TITLE#", title).replace("#TITLE#", title).replace("#CONTENT#", megaHtml);
        if (topHref) {
            fullItemHtml = fullItemHtml.replace("#HREF#", topHref)
        } else {
            fullItemHtml = fullItemHtml.replace('href="#HREF#"', '')
        }

        let SPAN = document.createElement("SPAN")
        SPAN.className = "ms-HorizontalNavItem"
        SPAN.setAttribute("data-automationid", "HorizontalNav-link");
        SPAN.innerHTML = fullItemHtml;

        qa(".ms-HorizontalNavItems > span").forEach(_span => 
            _span.onmouseover = function SPANclose(ev) {q("#bresleveloper-mega").className = "close";}
        );

        SPAN.onmouseover = function SPANover(ev) {
            let ootbMega = q(".ms-Layer.ms-Layer--fixed")
            if (ootbMega) { ootbMega.remove() } 
            q("#bresleveloper-mega").className = "open";
        }
        //SPAN.onmouseout = function SPANout(ev) {q("#bresleveloper-mega").className = "close";}



        let nav = q(".ms-HorizontalNavItems");
        let edit = q(".ms-HorizontalNavItems > div");

        //https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
        if (edit) {
            edit.insertAdjacentElement('beforebegin', SPAN);
        } else {
            nav.insertAdjacentElement('beforeend', SPAN);
        }

        let container = q("#bresleveloper-mega .ms-Callout.isFluent")
        container.onmouseout = function SPANout(ev) {q("#bresleveloper-mega").className = "close";}

        let megaHalfLeft = q("#bresleveloper-mega").offsetLeft/2;
        let _left = ((megaHalfLeft - q("#bresleveloper-mega").offsetWidth/2)*-1) + "px"
        container.style.left = _left;

        let _w = document.body.offsetWidth*0.6
        q("#bresleveloper-mega .ms-FocusZone ").style.width = _w + "px"

        q("#bresleveloper-mega .ms-Callout-beak").style.left = megaHalfLeft + "px"
        


    }
}//end Bresleveloper
Bresleveloper.ctx = window['injected_pageContext'];
Bresleveloper.getUserId();

Bresleveloper.templates = {
    //megaSpan : `<span class="ms-HorizontalNavItem" data-automationid="HorizontalNav-link">
    megaSpan : `<a 	class="ms-HorizontalNavItem-link is-not-selected" href="#HREF#"> #TITLE# </a>
                    <button class="ms-HorizontalNavItem-splitbutton ms-HorizontalNavItem-splitbutton-width" 
                            aria-label="#TITLE# submenu button." aria-expanded="false" 
                            role="menuitem" 
                            tabindex="-1">
                                <i 	data-icon-name="ChevronDown" 
                                    aria-hidden="true" 
                                    class="ms-HorizontalNav-chevronDown chevron-80"> \ue70d </i>
                    </button>
                    <div id="bresleveloper-mega" class="close" style="position: relative;">
                        <span class="ms-layer">#CONTENT#</span>
                    </div>`,
                //</span>`,
    megaContainer : `<div class="ms-Fabric ms-Layer-content">
    <div class="ms-Callout-container">
        <div class="ms-Callout isFluent" tabindex="-1">
            <div class="ms-Callout-beak" style=" top: -8px; position:absolute; background:white; transform:rotate(45deg);height:16px;width:16px;"></div>
            <div class="ms-Callout-beakCurtain"></div>
            <div class="ms-Callout-main" style="outline: currentcolor none medium;">
                <div tabindex="0"  class="ms-FocusZone ">
                    <div class="ms-MegaMenu-gridLayout ms-MegaMenu-gridLayout-enhanced withDivider">
                        #CONTENT#
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`,
    megaLevel2  :`<div class="ms-MegaMenu-gridLayoutItem" style="width: 300px;" data-is-focusable="true" tabindex="-1">
    <div class="ms-FocusZone">
       <ul class="ms-Menu-section ms-Menu-section-enhanced">
            <h3 class="ms-Menu-heading">
                <a href="#HREF#" 
                    data-navigationcomponent="SiteHeader" data-interception="propagate" tabindex="-1">
                        #TITLE#
                </a>
            </h3>
            #CONTENT#
        </ul>
    </div>
</div>`,
    megaLevel3 : `<li class="ms-Menu-item">
                    <a class="ms-Nav-link" href="#HREF#" target="_self" 
                        data-navigationcomponent="SiteHeader" data-interception="propagate" tabindex="-1">
                            <div class="ms-ContextualMenu-linkContent ">
                                <span class="ms-ContextualMenu-itemText ">#TITLE#</span>
                            </div>
                    </a>
                </li>`
}//end templates




/*!
 * Termset utilities
 */
 
let TermSetUtil = {};
let trees = [];
let masterTreesDictionary = {};
 
(function(module) {
 
    module.loadScripts = function () {
        console.log('Bresleveloper - TermSetUtil - loadScripts')
        let siteColUrl = Bresleveloper.ctx.site.absoluteUrl;
        return new Promise((resolve_loadScripts, reject) => {

            _spComponentLoader.loadScript(siteColUrl + '/_layouts/15/init.js', {
                globalExportsName: '$_global_init'
            }).then(() => {
                return _spComponentLoader.loadScript(siteColUrl + '/_layouts/15/MicrosoftAjax.js', {
                    globalExportsName: 'Sys'
                });
            }).then(() => {
                return _spComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.Runtime.js', {
                    globalExportsName: 'SP'
                });
            }).then(() => {
                return _spComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.js', {
                    globalExportsName: 'SP'
                });
            }).then(() => {
                return _spComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.publishing.js', {
                    globalExportsName: 'SP'
                });
            }).then(() => {
                return _spComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.requestexecutor.js', {
                    globalExportsName: 'SP'
                });
            }).then(() => {
                return _spComponentLoader.loadScript(siteColUrl + '/_layouts/15/SP.taxonomy.js', {
                    globalExportsName: 'SP'
                });
            }).then(()=> {
                console.log('resolve_loadScripts')
                resolve_loadScripts()
            });
        });
    };

    /**
     * Returns a termset, based on ID
     *
     * @param {string} id - Termset ID
     * @param {object} callback - Callback function to call upon completion and pass termset into
     */
    module.getTermSet = function (id, callback) {
        module.loadScripts().then(() => {
        console.log('loadScripts().then')

        /*SP.SOD.loadMultiple(['sp.js'], function () {
            // Make sure taxonomy library is registered
            SP.SOD.registerSod('sp.taxonomy.js', SP.Utilities.Utility.getLayoutsPageUrl('sp.taxonomy.js'));
 
            SP.SOD.loadMultiple(['sp.taxonomy.js'], function () {*/
                //let ctx = SP.ClientContext.get_current(),
                let ctx = SP.ClientContext.get_current();
                ctx["$v_0"] = Bresleveloper.ctx.site.absoluteUrl;

                let taxonomySession = SP.Taxonomy.TaxonomySession.getTaxonomySession(ctx),
                    termStore = taxonomySession.getDefaultSiteCollectionTermStore(),
                    termSet = termStore.getTermSet(id),
                    terms = termSet.getAllTerms();
 
                ctx.load(terms);
 
                ctx.executeQueryAsync(Function.createDelegate(this, function (sender, args) {
                        console.log(' getTermSet executeQueryAsync')
                        callback(terms);
                    }),
                    //dont remove this, this is the 2nd arg for executeQueryAsync
                    Function.createDelegate(this, function (sender, args) { })
                );
            //});
        });
    };
 
 
    /**
     * Returns an array object of terms as a tree
     *
     * @param {string} id - Termset ID
     * @param {object} callback - Callback function to call upon completion and pass termset into
     */
    module.getTermSetAsTree = function (id, callback) {
        module.getTermSet(id, function (terms) {
            console.log(' getTermSetAsTree cb')

            let termsEnumerator = terms.getEnumerator(),
                tree = {
                    term: terms,
                    children: []
                };
            //ariel
            let termsDict = {}
 
            // Loop through each term
            while (termsEnumerator.moveNext()) {
                let currentTerm = termsEnumerator.get_current();
                let currentTermPath = currentTerm.get_pathOfTerm().split(';');
                let children = tree.children;
 
                // Loop through each part of the path
                for (let i = 0; i < currentTermPath.length; i++) {
                    let foundNode = false;
 
                    let j;
                    for (j = 0; j < children.length; j++) {
                        if (children[j].name === currentTermPath[i]) {
                            foundNode = true;
                            break;
                        }
                    }
 
                    // Select the node, otherwise create a new one
                    let term = foundNode ? children[j] : { name: currentTermPath[i], children: [] };
 
                    // If we're a child element, add the term properties
                    if (i === currentTermPath.length - 1) {
                        term.term = currentTerm;
                        term.title = currentTerm.get_name();
                        term.guid = currentTerm.get_id().toString();
                        term.description = currentTerm.get_description();
                        term.customProperties = currentTerm.get_customProperties();
                        term.localCustomProperties = currentTerm.get_localCustomProperties();

                        term.url = '';
                        if (term.localCustomProperties && term.localCustomProperties.url) {
                            term.url = term.localCustomProperties.url;
                        }
                        if (term.localCustomProperties && term.localCustomProperties._Sys_Nav_SimpleLinkUrl) {
                            term.url = term.localCustomProperties._Sys_Nav_SimpleLinkUrl;
                        }
                    }
                    //ariel
                    termsDict[term.guid] = term;
                    masterTreesDictionary[term.guid] = term;
 
                    // If the node did exist, let's look there next iteration
                    if (foundNode) {
                        children = term.children;
                    }
                    // If the segment of path does not exist, create it
                    else {
                        children.push(term);
 
                        // Reset the children pointer to add there next iteration
                        if (i !== currentTermPath.length - 1) {
                            children = term.children;
                        }
                    }
                }
            }
 
            tree = module.sortTermsFromTree(tree);
            trees.push({tree:tree, dict:termsDict})
 
            callback(tree);
        });
    };
 
 
    /**
     * Sort children array of a term tree by a sort order
     *
     * @param {obj} tree The term tree
     * @return {obj} A sorted term tree
     */
    module.sortTermsFromTree = function (tree) {
        // Check to see if the get_customSortOrder function is defined. If the term is actually a term collection,
        // there is nothing to sort.
        if (tree.children.length && tree.term.get_customSortOrder) {
            let sortOrder = null;
 
            if (tree.term.get_customSortOrder()) {
                sortOrder = tree.term.get_customSortOrder();
            }
 
            // If not null, the custom sort order is a string of GUIDs, delimited by a :
            if (sortOrder) {
                sortOrder = sortOrder.split(':');
 
                tree.children.sort(function (a, b) {
                    let indexA = sortOrder.indexOf(a.guid);
                    let indexB = sortOrder.indexOf(b.guid);
 
                    if (indexA > indexB) {
                        return 1;
                    } else if (indexA < indexB) {
                        return -1;
                    }
 
                    return 0;
                });
            }
            // If null, terms are just sorted alphabetically
            else {
                tree.children.sort(function (a, b) {
                    if (a.title > b.title) {
                        return 1;
                    } else if (a.title < b.title) {
                        return -1;
                    }
 
                    return 0;
                });
            }
        }
 
        for (let i = 0; i < tree.children.length; i++) {
            tree.children[i] = module.sortTermsFromTree(tree.children[i]);
        }
 
        return tree;
    };
 
})(TermSetUtil);

