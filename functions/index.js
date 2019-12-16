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

//Call back requests
exports.getCallbackRequests = functions.https.onRequest((req, res) => {
    cors(req, res, () => {     

        //option helps in switching between different modes in a function
        //option == "count"  --> will give the number of data requesting callbacks 
        //option == "data"   --> will get the data of all users in json   
        const option = req.query.option;

        return new Promise(function(resolve, reject)
        {     
            var data=[];
            var count=0;

            if(option=="uid")
            {
                var uid = req.query.uid;
                admin.firestore()       //get firestore reference
                .collection("gyms")     //get collection named "gyms"
                .doc(uid)
                .get()
                .then(function(doc)
                {
                    res.send(JSON.stringify(doc.data()));   
                });
            }
            else
            admin.firestore()       //get firestore reference
            .collection("gyms")     //get collection named "gyms"
            .where("password", "==", "")  //filter documents with field password == ""
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
                        var size = data.length;
                        data[size] = doc.data();
                        data[size]._uid_ = doc.id;
                    
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
            var rnd6 = Math.floor(100000 + Math.random() * 900000);
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
        const flag=req.query.flag;
        const otp = req.query.otp;
        const number = req.query.number;
        const username = req.query.username;
        const email = req.query.email;
        const name = req.query.name;

        return new Promise(function(resolve, reject)
        {    

            admin.firestore()
            .collection("Temp").doc("OTP")
            .collection("NewPartner").doc(username)
            .get()
                .then(function(doc)
                {
                    if(doc.otp == otp)
                    {

                        var _data = {
                            name: name,
                            __stage__: "partnerAdded",
                            username: username,
                            password: "somepassword",
                            phone: number,
                            email: email
                        }

                        if(flag !="144") 
                        {
                            _data.__stage__ = "addedForApproval";
                            _data.password="";
                        }

                        admin.firestore().collection("gyms")
                        .where("number", "==", number)
                        .update(_data).then(function()
                        {
                            res.send('success');

                        });

                    }  
                    else
                    {
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
            var _data = {RegistrationStatus: stage};

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