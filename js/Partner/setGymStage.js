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