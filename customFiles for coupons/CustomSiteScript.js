
setTimeout(() => {
    couponsObj.ctx = window['injected_pageContext'];
    couponsObj.startCouponScript(); 
//}, 10*1000);
}, 100);

//get user ID in the end 
couponsObj = {
    /* STEPS    
        1. ask list if there is a page with our page name
        2. ask list if there are coupons left => cant make fieldA eq fieldB
        3. ask list if we are between start and end date
        4. ask list if coupon is active

        5. ask other list if user clicked this item

        6. show coupon
        7. onclick:
            7.1 retest if coupon still availabe according to steps 1-5
            7.2 create row in CouponClickedList 
            7.3 Increment CouponsList used field
            7.4 show dialog
            הלינק פותח popup שאומר congratulations לצורך העניין... ואז ברקע נשלח המייל עם פרטים
        8. remove coupon
    */
    startCouponScript : function startCouponScript(){
        console.log('startCouponScript');
        console.log('Part 1-4 - ask list for relevant coupon');
        couponsObj.getCoupon(couponsObj.hasUserClickCoupon);
    }, //end startCouponScript

    showCoupon : function showCoupon(){
        console.log('showCoupon', couponsObj.item);

        let classname = 'coupon-div ';
        //* CouponLocation           - Choise - UpperLeft, UpperRight, BottomLeft, BottomRight
        switch (couponsObj.item['CouponLocation']) {
            case 'UpperLeft': classname += "c-top c-left"; break;
            case 'UpperRight': classname += "c-top c-right"; break;
            case 'BottomLeft': classname += "c-bottom c-left"; break;
            case 'BottomRight': classname += "c-bottom c-right"; break;
        }

        let bgOjb = JSON.parse(couponsObj.item['CouponBackGround'])
        console.log('bgOjb', bgOjb);

        let coupon = document.createElement("DIV");
        coupon.className = classname;
        coupon.style.backgroundImage = `url('${bgOjb.serverRelativeUrl}')`
        coupon.onclick = couponsObj.couponClick;
        //coupon.innerHTML = `<div class="c-text" style="background-image:url('${bgOjb.serverRelativeUrl}'">${item['DisplayText']}</div>`
        coupon.innerHTML = `<div class="c-text">${couponsObj.item['DisplayText']}</div>`

        //document.body.appendChild(coupon);
        let section = document.querySelector('section.mainContent')
        section.appendChild(coupon);
    }, //end showCoupon

    getCoupon : function getCoupon(callback) {
        console.log('getCoupon');
        try {
            //querystring is "$select=...", can be null
            function reqListener() {
                //arr returns filtered by active and dates
                //need to filter coupons and page
                let arr = JSON.parse(this.responseText).d.results
                if (arr.length > 0) {
                    //filter coupons and page
                    let url = location.href.toLowerCase();
                    for (let i = 0; i < arr.length; i++) {
                        const item = arr[i];
                        let u = item['PageAddress'].toLowerCase()
                        if (url.includes(u) == true) {
                            //its our page
                            //filter coupon left
                            let total = item['TotalAmount']
                            let used = item['UsedAmount']
                            let left = total - used
                            if (left > 0) {
                                couponsObj.item = item
                                callback();
                                return;
                            }
                        }
                    }//end for
                }//end if length
                console.log('no coupon found');
                
                //NO NEED TO RETURN, the flow will just stop
            }//end reqListener

            /*$filter=(Active eq 1) and (StartDate le datetime'2020-11-25T00:00:00') and 
            (EndDate ge datetime'2020-11-26T00:00:00')*/
            //let today = new Date().toISOString();
            let todayNow = new Date().toISOString();
            todayZero = todayNow.split('T')[0] + 'T00:00:00'
            let tomorowNow = new Date();
            tomorowNow.setDate(tomorowNow.getDate() + 1);
            let tomorowZero = tomorowNow.toISOString().split('T')[0] + 'T00:00:00'

            let querystring = `$filter=(Active eq 1) and (StartDate le datetime'${todayZero}') and 
            (EndDate ge datetime'${tomorowZero}')`

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListener);
            oReq.open("GET", couponsObj.ctx.web.absoluteUrl +
                "/_api/lists/GetByTitle('CouponsList')/items?" + querystring);
            oReq.setRequestHeader("Accept", "application/json;odata=verbose");
            oReq.send();
        } catch (e) {
            console.error('getCoupon error')
            console.error(e)
            callback(null)
        }
    },

    hasUserClickCoupon : function hasUserClickCoupon(callback){
        console.log('hasUserClickCoupon ');
        //if user clicked then stop
        try {
            //querystring is "$select=...", can be null
            function reqListener() {
                //arr returns filtered by active and dates
                //need to filter coupons and page
                let arr = JSON.parse(this.responseText)//.d.results
                console.log('hasUserClickCoupon ajax results', arr);

                if (arr && arr.d && arr.d.results && arr.d.results.length > 0) {
                    console.log('user clicked this coupon b4, so not showing him it again');
                } else {
                    //else goto showCoupon
                    if (callback) {
                        callback();
                    } else {
                        couponsObj.showCoupon();
                    }
                }//end if length
                //NO NEED TO RETURN, the flow will just stop
            }//end reqListener


            //let querystring = `$filter=(Active eq 1) and (StartDate le datetime'${todayZero}') and 
            //(EndDate ge datetime'${tomorowZero}')`
            let querystring = `$filter=(CouponID eq ${couponsObj.item.ID}) and (UserId eq ${couponsObj.currentUserId})`;

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListener);
            oReq.open("GET", couponsObj.ctx.web.absoluteUrl +
                "/_api/lists/GetByTitle('CouponsClickedList')/items?" + querystring);
            oReq.setRequestHeader("Accept", "application/json;odata=verbose");
            oReq.send();
        } catch (e) {
            console.error('getCoupon error')
            console.error(e)
            callback(null)
        }
    },//end hasUserClickCoupon

    couponClick : function couponClick(){
        console.log('couponClick start');
        if (couponsObj.clicked && couponsObj.clicked == true) {
            console.log('couponClick - already clicked');
            return; //dont allow to many clikcs
        }
    /* 7. onclick:
            7.1 retest if coupon still availabe according to steps 1-5
            7.2 create row in CouponClickedList 
            7.3 Increment CouponsList used field
        8. remove coupon*/

        couponsObj.getCoupon(function doubleCheckPart1(){
            //if it got here then there is a coupon
            couponsObj.hasUserClickCoupon(function doubleCheckPart2(){
                //if it got here then user did not click
                couponsObj.clicked = true

                couponsObj.getRequestDigest(function afterRequestDigest(){
                    //7.2 create row in CouponClickedList 
                    couponsObj.createItem_CouponClickedList();
                    //7.3 Increment CouponsList used field
                    couponsObj.updateItem_CouponUsedAmount();
                    //7.4 show dialog
                    couponsObj.showDialog_congratz();
                    console.log('couponClick end');
                })
            })
        })
    },//end couponClick

    createItem_CouponClickedList : function createItem_CouponClickedList(){
        console.log('createItem_CouponClickedList');
        try {
            //querystring is "$select=...", can be null
            function reqListener() {
                //arr returns filtered by active and dates
                //need to filter coupons and page
                let res = JSON.parse(this.responseText)//.d.results
                console.log('createItem_CouponClickedList ajax results', res);
            }//end reqListener

            let data = {
                __metadata: { 'type': 'SP.Data.CouponsClickedListListItem' },
                Title: couponsObj.item.Title,
                DisplayText: couponsObj.item.DisplayText,
                UserId: couponsObj.currentUserId,
                CouponID: couponsObj.item.ID,
            }

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListener);
            oReq.open("POST", couponsObj.ctx.web.absoluteUrl +
                "/_api/lists/GetByTitle('CouponsClickedList')/items");
            oReq.setRequestHeader("Accept", "application/json;odata=verbose");
            oReq.setRequestHeader("Content-Type", "application/json;odata=verbose");
            oReq.setRequestHeader("X-RequestDigest", couponsObj.RequestDigest);
            oReq.send(JSON.stringify(data));
        } catch (e) {
            console.error('getCoupon error')
            console.error(e)
            callback(null)
        }

    },

    updateItem_CouponUsedAmount : function updateItem_CouponUsedAmount(){
        console.log('updateItem_CouponUsedAmount');
        try {
            let data = {
                __metadata: { 'type': "SP.Data.CouponsListListItem" },
                UsedAmount: couponsObj.item.UsedAmount + 1,
            }

            var oReq = new XMLHttpRequest();
            oReq.onreadystatechange = function(){
                if (this.readyState == 4 && this.status == 204) {
                    console.log('updateItem_CouponUsedAmount ajax success, b4 amount', couponsObj.item.UsedAmount);
                }
            }

            oReq.open("POST", couponsObj.ctx.web.absoluteUrl +
                `/_api/lists/GetByTitle('CouponsList')/items(${couponsObj.item.ID})`);
            oReq.setRequestHeader("Accept", "application/json;odata=verbose");
            oReq.setRequestHeader("Content-Type", "application/json;odata=verbose");
            oReq.setRequestHeader("X-RequestDigest", couponsObj.RequestDigest);

            oReq.setRequestHeader("X-HTTP-Method", "MERGE");
            oReq.setRequestHeader("IF-MATCH", "*");

            oReq.send(JSON.stringify(data));
        } catch (e) {
            console.error('getCoupon error')
            console.error(e)
            callback(null)
        }
    },

    showDialog_congratz : function showDialog_congratz(){
        console.log('showDialog_congratz');



    },

    getUserId : function getUserId(){
        console.log('getUserId');
        try {
            function reqListener() {
                let results = JSON.parse(this.responseText)
                console.log('getUserId ajax results', results);
                couponsObj.currentUserId = results.d.Id
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
                couponsObj.RequestDigest = results.d.GetContextWebInformation.FormDigestValue
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

}//end couponsObj
couponsObj.getUserId();



