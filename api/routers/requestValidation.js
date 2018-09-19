//RESTful APIs   Frameworks
const express = require('express');
// Router to handle endpoints
const router = express.Router();

const Private_BlockChain = require('../classes/private-blockchain'); // importing private_blockchain  and block classes
const Validation_Request_db = require('../classes/Validation-db'); // importing validation-db and validationrequest classes






 //post request to add new Block to the Blockchain
router.post('/', async (req, res, next) => {
    try {
        // using body parrser to get the address from body parameters
        const address = req.body.address; 
         
        let Address = address;
        if (Address) {

        // creating validation-db instance
        const validation_db = new Validation_Request_db.Validationdb();

        // validation request instance variable 
        let validation_request = new Validation_Request_db.ValidationRequest(Address);

        // gets validation request from validation db by address if exist , if not will return new one
        validation_request = await validation_db.ValidationRequest(address);

        // this is the message to be returned to the user for signing 
        let MsgDetails = validation_request.message;
        //current timestamp
        let NowTime = new Date().getTime();
        //calculating remaining time for validation 
        let Expires = parseInt((validation_request.ExpiresTimeStamp - NowTime) / 1000, 10);
       // return response
            res.status(201).json({
                'address': Address,
                'requestTimeStamp': validation_request.timestamp,
                'message': MsgDetails,
                validationWindow: Expires
            });


         
           
            
         } else {
            res.status(500).json({ error: "Address not exist,please re-submit with an addrees" });
        } 
 

        } 
    catch (err) {
        //return when catching an error
        res.status(500).json({ error: err.message });
        console.log(err);
    }
   

});





module.exports = router;