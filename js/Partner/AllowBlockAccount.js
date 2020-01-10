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