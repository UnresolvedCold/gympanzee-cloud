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