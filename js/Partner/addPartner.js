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