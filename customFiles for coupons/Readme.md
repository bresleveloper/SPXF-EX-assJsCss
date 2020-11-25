# Coupons setup

* create CouponsList
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
    מיקום במסך (ימין-למעלה, שמאל- למעלה, ימין -למטה, שמאל-למטה)

* create CouponsClickedList
* add following fields
    * DisplayText     - rich html text
    * User            - user
    * CouponID        - number

flow - > uses title from CouponsList, send email 
* to user+fixed user group
* subject as title
* content as display text