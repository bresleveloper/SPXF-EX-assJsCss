# add-css-js-ti-site

## Set your site
Change paths in:
* NOT NEEDED - `config/write-manifests.json` cdn path to your site and build 
* `src/extensions/AddCssJsToSiteApplicationCustomizer.ts` files paths

steps:
* after build copy `temp\deploy` folder content to CDN path
* add to app catalog, dont click the checkbox
* add the app
* add jss/css files to path in .ts file



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





