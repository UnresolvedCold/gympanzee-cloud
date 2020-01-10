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