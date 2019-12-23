/*
    This function parses the call
*/
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const request = require('request');


const firebaseConfig = {
    apiKey: "AIzaSyB4IV-tlnFXP09Df_i_dKn1Wm3jHX9ObJQ",
    authDomain: "gympanzee-v-1-0.firebaseapp.com",
    databaseURL: "https://gympanzee-v-1-0.firebaseio.com",
    projectId: "gympanzee-v-1-0",
    storageBucket: "gympanzee-v-1-0.appspot.com",
    messagingSenderId: "629024763027",
    appId: "1:629024763027:web:f2e4e723bb7cfeef93f166"
  };

var textLocal = {
    apiKey: "+Hc2/CYYkCY-WBtwCqLXtGUkH9aIu04FhXYy5chlpr",
    sender: "GPNZEE"
}   

admin.initializeApp(firebaseConfig);

//Get gym info
exports.getGymInfo = functions.https.onRequest((req, res) => {
    cors(req, res, () => {     

        //option helps in switching between different modes in a function
        //option == "count"  --> will give the number of data requesting callbacks 
        //option == "data"   --> will get the data of all users in json   
        const option = req.query.option;
        var filter = "";
        filter = req.query.filter;

        return new Promise(function(resolve, reject)
        {     
            var data=[];
            var count=0;

            //return details of a gym with the given id
            if(option=="uid")
            {
                var uid = req.query.uid;
                admin.firestore()       //get firestore reference
                .collection("gyms")     //get collection named "gyms"
                .doc(uid)
                .get()
                .then(function(doc)
                {
                    var data = doc.data();
                    var date = data.date;
                    var seconds = date._seconds;
                    var nseconds = date._nanoseconds;
                    var date= (new admin.firestore.Timestamp(seconds,nseconds)).toDate();

                    date.setHours(date.getHours() + 5);
                    date.setMinutes(date.getMinutes() + 30);

                    var year    = ('00'+date.getFullYear());
                    var month   = ('00'+date.getMonth());
                    var day     = ('00'+date.getDay());
                    var hour    = ('00'+date.getHours());
                    var minute  = ('00'+date.getMinutes());

                    var strDate = `${day}/${month}/${year} ${hour}-${minute}`;

                    console.log(strDate);

                    data.date = strDate;
                
                    res.send(JSON.stringify(data));   
                });
            }

            //
            else
            admin.firestore()       //get firestore reference
            .collection("gyms")     //get collection named "gyms"
            .where("registrationStatus", "==", filter)  //filter documents with field password == ""
            .get()
            .then(function(querySnapshot) 
            {
                if(option == "count")
                {
                    count = querySnapshot.size;

                    //send data
                    res.send(count+'');
                }
                else if (option == "data" || option == null || option =="")
                {

                    //iterate through all the data present in the database
                    querySnapshot.forEach(function(doc) 
                    {
                        //Get uid
                        var size = data.length;
                        data[size] = doc.data();
                        data[size]._uid_ = doc.id;
                        
                        //Generate Date obj from Timestamp
                        var _date = data[size].date===undefined?{_seconds:0, _nanoseconds:0}:data[size].date;
                        var seconds = _date._seconds;
                        var nseconds = _date._nanoseconds;
                        date= (new admin.firestore.Timestamp(seconds,nseconds)).toDate();

                        date.setHours(date.getHours() + 5);
                        date.setMinutes(date.getMinutes() + 30);

                        var year    = ('00'+date.getFullYear()).slice(-4);
                        var month   = ('00'+date.getMonth()+1).slice(-2);
                        var day     = ('00'+date.getDate()).slice(-2);
                        var hour    = ('00'+date.getHours()).slice(-2);
                        var minute  = ('00'+date.getMinutes()).slice(-2);

                        var strDate = `${day}/${month}/${year} ${hour}-${minute}`;

                        console.log(strDate);

                        //send appended data
                        data[size].date = strDate;
                    
                    });



                    //send data
                     res.send(JSON.stringify(data));
                }
                else
                {
                    res.send("Use 'url?option=count' or 'url?option=data'");
                }

            });

        });
    });      
});

//OTP 
//OTP Generation and Sending 
exports.generateOTP = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const number = req.query.number;
        const username = req.query.username;

        return new Promise(function(resolve, reject)
        {    
            var rnd6 = Math.floor(100000 + Math.random() * 900000)+"";
            var msg = `Your OTP for Partner On-boarding process is ${rnd6}.\n\nKindly share it with our Representative.\nSender: Gympanzee.\nhttps://tx.gl/r/n0qG`; 

            //send it to a temp database
            admin.firestore()
            .collection("Temp").doc("OTP")
            .collection("NewPartner").doc(username)
            .set({
                otp: `${rnd6}`
            })
            
            var url = `https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=${number}&sender=${textLocal.sender}&message=${msg}`;

            request(url, function (error, response, body) {
                console.log('msg',msg);
                console.log('body:', body);
             
                //for debug
                res.send(``); 
               
            });

        });
    });      
});

//OTP Validation and adding user
exports.addPartner = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        //flag == 144 => add partner
        const refby=req.query.refby;
        const flag=req.query.flag;
        const otp = req.query.otp;
        const number = req.query.number;
        const username = req.query.username;
        const email = req.query.email;
        const name = req.query.name;
        const _number_ = number.substring(2,number.length);

        return new Promise(function(resolve, reject)
        {    
            console.log(flag + " "+ number + " " + "started ")

            admin.firestore()
            .collection("Temp").doc("OTP")
            .collection("NewPartner").doc(username)
            .get()
                .then(function(doc)
                {
                    console.log(doc.data())
                    if(doc.data().otp == otp)
                    {
                        var rnd6 = (Math.floor(100000 + Math.random() * 900000)) + "";

                        console.log(`OTP matched ${doc.data().otp},${otp}`)
                        var _data = {
                            name: name,
                            registrationStatus: "partnerAdded",
                            username: username,
                            password: rnd6+"",
                            phone: _number_,
                            email: email,
                            unique_pin: rnd6,
                            refby: refby===undefined?"":refby
                        }

                        if(flag !="144") 
                        {
                            _data.registrationStatus = "addedForApproval";
                        }
                        console.log("data created "+_data)
                        admin.firestore()
                        .collection("gyms")
                       // .where("registrationStatus","==","callbackSeen")
                        .where("number","==",`${_number_}`)
                        .get()
                        .then(
                            function(snap)
                            {
                                console.log("searching callbackseen requests")
                                snap.forEach(function(doc) {
                                    
                                    //if(doc.data().registrationStatus == "callbackSeen")
                                    {
                                        console.log("found result")
                                        const uid = doc.id;
                                        const pin = doc.data().unique_pin;
                                        admin.firestore().collection("gyms")
                                              .doc(uid).update(_data)
                                              .then(function()
                                            {
                                                // Check if flag == 144
                                                // Send Username and password by calling 
                                                // else do nothing
                                                if(flag=='144')
                                                {
                                                    console.log("adding otp")
                                                    var messageUrl = getMessageUrl(number,pin,_data.password,_data.username);
                                                    request(messageUrl, function (error, response, body) {
                                                        console.log('msg',msg);
                                                        console.log('body:', body);
                                                    
                                                        res.send(_data);
                                                    
                                                    });
                                            
                                                }
                                                res.send('error in sending data to user');
                                               /* else

                                                if(flag !='144' && refby!=undefined)
                                                admin.firestore().collection("Temp")
                                                .doc("RequestedBy").collection("RefBy").doc(uid)
                                                .set({refby: refby}).then
                                                (function()
                                                {
                                                    console.log('msg',msg);
                                                    console.log('body',body);
                                                    res.send('success');
                            

                                                })*/

                                            });
                                    }
                                  /*  else
                                    {
                                        res.send('error : '+'partner has not been seen')
                                    }*/

                                });

                                res.send('error : request not seen')
                            }
                        );

                    }  
                    else
                    {
                        console.log(flag + " "+ number + " " + "error , "+otp+", "+doc.data().otp)

                        res.send('error');
                    } 
                });   

        });
    });      
});

//set Stage of completion of gym
exports.setGymStage = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const uid=req.query.uid;
        const stage = req.query.stage;

        return new Promise(function(resolve, reject)
        {    
            var _data = {registrationStatus: stage};

            admin.firestore().collection("gyms")
            .doc(uid)
            .update(_data)
            .then(function() {
                console.log("Document successfully written!");
                res.send(_data);
            })
            ;


        });
    });      
});

//check user name already exist in database
exports.validateUsername = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const username=req.query.username;

        return new Promise(function(resolve, reject)
        {    

            admin.firestore()
            .collection("gyms")
            .where("username","==",username)
            .get()
            .then(function(querySnapshot) 
            {
                if(querySnapshot.empty)
                res.send("valid");
                else
                res.send("alreadytaken");
            });


        });
    });      
});

//approval
exports.addPartnerAfterApproval = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const uid = req.query.uid;
        admin.firestore()       //get firestore reference
        .collection("gyms")     //get collection named "gyms"
        .doc(uid)
        .get()
        .then(function(doc) 
        {
            const mob = doc.data().number;
            const pin = doc.data().unique_pin;
            const pass = doc.data().password;
            const usrnm = doc.data().username;

            var _data = {registrationStatus: "partnerAdded"};

            admin.firestore().collection("gyms")
            .doc(uid)
            .update(_data)
            .then(function() {
                var url = getMessageUrl(`91${mob}`,pin,pass,usrnm);
                request(url, function (error, response, body) {
                    console.log('msg',msg);
                    console.log('body:', body);
                 
                    res.send(_data);
                   
                });
               
            })
            ;
           


            res.send("added");
        });
          
    });      
});

exports.rejectApprovalRequest = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const uid = req.query.uid;
        admin.firestore()
        .collection("gyms").doc(uid)
        .delete().then(function() {
            res.send("deleted");
         
        }).catch(function(error) {
            res.send("error");

        });
    });      
});

exports.checksms = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const mob = "7004219327";
        const pin ="100000";
        const pass="098989";
        const usrnm = "ShubhamKumar";

        var obj = getMessageUrl(`91${mob}`,pin,pass,usrnm);
        var url = obj.url;
        var msg = obj.msg;

                request(url, function (error, response, body) {
                    console.log(msg);
                    console.log( body);
                 
                    res.send(body);
                   
                });
    });      
});

function getMessageUrl(mob,pin,pass,usrnm)
{
    var msg = String.raw`Congratulations! Your GympanzeeClub account has been approved. Your Partner's Identification Number (PIN) is ${pin}%nPlease use this PIN for all future communications.%nLogin to GympanzeeClub Android app using the following credentials:%nUsername: ${usrnm}%nPassword: ${pass}%nPlease change your password immediately following your first login.%n Do not share this message with anyone.%nYou are just one-step away from DOUBLING your BUSINESS.%nContact our representative to list your fitness club on the Gympanzee platform.`
    
    var url = encodeURI(
        `https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=${mob}&sender=${textLocal.sender}&message=${msg}`
        );
        return {url:url,msg:msg};
}