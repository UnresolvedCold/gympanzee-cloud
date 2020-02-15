const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const request = require('request');

admin.initializeApp(firebaseConfig);

var clubRoot =  admin.firestore().collection("Clubs").doc("clubs");
var clubDetailRoot =  admin.firestore().collection("Clubs").doc("Details");


exports.getNClubs = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        clubRoot
        .get()
        .then(function(q){

            console.log(`size: ${q.length}`);
            res.send(q.length);

        });

    });
});

exports.getClubDetail = functions.https.onRequest((req, res) => {

    const username = req.query.username;

    clubRoot
    .doc(username)
    .get()
    .then(function(query){
        var data=[];
        query.forEach(function(q)
        {
            data[data.length]=q.data();
        });
        console.log(JSON.stringify(data));
        res.send(JSON.stringify(data));
    });

});

exports.getUserList = functions.https.onRequest((req, res) => {

    admin.firestore()
    .collection("gyms")
    .where("registrationStatus","==","partnerAdded")
    .get()
    .then(function(query){
        var data=[];
        query.forEach(function(q)
        {
            data[data.length]=q.data().username;
        });
        console.log(JSON.stringify(data));
        res.send(JSON.stringify(data));
    });

});
exports.addClub = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

    // Data required for database
    // demo urls
    // Add Club without setting any fields -> https://us-central1-gympanzee-v-1-0.cloudfunctions.net/addClub?username=<UserName>
    // Add Club with name as 'Club1' -> https://us-central1-gympanzee-v-1-0.cloudfunctions.net/addClub?username=<UserName>&name=Club1
    // Add Club with name as 'Club1' and address as 'address1' -> https://us-central1-gympanzee-v-1-0.cloudfunctions.net/addClub?username=<UserName>&name=Club1&address=address1

    //Data for identifying an account
    const username = req.query.username; 

    //Data to be stored
    const name=req.query.name;
    const address = req.query.address;
    const city = req.query.city;
    const phone = req.query.phone;
    const workingDays = req.query.workingDays;
    const workingHours = req.query.workingHours;
    const plan = req.query.plan;
    const amenities = req.query.amenities;
    const gumasta = req.query.gumasta;
    const GSTCertificate = req.query.GSTCertificate;
    const PAN = req.query.PAN;
    const Aadhar = req.query.Aadhar;
    const billingACname = req.query.billingACname;
    const billingACNumber = req.query.billingACNumber;
    const IFSC = req.query.IFSC;
    const GSTIN = req.query.GSTIN;
    const billingPAN = req.query.billingPAN;
    const billingPhone = req.query.billingPhone;
    const billingAddress = req.query.billingAddress;
    const state = req.query.state;
    const lat = req.query.lat;
    const lon = req.query.lon;
    const isApproved = req.query.isApproved; 

   //Flags
   const shouldAdd = req.query.shouldAdd;   // ==144 add directly else send for approval

    //Data json to push
    const dataJSON = 
    {
        amenities: amenities==undefined?"":amenities,
        city:city==undefined?"":city,
        gym_name:name==undefined?"":name,
        gymlatitude:lat==undefined?"":lat,
        gymlongitude:lon==undefined?"":lon,
        id: "to be implemented",
        location: address==undefined?"":address,
        month_tokens: "",
        number: phone==undefined?"":phone,
        plans: plan==undefined?"":plan,
        token: "",
        uri: gumasta==undefined?"":gumasta+" "
            +GSTCertificate==undefined?"":GSTCertificate+" "
            +PAN==undefined?"":PAN+" "
            +Aadhar==undefined?"":Aadhar,
        week_tokens: "",
        working_days: workingDays==undefined?"":workingDays,
        working_hours: workingHours==undefined?"":workingHours,
        year_tokens: "",
        billing_AC_number: billingACNumber==undefined?"":billingACNumber,
        billing_name: billingACname==undefined?"":billingACname,
        billing_address: billingAddress==undefined?"":billingAddress,
        billing_PAN: billingPAN==undefined?"":billingPAN,
        billing_Phone: billingPhone==undefined?"":billingPhone,
        IFSC:IFSC==undefined?"":IFSC,
        billing_state: state==undefined?"":state,
        GSTIN : GSTIN==undefined?"":GSTIN,
        isApproved: isApproved==undefined?true:Boolean(isApproved)
    }

    return new Promise(function(resolve, reject)
        {    
            //clubRoot.doc("Partner Clubs").collection(username)
            clubRoot
            .collection(username)
            .add(dataJSON)
            .then(
                function()
                {
                    clubDetailRoot
                    .get()
                    .then(function(details)
                    {
                        var n = details.data().TotalActive;
                        console.log('TotalActive: '+(n+1));

                        clubDetailRoot
                        .update({TotalActive:n+1})
                        .then(function()
                        {
                            res.send("success");

                        });


                    });
                }
            );

        });
    });      
});
//verify otp by number and username

exports.verifyOTP = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const username=req.query.username;
        const number = req.query.number;
        const otp = req.query.otp;

        return new Promise(function(resolve, reject)
        {    

            admin.firestore()
            .collection("Temp")
            .doc("OTP")
            .collection("NewClub")
            .doc(number)
            .get()
            .then(function(querySnapshot) 
            {
               if((querySnapshot.data()).otp==otp)
               {
                    res.send("matched");
               }
               else
               {
                    res.send("nope");
               }
            });


        });
    });      
});
exports.generateOTP_Club = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const number = req.query.number;
        const username = req.query.username;

        return new Promise(function(resolve, reject)
        {    
            var rnd6 = Math.floor(100000 + Math.random() * 900000)+"";
            var msg = `OTP for GympanzeeClub On-boarding: ${rnd6}.\n\nKindly share it with our Representative.\nOTP valid for 10 minutes.`; 

            //send it to a temp database
            admin.firestore()
            .collection("Temp").doc("OTP")
            .collection("NewClub").doc(username)
            .set({
                otp: `${rnd6}`,
                number:`${number}`
            })
            
            var url =encodeURI(`https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=${number}&sender=${textLocal.sender}&message=${msg}`);

            request(url, function (error, response, body) {
                console.log('msg',msg);
                console.log('body:', body);
             
                //for debug
                res.send(``); 
               
            });

        });
    });      
});
exports.generateOTP_Club = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const number = req.query.number;
        const username = req.query.username;

        return new Promise(function(resolve, reject)
        {    
            var rnd6 = Math.floor(100000 + Math.random() * 900000)+"";
            var msg = `OTP for GympanzeeClub On-boarding: ${rnd6}.\n\nKindly share it with our Representative.\nOTP valid for 10 minutes.`;

            //send it to a temp database
            admin.firestore()
            .collection("Temp").doc("OTP")
            .collection("NewClub").doc(username)
            .set({
                otp: `${rnd6}`,
                number:`${number}`
            })
            
            var url =encodeURI(`https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=${number}&sender=${textLocal.sender}&message=${msg}`);

            request(url, function (error, response, body) {
                console.log('msg',msg);
                console.log('body:', body);
             
                //for debug
                res.send(``); 
               
            });

        });
    });      
});

//CRON Jobs
/*
exports.scheduledFunctionCrontab = functions.pubsub.schedule('* * * * *')
  .onRun((context) => {
    return new Promise(function(resolve, reject)
    {   
        admin.firestore()
        .collection("gyms")
        .where("registrationStatus","==","partnerAdded")
        .get()
        .then(function (__snap)
        {
            __snap.forEach(function(doc) 
            {
                console.log('cron says '+doc.id);
            });
        })
    });
});
*/
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
                    var date = data.date==undefined?{_seconds:0, _nanoseconds:0}:data.date;
                    var seconds = date._seconds;
                    var nseconds = date._nanoseconds;
                    var date= (new admin.firestore.Timestamp(seconds,nseconds)).toDate();

                    date.setHours(date.getHours() + 5);
                    date.setMinutes(date.getMinutes() + 30);

                    var year    = ('00'+date.getFullYear()).slice(-4);
                    var month   = ('00'+(date.getMonth()+1)).slice(-2);
                    var day     = ('00'+date.getDay()).slice(-2);
                    var hour    = ('00'+date.getHours()).slice(-2);
                    var minute  = ('00'+date.getMinutes()).slice(-2);

                    var strDate = `${day}/${month}/${year} ${hour}:${minute}`;

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
                    res.send(JSON.stringify({nPartners:count+''}));
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

                        var strDate = `${day}/${month}/${year} ${hour}:${minute}`;

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
exports.AllowAccount = functions.https.onRequest((req, res) => {
    cors(req, res, () => {     
        
        var value = req.query.value; //yes => activate account, no => block account
        //any one of these
        var uid = req.query.uid;
        var mobile = req.query.mobile;
        var unique_pin = req.query.unique_pin;
        uid = uid==undefined?'':uid;
        mobile = mobile==undefined?'':mobile;
        unique_pin = unique_pin==undefined?'':unique_pin;

        return new Promise(function(resolve, reject)
        {     
            if(uid.length>1)
            admin.firestore()       //get firestore reference
            .collection("gyms")  
            .doc(uid)
            .update({block:value})
            .then(function(querySnapshot) 
            {
                var msg = '';
                if(value=='yes')
                {
                msg = `Dear Gympanzee Partner,\n`+
                `Your account has been temporarily blocked.\n`+
                `Contact our team to reactivate. You can also write to us at support@gympanzee.app`;
                
                var url = `https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=91${mobile}&sender=${textLocal.sender}&message=${msg}`
                request(url, function (error, response, body) {
                    
                    console.log(`mob: ${mobile} uid: ${uid}`);
                    console.log(msg);
                    console.log( body);
                 
                    res.send(body);
                   
                });

                }
                else
                {
                console.log('result :'+value);
                res.send('result :'+value);
                }
            });
           
        });
    });      
});
exports.getEditorData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {   
        
        var editorIdentifier = req.query.editor;
                
        return new Promise(function(resolve, reject)
        {    
            admin.firestore()
            .collection("gyms")
                .where('registrationStatus','==','partnerAdded')
                .where('refby','==',editorIdentifier)
                .get()
                .then(function(snap_added) 
                {
                    admin.firestore()
                    .collection("gyms")
                        .where('registrationStatus','==','addedForApproval')
                        .where('refby','==',editorIdentifier)
                        .get()
                        .then(function(snap_approval) 
                        {
                            var res_data=
                            {
                                nPartnerAdded: snap_added.size,
                                nPartnerApproval: snap_approval.size
                            }

                            res.send(JSON.stringify(res_data));
                            
                        
                        });
                
                }); 
        
           
        });
    });      
});

exports.getEditorDataList = functions.https.onRequest((req, res) => {
    cors(req, res, () => {   
        
        var editorIdentifier = req.query.editor; //name or other identifier as per the database
       // var filter = req.query.filter; //registration status
        var max = req.query.max==undefined?20000:req.query.max; //limit to no of data        
        return new Promise(function(resolve, reject)
        {    
            admin.firestore()
            .collection("gyms")
               // .where('registrationStatus','==',filter)
                .where('refby','==',editorIdentifier)
                .get()
                .then(function(snap) 
                {
                    var data =[];
                    snap.forEach(function(doc) 
                    {
                        var size = data.length;
                        data[size] = doc.data();
                        data[size].id = doc.id;
                        //make date string
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

                        var strDate = `${day}/${month}/${year} ${hour}:${minute}`;

                        data[size].date = strDate;

                        var rs = data[size].registrationStatus;
                        if(rs=='partnerAdded')rs='Approved';
                        if(rs=='addedForApproval')rs='Pending Approval';

                        data[size].registrationStatus=rs;
                        //console.log('cron says '+doc.id);
                
                    });

                    //send data to client here
                    res.send(JSON.stringify(data));
                
                }); 
        
           
        });
    });      
});
//OTP Generation and Sending 
exports.generateOTP = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

        const number = req.query.number;
        const username = req.query.username;

        return new Promise(function(resolve, reject)
        {    
            var rnd6 = Math.floor(100000 + Math.random() * 900000)+"";
            var msg = `Your OTP for Gympanzee Partner On-boarding process is ${rnd6}.\n\nKindly share it with our Representative.\nOTP valid for 10 minutes.`; 

            //send it to a temp database
            admin.firestore()
            .collection("Temp").doc("OTP")
            .collection("NewPartner").doc(username)
            .set({
                otp: `${rnd6}`,
                number:`${number}`
            })
            
            var url =encodeURI(`https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=${number}&sender=${textLocal.sender}&message=${msg}`);

            request(url, function (error, response, body) {
                console.log('msg',msg);
                console.log('body:', body);
             
                //for debug
                res.send(``); 
               
            });

        });
    });      
});

exports.getDataFromUsername = functions.https.onRequest((req, res) => {
    cors(req, res, () => {     

        const username = req.query.username;
        var _data = [];

        return new Promise(function(resolve, reject)
        {     
                admin.firestore()       //get firestore reference
                .collection("gyms")     //get collection named "gyms"
                .where("username","==",username)
                .get()
                .then(function(snap)
                {
                    snap.forEach(function(doc) 
                    {
                        var data = doc.data();
                        var date = data.date==undefined?{_seconds:0, _nanoseconds:0}:data.date;
                        var seconds = date._seconds;
                        var nseconds = date._nanoseconds;
                        var date= (new admin.firestore.Timestamp(seconds,nseconds)).toDate();

                        date.setHours(date.getHours() + 5);
                        date.setMinutes(date.getMinutes() + 30);

                        var year    = ('00'+date.getFullYear()).slice(-4);
                        var month   = ('00'+(date.getMonth()+1)).slice(-2);
                        var day     = ('00'+date.getDay()).slice(-2);
                        var hour    = ('00'+date.getHours()).slice(-2);
                        var minute  = ('00'+date.getMinutes()).slice(-2);

                        var strDate = `${day}/${month}/${year} ${hour}:${minute}`;

                        console.log(strDate);

                        data.date = strDate;

                        _data[_data.length]=data;
                    });
                
                    res.send(JSON.stringify(_data[0]));   
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
        const city = req.query.city;
        const _number_ = number.substring(2,number.length);//remove 91 from the number

        return new Promise(function(resolve, reject)
        {    
            console.log(flag + " "+ number + " " + "started ")

            admin.firestore()
            .collection("gyms")
            .where("registrationStatus","==","partnerAdded")
            .get()
            .then(function (__snap)
            {
                var count = __snap.size+1;
                count = ('00000000'+count).slice(-6);

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
                                number: _number_,
                                email: email,
                                unique_pin: count,
                                refby: refby===undefined?"":refby,
                                sendsmscount:2,
                                account_holder:"",
                                account_no:"",
                                address: "",
                                callme: "",
                                date: admin.firestore.Timestamp.now(),
                                gstin:"",
                                gym_name:"",
                                i_am:"",
                                ifsc:"",
                                its_on:"",
                                pan:"",
                                payment:"",
                                pincode:"",
                                state:"",
                                status:"",
                                city:city

                            }

                            if(flag !="144") 
                            {
                                console.log('flag = 144');
                                _data.registrationStatus = "addedForApproval";
                            }
                            console.log("data created "+JSON.stringify(_data))
                            admin.firestore()
                            .collection("gyms")
                            .where("registrationStatus","==","callbackSeen")
                            .where("number","==",`${_number_}`)
                            .get()
                            .then(
                                function(snap)
                                {
                                    //console.log("searching callbackseen requests : "+snap.size)
                                
                                   // snap.forEach(function(doc) {
                                        
                                       // if(doc.data().registrationStatus != "partnerAdded")
                                       // {
                                            //console.log("found result")
                                            //const uid = doc.id;
                                            if(snap.size<1)
                                            admin.firestore().collection("gyms")
                                                .add(_data)
                                                .then(function()
                                                {
                                                    // Check if flag == 144
                                                    // Send Username and password by calling 
                                                    // else do nothing
                                                    if(flag=='144')
                                                    {
                                                        console.log("adding otp")
                                                        var messageUrl = getMessageUrl(number+'',count+'',_data.password+'',_data.username+'');
                                                        request(messageUrl, function (error, response, body) {
                                                        // console.log('msg',msg);
                                                        console.log('messageURL:',messageUrl);    
                                                        console.log('body:', body);

                                                            
                                                            _data._body_=body;
                                                            res.send(_data);
                                                            
                                                        });
                                                
                                                    }
                                                    else
                                                    {
                                                        res.send(_data);
                                                    }
                                                
                                                });
                                            else
                                            {
                                                res.send("failure");
                                            }
                                        //}
                                       // else
                                      //  {
                                       //     res.send("failure");
                                       // }

                                    });
                                  /*  if(snap.size<=0){
                                    console.log("No number matched");
                                    res.send('No number matched');
                                    }*/
                               /* }
                            )
                            .catch(function(error) {
                                console.log("Error getting documents: ", error);
                                res.send('error 1');

                            });;*/

                        }  
                        else
                        {
                            console.log(flag + " "+ number + " " + "error , "+otp+", "+doc.data().otp)

                            res.send('error 2');
                        } 
                    });
            });

        });
    });      
});

//approval
exports.addPartnerAfterApproval = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const uid = req.query.uid;

        admin.firestore()
            .collection("gyms")
            .where("registrationStatus","==","partnerAdded")
            .get()
            .then(function (__snap)
            {
                var count = __snap.size+1;
                count = ('00000000'+count).slice(-6);
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

                    var _data = {registrationStatus: "partnerAdded",unique_pin: count};

                    admin.firestore().collection("gyms")
                    .doc(uid)
                    .update(_data)
                    .then(function() {
                        var url = getMessageUrl(`91${mob}`,pin,pass,usrnm);
                        request(url, function (error, response, body) {
                            console.log('msg',msg);
                            console.log('body:', body);
                        
                            _data._body_=body;
                            res.send(_data);
                        
                        });
                    
                    });

                    res.send("added");
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

//Remove Account
exports.removeAccount = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const uid = req.query.uid;
        const mobile = req.query.mobile;
        const state = req.query.state;

        console.log(`mob= ${mobile} state: ${state}`)
        if(state == 'remove')
        {
            admin.firestore()
            .collection("gyms").doc(uid)
            .delete().then(function() {

                //send sms
                var msg = `Dear Gympanzee Partner,\n`+
                            `Your account has been permanently removed.\n`+
                            `If it was a mistake, contact our team immediately to reactivate. You can also write to us at support@gympanzee.app`;
                
                var url = `https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=91${mobile}&sender=${textLocal.sender}&message=${msg}`
                request(url, function (error, response, body) {
                    
                    console.log(`mob: ${mobile} uid: ${uid}`);
                    console.log(msg);
                    console.log( body);
                 
                    res.send("deleted");
                   
                });

            }).catch(function(error) {
                res.send("error 1");
    
            });
        }
        else
        {
            res.send('error 2')
        }
       
    });      
});
//Notifications
exports.NotificationsHandler = functions.firestore
.document('gyms/{UID}')
.onWrite((change, context) => 
{ 
    return new Promise(function(resolve, reject)
    {  
        var after = change.after.data();
        var before = change.before.data(); 
        var id = context.params.UID;
        var aRS = after.registrationStatus;
        var bRS = before.registrationStatus;

        var comment = '';

        var currentdate = new Date(); 
        currentdate.setHours(currentdate.getHours() + 5);
        currentdate.setMinutes(currentdate.getMinutes() + 30);

        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes();
        
        if(aRS=='new')comment = " A new user requested for callback ";
        if(aRS=='addedForApproval')comment = " A new user requested for approval ";

        var values = {
            uid:id,
            oldStatus: bRS==undefined?"":bRS,
            newStatus: aRS==undefined?"":aRS,
            comment: comment,
            datetime: datetime,
            isSeen: false
        }

        return admin.firestore().collection("Notifications")
        .add(values)
        .then(function()
      {
        console.log(JSON.stringify(values));
      });

    });
});

exports.getNotifications = functions.https.onRequest((req, res) => {
    cors(req, res, () => {     

        //option helps in switching between different modes in a function
        //option == "count"  --> will give the number of data requesting callbacks 
        //option == "data"   --> will get the data of all users in json
        const option = req.query.option;

        return new Promise(function(resolve, reject)
        {     
            var data=[];
            var count=0;

            admin.firestore()       //get firestore reference
            .collection("Notifications")  
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
                    var _count_ =0;
                    //iterate through all the data present in the database
                    querySnapshot.forEach(function(doc) 
                    {
                        //Get Notofication uid
                        if(doc.data().comment.length>0)
                        {
                            var size = data.length;
                            data[size] = doc.data();
                            data[size].notificationId = doc.id;

                            if(data[size].isSeen==false)
                            _count_++;
                        }
                    
                    });

                    //send data
                    if(req.query.count=='new')
                    res.send(''+_count_);
                    else
                    res.send(JSON.stringify(data));
                }
                else
                {
                    res.send("Invalid GET");
                }

            });

        });
    });      
});

exports.touchNotification = functions.https.onRequest((req, res) => {
    cors(req, res, () => {     
        
        //uid value
        const uid = req.query.notificationUid;
        var value = req.query.value;
        value =(Boolean)( value==undefined?true:value);

        return new Promise(function(resolve, reject)
        {     
            admin.firestore()       //get firestore reference
            .collection("Notifications")  
            .doc(uid)
            .update({isSeen:value})
            .then(function(querySnapshot) 
            {
                console.log('Notification Id : uid is seen')
                res.send('seen');
            });

        });
    });      
});
exports.getMisc = functions.https.onRequest((req, res) => {
    cors(req, res, () => {    
                
        return new Promise(function(resolve, reject)
        {    
            var now = Date.now();
            var nowObject = new Date(now);

            var beginObject = new Date(nowObject.getFullYear(),nowObject.getMonth()-1,1,0,0,0,0);
            var endObject = new Date(nowObject.getFullYear(),nowObject.getMonth(),1,0,0,0,0)
            admin.firestore()
            .collection("gyms")
                .where('registrationStatus','==','partnerAdded')
                .where('date', '>=', beginObject)
                .where('date','<', endObject )
                .get()
                .then(function(begin) 
                {
                    console.log(begin.size);                
                    
                    admin.firestore()
                    .collection("gyms")
                        .where('registrationStatus','==','partnerAdded')
                        .where('date', '>=', endObject)
                        .where('date','<=',nowObject)
                        .get()
                        .then(function(end) 
                        {
                            var per_nPartner = begin.size!=0? Math.round(((end.size)/begin.size)*10000)/100:100;
                            
                            var res_data = {
                                nPartner_prevMonth:begin.size,
                                nPartner_thisMonth:end.size,
                                per_nPartner: per_nPartner,
                                per_nPartner_nosign: Math.abs(per_nPartner),
                                per_nPartner_sign:Math.sign(per_nPartner),
                                per_nPartner_style: Math.sign(per_nPartner)==-1?'fas fa-arrow-down':Math.sign(per_nPartner)==0?'':'fa fa-arrow-up',
                                per_nPartner_style1: Math.sign(per_nPartner)==-1?'fas fa-angle-down':Math.sign(per_nPartner)==0?'':'fas fa-angle-up'
                            }
                            console.log(end.size)
                            res.send(JSON.stringify(res_data))
                        
                        });
                
                }); 
        
           
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
exports.checksms = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
      /*  const mob = "7004219327";
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
                   
                });*/
    });
});

function getMessageUrl(mob,pin,pass,usrnm)
{
    var msg = `Congratulations! Your GympanzeeClub account has been approved. Your Partner's Identification Number (PIN) is ${pin}%nPlease use this PIN for all future communications.%nLogin to GympanzeeClub Android app using the following credentials:%nUsername: ${usrnm}%nPassword: ${pass}%nPlease change your password immediately following your first login.%n Do not share this message with anyone.%nYou are just one-step away from DOUBLING your BUSINESS.%nContact our representative to list your fitness club on the Gympanzee platform.`
     msg = `Congratulations! Your GympanzeeClub account has been approved. Your Partner's Identification Number (PIN) is ${pin}\nPlease use this PIN for all future communications.\nLogin to GympanzeeClub Android app using the following credentials:\nUsername: ${usrnm}\nPassword: ${pass}\nPlease change your password immediately following your first login.\n Do not share this message with anyone.\nYou are just one-step away from DOUBLING your BUSINESS.\nContact our representative to list your fitness club on the Gympanzee platform.`
    var url = 
        `https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=${mob}&sender=${textLocal.sender}&message=${msg}`
    
        return {url:url,msg:msg};
}
