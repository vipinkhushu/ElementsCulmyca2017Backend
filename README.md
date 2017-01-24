# Elements Culmyca2017 Backend

[![N|Solid](http://manan.tech/images/index.png)](http://manan.tech)


### API DOCS v1

Base Endpoint / Ping URL

> `get` https://elementsculmyca2017.herokuapp.com/api/v1/

Event List

> `get` https://elementsculmyca2017.herokuapp.com/api/v1/eventlist

Get user details via phone number

> `get` https://elementsculmyca2017.herokuapp.com/api/v1/userinfo/phonenumber

```sh
phonenumber : 10 digit number
```
Register 

> `post` https://elementsculmyca2017.herokuapp.com/api/v1/register

```sh
phonenumber : 10 digit number
email: string
fullname: string
college: string
eventid = string
(optional)paymenttxnid = string
(optional)paymentphoneno = string
```
Get Access Token

> `post` https://elementsculmyca2017.herokuapp.com/api/v1/getAccessToken

```sh
username : string
password: string
```

Get Access Token

> `post` https://elementsculmyca2017.herokuapp.com/api/v1/getAccessToken

```sh
username : string
password: string
```
