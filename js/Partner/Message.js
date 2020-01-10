exports.checksms = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const mob = "7004219327";
        const pin ="100000";
        const pass="098989";
        const usrnm = "ShubhamKumar";

        var obj = getMessageUrl(`91${mob}`,pin,pass,usrnm);
        var url = obj.url;
        var msg = obj.msg;

                request(url, function (error, response, body) {
                    console.log(msg);
                    console.log( body);
                 
                    res.send(body);
                   
                });
    });      
});

function getMessageUrl(mob,pin,pass,usrnm)
{
    var msg = `Congratulations! Your GympanzeeClub account has been approved. Your Partner's Identification Number (PIN) is ${pin}%nPlease use this PIN for all future communications.%nLogin to GympanzeeClub Android app using the following credentials:%nUsername: ${usrnm}%nPassword: ${pass}%nPlease change your password immediately following your first login.%n Do not share this message with anyone.%nYou are just one-step away from DOUBLING your BUSINESS.%nContact our representative to list your fitness club on the Gympanzee platform.`
     msg = `Congratulations! Your GympanzeeClub account has been approved. Your Partner's Identification Number (PIN) is ${pin}\nPlease use this PIN for all future communications.\nLogin to GympanzeeClub Android app using the following credentials:\nUsername: ${usrnm}\nPassword: ${pass}\nPlease change your password immediately following your first login.\n Do not share this message with anyone.\nYou are just one-step away from DOUBLING your BUSINESS.\nContact our representative to list your fitness club on the Gympanzee platform.`
    var url = 
        `https://api.textlocal.in/send/?apikey=${textLocal.apiKey}&numbers=${mob}&sender=${textLocal.sender}&message=${msg}`
    
        return {url:url,msg:msg};
}