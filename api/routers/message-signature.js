//RESTful APIs   Frameworks
const express = require('express');
// Router to handle endpoints
const router = express.Router();

const Private_BlockChain = require('../classes/private-blockchain');

//post request to add new Block to the Blockchain

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const Validation_Request_db = require('../classes/Validation-db');
//let address = '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ'
//let signature = 'IJtpSFiOJrw/xYeucFxsHvIRFJ85YSGP8S1AEZxM4/obS3xr9iz7H0ffD7aM2vugrRaCi/zxaPtkflNzt5ykbc0='
//let message = '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532330740:starRegistry'


router.post('/validate/', async (req, res, next) => {
    try {
        const address = req.body.address;

        //let timeStamp = new Date().getTime().toString().slice(0, -3);
        let Address = address;
        let validation_db = new Validation_Request_db.Validationdb();
        let validation_request = new Validation_Request_db.ValidationRequest(Address);

        console.log("address :", Address);
        const signature = req.body.signature;

        console.log("signature :", signature);
        let exist = await validation_db.IsExist(Address)
        if (exist) {
            validation_request = await validation_db.getValidationRequest(address);
            check = await validation_db.IsItValidWindow(validation_request.timestamp, new Date().getTime(), 5 * 60 * 1000);
            console.log(validation_request.ExpiresTimeStamp );
            if (check) {

                
                console.log("here     1       ");
                console.log(validation_request);
                
                let timeStamp = validation_request.timestamp;
               
                let MsgDetails = validation_request.message;
                
                let NowTime = new Date().getTime();
                let Expires = parseInt((validation_request.ExpiresTimeStamp - NowTime) / 1000, 10);

                console.log("validation :", MsgDetails, address, signature);
                console.log(bitcoinMessage.verify(MsgDetails, address, signature));
                if (bitcoinMessage.verify(MsgDetails, address, signature)) {


                    validation_request.validsignature = true;
                    let put = await validation_db.putValidationRequest(Address, JSON.stringify(validation_request));
                    console.log(validation_request);
                    res.status(201).json({
                        "registerStar": true,
                        "status": {
                            "address": address,
                            "requestTimeStamp": timeStamp,
                            "message": MsgDetails,
                            "validationWindow": Expires,
                            "messageSignature": "valid"
                        }
                    });

                }
                else {
                    res.status(500).json({
                        "registerStar": false,
                        "status": {
                            "address": address,
                            "requestTimeStamp": timeStamp,
                            "message": MsgDetails,
                            "validationWindow": Expires,
                            "messageSignature": "invalid"
                        }
                    });
                }


            } else { //time out
                let del = validation_db.DeleteValidationRequest(Address);
                res.status(500).json({
                    error:"time out ,call validation request first"
                });
            }


        } else {// not exist
            res.status(500).json({
                error: "BlockID not exist ,call validation request first"
            });
        }


       
       
          



        }
     
    
    catch (err) {

        console.log(err);
        res.status(500).json({error:err.message});
    }


});





module.exports = router;