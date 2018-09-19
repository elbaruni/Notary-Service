//RESTful APIs   Frameworks
const express = require('express');
// Router to handle endpoints
const router = express.Router();
const session = require('express-session');
const Private_BlockChain = require('../classes/private-blockchain');// importing private_blockchain  and block classes
const Validation_Request_db = require('../classes/Validation-db');// importing validation-db and validationrequest classes

// function to check if a given string contains only ascii charecters
function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

 //post request to add new Block to the Blockchain
router.post('/', async (req, res, next) => {


    try {
        // using body parrser to get the address from body parameters
        const address = req.body.address;
        let Address = address;


        // creating validation-db instance
        const validation_db = new Validation_Request_db.Validationdb();

        // validation request instance variable 
        let validation_request = new Validation_Request_db.ValidationRequest(Address);

        //error object 
        let err = [];

        //constant variable for star object 
        const starObj = req.body.star;
        //check if giving address validation request is exist for validation
        let exist = await validation_db.IsExist(Address);

        if (exist) {

            //when exist get all the validation request information
            validation_request = await validation_db.getValidationRequest(address);
            //verifying if its still a vlid window
            check = await validation_db.IsItValidWindow(validation_request.timestamp, new Date().getTime(), 5 * 60 * 1000);
            if (check) {


                 
                // object to build the block body
                let BodyObj = {};
                //object to build star body
                let BodyStar = {};
                //check  if the signature is valid
                const ValidSignature = await validation_db.IsitValidSignature(Address);
                            
                if (ValidSignature) {

                     
                   
                    //check if there is a star object
                    if (!starObj) {
                        err.push({ error: 'no star object found' });
                    } else { // star object exist
                          
                        // story lenght to be used to check not to exceed 250 charcters
                        const storyLenght = starObj.story.length;

                        //mandatory to have right_ascension
                        if (!starObj.ra) {// if not exist add an error
                            err.push({ error: 'no right_ascension found' }); console.log('no right_ascension found');
                        }
                        //else "exist"  add it to star body object
                        BodyStar.ra = starObj.ra;
                        //mandatory to have declination 
                        if (!starObj.dec)// if not exist add an error
                            {
                            err.push({ error: 'no declination found' }); console.log('no declination found');
                    }
                        //else "exist"  add it to star body object
                        BodyStar.dec = starObj.dec;
                         // then  length of story  must not less than or equal 0  or greater than 500   
                        if (storyLenght <= 0 || storyLenght > 500) {
                            //if not add an error
                            err.push({ error: 'story not exist or lenght exceeds 250 words' }); console.log('story not exist');
                        }
                        if (!isASCII(starObj.story)) { // if not contains only ascii characters add an error
                            err.push({ error: 'story not only ascii characters' }); console.log('story not only ascii characters'); 
                        }
                       //optional magnitude if exist add it
                        if (starObj.mag) { // if exist add it to star body object
                            BodyStar.mag = starObj.mag;
                        }
                        //optional constellation 
                        if (starObj.con) {// if exist add it to star body object
                            BodyStar.con = starObj.con;
                        }
                       
                    }
                    // if err object lenght >0 means there is one or more errors detected  
                    if (err.length>0) {
                       
                        console.log(err.message);
                        res.status(500).json({
                            error: err
                        });
                        
                    }

                    else {  // no errors 

                        //encoding star story 
                        const StoryHex = new Buffer(starObj.story).toString('hex');
                        //adding encoded story to body star object
                        BodyStar.story = StoryHex;
                        //adding wallet address to body object
                        BodyObj.address = Address;
                        //adding body star object to the body object
                        BodyObj.star = BodyStar;

                        //creating blockchain class instance 
                        let chain = new Private_BlockChain.Blockchain();

                        //adding new block to the blockchain with the body object
                        let block = await chain.addBlock(new Private_BlockChain.Block(BodyObj));

                        //delete validation request  from validation-db after success adding
                        let del = validation_db.DeleteValidationRequest(Address);
                        
                        //returning added block
                        res.status(201).json(JSON.parse(block));
                        
                    

                    }

                    

                }
                else { // if submitted signature is inavlied
                    res.status(500).json({
                        error: "invalid signature ,submit valid signature"
                    });
                }


            } else { // if validation window timed out
                //delete validation request  from validation-db if its window is not valid
                let del = validation_db.DeleteValidationRequest(Address);
                res.status(500).json({
                    error: "time out ,call validation request first"
                });
            }


        } else {// if Blockid is not not exist
            res.status(500).json({
                error: "BlockID not exist ,call validation request first"
            });
        }
    }
    catch (err) { console.log(err); }
});



// Get request to look up a start by the block height
router.get('/:BlockHeight', async (req, res, next) => {
    // extracts blockheight from request parameters
    const blockHeight = req.params.BlockHeight;

     //first we create an instance of blockchain class
    let chain = new Private_BlockChain.Blockchain();

     //calling getBlockmethod of blockchain and gets the block  of blockheight
    let block = await chain.getBlock(blockHeight);

    // object to build the block body
    let BodyObj = {};
    if (blockHeight > 0) {
     //object to build star body
    let BodyStar = {};
    BodyStar = block.body.star;
    // decoding Hex story
    let storyHexDecode = new Buffer(BodyStar.story, 'hex');

    // adding decoded story to the star object
    BodyStar.storyDecoded = storyHexDecode.toString();

   //applying star body object with decoded story to the found block
    block.body.star = BodyStar;
     }
    // return found block
    res.status(200).json(block);
      
});





module.exports = router;