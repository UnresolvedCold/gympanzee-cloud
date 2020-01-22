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