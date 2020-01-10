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