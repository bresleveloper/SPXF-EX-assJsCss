/*!
 * Termset utilities
 */
 
let TermSetUtil = {};
let trees = [];
let masterTreesDictionary = {}
//let KornitCategoriesTermSetGuid = '939b1499-3f67-497e-adb2-e5edff570252';
let KornitCategoriesTermSetGuid = '663de3d3-8498-4500-94e6-09c9c3b40d86' ;

 
(function(module) {
 
    /**
     * Returns a termset, based on ID
     *
     * @param {string} id - Termset ID
     * @param {object} callback - Callback function to call upon completion and pass termset into
     */
    module.getTermSet = function (id, callback) {
        SP.SOD.loadMultiple(['sp.js'], function () {
            // Make sure taxonomy library is registered
            SP.SOD.registerSod('sp.taxonomy.js', SP.Utilities.Utility.getLayoutsPageUrl('sp.taxonomy.js'));
 
            SP.SOD.loadMultiple(['sp.taxonomy.js'], function () {
                let ctx = SP.ClientContext.get_current(),
                    taxonomySession = SP.Taxonomy.TaxonomySession.getTaxonomySession(ctx),
                    termStore = taxonomySession.getDefaultSiteCollectionTermStore(),
                    termSet = termStore.getTermSet(id),
                    terms = termSet.getAllTerms();
 
                ctx.load(terms);
 
                ctx.executeQueryAsync(Function.createDelegate(this, function (sender, args) {
                    callback(terms);
                }),
                //dont remove this, this is the 2nd arg for executeQueryAsync
                Function.createDelegate(this, function (sender, args) { }));
            });
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

