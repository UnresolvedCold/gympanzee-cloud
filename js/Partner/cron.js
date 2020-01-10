//CRON Jobs
/*
exports.scheduledFunctionCrontab = functions.pubsub.schedule('* * * * *')
  .onRun((context) => {
    return new Promise(function(resolve, reject)
    {   
        admin.firestore()
        .collection("gyms")
        .where("registrationStatus","==","partnerAdded")
        .get()
        .then(function (__snap)
        {
            __snap.forEach(function(doc) 
            {
                console.log('cron says '+doc.id);
            });
        })
    });
});
*/