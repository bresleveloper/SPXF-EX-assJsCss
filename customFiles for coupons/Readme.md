# Coupons setup

## create CouponsList
* add following fields - ALL REQUIRED
    * PageAddress (כתובת דף)  - text
    * CouponBackGround         - text
    * StartDate                - date
    * EndDate                  - date
    * TotalAmount              - number
    * UsedAmount               - number
    * DisplayText              - rich html text
    * CouponLocation           - Choise - UpperLeft, UpperRight, BottomLeft, BottomRight
    * Active                   - boolean (default true)

## create CouponsClickedList
* add following fields
    * User            - user
    * CouponID        - number

## flow - > uses title from CouponsList, send email 
* (instructions)[https://bresleveloper.blogspot.com/2020/11/power-automation-flow-send-email-with.html]
* added zip, import and set to the right site