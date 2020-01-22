exports.getClubDetail = functions.https.onRequest((req, res) => {

    const username = req.query.username;

    admin.firestore()
    .collection(username)
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