# add-css-js-to-site

This SPFx Extension is to provide CSS and JS file on a modern site for custom code.

## Great Example Content
* `./customFiles Expamples/CustomSiteScript.js` starter api, with code for read/create/update via rest api and search
* `./customFiles Expamples/coupons` for popuping coupons
* `./customFiles Expamples/popUp Messages` for popup message on load


## Set your site
Change paths in:

steps:
* add to app catalog (create if needed, add to the "distribute to SharePoint"), dont click the checkbox
* add the app (site content -> new -> app)
* create DocumentLibrary named `CustomFiles` (can be changed in the .ts file)
* add jss/css files there, names must be `CustomSiteScript.js`, `CustomSiteScript.css`

one costum solution is added under `customFiles for coupons`



### commands
once - `gulp trust-dev-cert`


`gulp serve`


`gulp build`
`gulp bundle --ship`
`gulp package-solution --ship`


`document.querySelector("#workbenchPageContent").style.maxWidth='1200px'`



`git add .`
`git commit -m "comment"`
`git push -u origin master`




[more info](https://sharepoint.stackexchange.com/questions/277352/what-is-the-best-practice-for-getting-js-and-css-files-into-a-sharepoint-modern)

