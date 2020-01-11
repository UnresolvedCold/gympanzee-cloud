exports.addClub = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

    // Data required for database
    // demo urls
    // Add Club without setting any fields -> https://us-central1-gympanzee-v-1-0.cloudfunctions.net/addClub?username=<UserName>
    // Add Club with name as 'Club1' -> https://us-central1-gympanzee-v-1-0.cloudfunctions.net/addClub?username=<UserName>&name=Club1
    // Add Club with name as 'Club1' and address as 'address1' -> https://us-central1-gympanzee-v-1-0.cloudfunctions.net/addClub?username=<UserName>&name=Club1&address=address1

    //Data for identifying an account
    const username = req.query.username; 

    //Data to be stored
    const name=req.query.name;
    const address = req.query.address;
    const city = req.query.city;
    const phone = req.query.phone;
    const workingDays = req.query.workingDays;
    const workingHours = req.query.workingHours;
    const plan = req.query.plan;
    const amenities = req.query.amenities;
    const gumasta = req.query.gumasta;
    const GSTCertificate = req.query.GSTCertificate;
    const PAN = req.query.PAN;
    const Aadhar = req.query.Aadhar;
    const billingACname = req.query.billingACname;
    const billingACNumber = req.query.billingACNumber;
    const IFSC = req.query.IFSC;
    const GSTIN = req.query.GSTIN;
    const billingPAN = req.query.billingPAN;
    const billingPhone = req.query.billingPhone;
    const billingAddress = req.query.billingAddress;
    const state = req.query.state;
    const lat = req.query.lat;
    const lon = req.query.lon; 

   //Flags
   const shouldAdd = req.query.shouldAdd;   // ==144 add directly else send for approval

    //Data json to push
    const dataJSON = 
    {
        amenities: amenities==undefined?"":amenities,
        city:city==undefined?"":city,
        gym_name:name==undefined?"":name,
        gymlatitude:lat==undefined?"":lat,
        gymlongitude:lon==undefined?"":lon,
        id: "to be implemented",
        location: address==undefined?"":address,
        month_tokens: "",
        number: phone==undefined?"":phone,
        plans: plan==undefined?"":plan,
        token: "",
        uri: gumasta==undefined?"":gumasta+" "
            +GSTCertificate==undefined?"":GSTCertificate+" "
            +PAN==undefined?"":PAN+" "
            +Aadhar==undefined?"":Aadhar,
        week_tikens: "",
        working_days: workingDays==undefined?"":workingDays,
        working_hours: workingHours==undefined?"":workingHours,
        year_tokens: "",
        billing_AC_number: billingACNumber==undefined?"":billingACNumber,
        billing_name: billingACname==undefined?"":billingACname,
        billing_address: billingAddress==undefined?"":billingAddress,
        billing_PAN: billingPAN==undefined?"":billingPAN,
        billing_Phone: billingPhone==undefined?"":billingPhone,
        IFSC:IFSC==undefined?"":IFSC,
        billing_state: state==undefined?"":state,
        GSTIN : GSTIN==undefined?"":GSTIN
    }

    return new Promise(function(resolve, reject)
        {    
            //clubRoot.doc("Partner Clubs").collection(username)
            clubRoot.collection(username)
            .add(dataJSON)
            .then(
                function()
                {
                    res.send("success");
                }
            );

        });
    });      
});