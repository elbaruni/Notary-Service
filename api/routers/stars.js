//RESTful APIs   Frameworks
const express = require('express');
// Router to handle endpoints
const router = express.Router();
const session = require('express-session');
const Private_BlockChain = require('../classes/private-blockchain'); // importing private_blockchain  and block classes
const Validation_Request_db = require('../classes/Validation-db');// importing validation-db and validationrequest classe






//Get request to look up a start by the wallet address
router.get('/address/:address', async (req, res, next) => {
    // boday parser to get the address
    const address = req.params.address;
    try {
        let chain = new Private_BlockChain.Blockchain(); // blockchain class instance
        let All = await chain.getAllData(); // gets an array of all blocks 
         
        let starsarr = []; // star array object to store all lloked up stars 
        
        for (let i = 1; i < All.length; i++) // starting from hight 1 not 0 excluding genisis block
        {
            let block = JSON.parse(All[i]); // getting a block by block from the All data array
            
             
            if (block.body.address === address) { // if address at block body matches query address


                
                let BodyStar = {}; // object to handle star body to use it later to add decoded story
                BodyStar = block.body.star;
                let storyHexDecode = new Buffer(BodyStar.story, 'hex'); // decoding Hex story
                BodyStar.storyDecoded = storyHexDecode.toString(); // adding decoded story to the star object
                 
                block.body.star = BodyStar; //applying star body object with decoded story to the found block
               




                
                starsarr.push(block); // push found block into stars array object

            }

        
      }
        
        res.status(200).json(res.status(200).json(starsarr)); // after looking up all the chain return star object
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message }); }
});



//Get request to look up a start by the block hash
router.get('/hash/:hash', async (req, res, next) => {
    // body parser to get hash parameter
    const hash = req.params.hash;
    try {
        // blockchain class instance
        let chain = new Private_BlockChain.Blockchain();
         // gets an array of all blocks
        let All = await chain.getAllData();
        
         
        for (let i = 1; i < All.length; i++) { // starting from hight 1 not 0 excluding genisis block 

            // getting a block by block from the All data array
            let block = JSON.parse(All[i]);

            // if hash of the block  matches query hash
            if (block.hash === hash) {


                // object to handle star body to use it later to add decoded story
                let BodyStar = {};
                BodyStar = block.body.star;

                // decoding Hex story
                let storyHexDecode = new Buffer(BodyStar.story, 'hex');
                // adding decoded story to the star object
                BodyStar.storyDecoded = storyHexDecode.toString();

                //applying star body object with decoded story to the found block
                block.body.star = BodyStar;

                // return found block
                res.status(200).json(block);





                 

            }


        }
        // if hash not found
        res.status(200).json(res.status(500).json({error:"Hash not Found"}));
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }

});



module.exports = router;