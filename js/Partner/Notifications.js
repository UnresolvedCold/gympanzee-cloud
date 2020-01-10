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