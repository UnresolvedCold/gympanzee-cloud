exports.getMisc = functions.https.onRequest((req, res) => {
    cors(req, res, () => {    
                
        return new Promise(function(resolve, reject)
        {    
            var now = Date.now();
            var nowObject = new Date(now);

            var beginObject = new Date(nowObject.getFullYear(),nowObject.getMonth()-1,1,0,0,0,0);
            var endObject = new Date(nowObject.getFullYear(),nowObject.getMonth(),1,0,0,0,0)
            admin.firestore()
            .collection("gyms")
                .where('registrationStatus','==','partnerAdded')
                .where('date', '>=', beginObject)
                .where('date','<', endObject )
                .get()
                .then(function(begin) 
                {
                    console.log(begin.size);                
                    
                    admin.firestore()
                    .collection("gyms")
                        .where('registrationStatus','==','partnerAdded')
                        .where('date', '>=', endObject)
                        .where('date','<=',nowObject)
                        .get()
                        .then(function(end) 
                        {
                            var per_nPartner = begin.size!=0? Math.round(((end.size)/begin.size)*10000)/100:100;
                            
                            var res_data = {
                                nPartner_prevMonth:begin.size,
                                nPartner_thisMonth:end.size,
                                per_nPartner: per_nPartner,
                                per_nPartner_nosign: Math.abs(per_nPartner),
                                per_nPartner_sign:Math.sign(per_nPartner),
                                per_nPartner_style: Math.sign(per_nPartner)==-1?'fas fa-arrow-down':Math.sign(per_nPartner)==0?'':'fa fa-arrow-up',
                                per_nPartner_style1: Math.sign(per_nPartner)==-1?'fas fa-angle-down':Math.sign(per_nPartner)==0?'':'fas fa-angle-up'
                            }
                            console.log(end.size)
                            res.send(JSON.stringify(res_data))
                        
                        });
                
                }); 
        
           
        });
    });      
});