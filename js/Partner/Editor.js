exports.getEditorData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {   
        
        var editorIdentifier = req.query.editor;
                
        return new Promise(function(resolve, reject)
        {    
            admin.firestore()
            .collection("gyms")
                .where('registrationStatus','==','partnerAdded')
                .where('refby','==',editorIdentifier)
                .get()
                .then(function(snap_added) 
                {
                    admin.firestore()
                    .collection("gyms")
                        .where('registrationStatus','==','addedForApproval')
                        .where('refby','==',editorIdentifier)
                        .get()
                        .then(function(snap_approval) 
                        {
                            var res_data=
                            {
                                nPartnerAdded: snap_added.size,
                                nPartnerApproval: snap_approval.size
                            }

                            res.send(JSON.stringify(res_data));
                            
                        
                        });
                
                }); 
        
           
        });
    });      
});

exports.getEditorDataList = functions.https.onRequest((req, res) => {
    cors(req, res, () => {   
        
        var editorIdentifier = req.query.editor; //name or other identifier as per the database
       // var filter = req.query.filter; //registration status
        var max = req.query.max==undefined?20000:req.query.max; //limit to no of data        
        return new Promise(function(resolve, reject)
        {    
            admin.firestore()
            .collection("gyms")
               // .where('registrationStatus','==',filter)
                .where('refby','==',editorIdentifier)
                .get()
                .then(function(snap) 
                {
                    var data =[];
                    snap.forEach(function(doc) 
                    {
                        var size = data.length;
                        data[size] = doc.data();
                        data[size].id = doc.id;
                        //make date string
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

                        data[size].date = strDate;

                        var rs = data[size].registrationStatus;
                        if(rs=='partnerAdded')rs='Approved';
                        if(rs=='addedForApproval')rs='Pending Approval';

                        data[size].registrationStatus=rs;
                        //console.log('cron says '+doc.id);
                
                    });

                    //send data to client here
                    res.send(JSON.stringify(data));
                
                }); 
        
           
        });
    });      
});