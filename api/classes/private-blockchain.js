/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
/* ===== Leveldb ===============================
|  Learn more: level: https://github.com/Level/level      |
|  =========================================================*/
const level = require('level');
const chainDB = './chaindataelb';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
    constructor(data) {
        this.hash = "",
            this.height = 0,
            this.body = data,
            this.time = 0,
            this.previousBlockHash = ""
    }
}






/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
    constructor() {
        this.addGenesisBlock(new Block("First block in the chain - Genesis block"));
    }

    // ======================Helper Methods Section====================================== 

    //Get the value of all data in the Leveldb and return a promise
    getAllData() {
        return new Promise(function (resolve, reject) {
            var alldata = [];
            db.createReadStream({ keys: false, values: true }).on('data', function (data) {
                alldata.push(data);


            }).on('close', function () {
                resolve(alldata);
            });
        });
    }
    // put block into level db and returns the inserted block
    putBlock(key, value) {
        return new Promise(function (resolve, reject) {
            db.put(key, value, function (err) {
                if (err) reject(err);
                resolve(value);
            })

        });
    }
    //===================end of helper Methods Section======================================


    //====================start of Class Methods====================================

    // Method called only at the constuctor to generate first Genesis Block if no block is in the chain
    async addGenesisBlock(newBlock) {
        try {
            let height = parseInt(await this.getBlockHeight(), 10);



            //console.log(alldata.length);
            if (height === -1) {
                console.log("add first");
                // Block height   
                newBlock.height = 0;
                // UTC timestamp
                newBlock.time = new Date().getTime().toString().slice(0, -3);
                // previous block hash
                newBlock.previousBlockHash = "";
                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Adding block object to chain
                let putblock = await this.putBlock(0, JSON.stringify(newBlock));
                return putblock;

            }
        }
        catch (err) {
            console.log(err.message);
            return err.message; }
        // waits to get all values array

    }



    async addBlock(newBlock) {

        try {
            // waits to get the current height

            let height = parseInt(await this.getBlockHeight(), 10);
            //if Height >-1 means there is an block(s) exsist if not an Genisis-Block 
            if (height >= 0) {
                let prevoius_block = await this.getBlock(height);
                console.log(prevoius_block);
                // Block height   
                newBlock.height = height + 1;
                // UTC timestamp
                newBlock.time = new Date().getTime().toString().slice(0, -3);
                // previous block hash
                newBlock.previousBlockHash = prevoius_block.hash; //JSON.parse(alldata[alldata.length - 1]).hash;
                console.log(newBlock.previousBlockHash);
                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Adding block object to chain
                let putblock = await this.putBlock(newBlock.height, JSON.stringify(newBlock));
                return putblock;

            }
            else {

                // returns Genisis Block when trying to add new Block to emptychain
                let prevoius_block = await this.getBlock(0);
                let height = 0;
                //if Height >-1 means there is an block(s) exsist if not an Genisis-Block 
                prevoius_block = await this.getBlock(height);
                console.log(prevoius_block);
                // Block height   
                newBlock.height = height + 1;
                // UTC timestamp
                newBlock.time = new Date().getTime().toString().slice(0, -3);
                // previous block hash
                newBlock.previousBlockHash = prevoius_block.hash; //JSON.parse(alldata[alldata.length - 1]).hash;
                console.log(newBlock.previousBlockHash);
                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Adding block object to chain
                let putblock = await this.putBlock(newBlock.height, JSON.stringify(newBlock));
                return putblock;

                //eturn JSON.stringify(prevoius_block);


            }
        }
        catch (err) {
            console.log(err.message);
            return err.message; }

    }


    // get block
    async getBlock(blockHeight) {
        try {
            let block = await db.get(blockHeight);;

            return JSON.parse(block);
        }
        catch (err) {
            console.log(err.message);
            return err.message;}

    }


    // Get block height
    getBlockHeight() {
        return new Promise(function (resolve, reject) {
            let i = 0;
            db.createReadStream({ keys: false, values: true }).on('data', function (data) {
                i = i + 1;


            }).on('close', function () {
                resolve(i - 1);
            });
        });
    }





    //Validate a given Block
    async validateBlock(blockHeight) {
        try {
            // get block object
            let block = await this.getBlock(blockHeight);
            // get block hash
            let blockHash = block.hash;
            // remove block hash to test block integrity
            block.hash = '';
            // generate block hash
            let validBlockHash = SHA256(JSON.stringify(block)).toString();
            // Compare
            if (blockHash === validBlockHash) {

                return true;
            } else {

                return false;
            }
        }
        catch (err) {
            console.log(err.message);
            return err.message;}
    }





    // Validates the blockchain
    async validateChain() {
        try {
            let errorLog = [];
            let alldata = await this.getAllData();
            for (var i = 0; i < alldata.length - 1; i++) {
                const validBlock = await this.validateBlock(i);
                if (!validBlock) errorLog.push(i);
                let blockHash = JSON.parse(alldata[i]).hash;
                let previousHash = JSON.parse(alldata[i + 1]).previousBlockHash;
                if (blockHash !== previousHash) {
                    errorLog.push(i);
                }

            }
            const validBlock = await this.validateBlock(alldata.length - 1);
            if (!validBlock) errorLog.push(alldata.length - 1);
            if (errorLog.length > 0) {
                console.log('Block errors = ' + errorLog.length);
                console.log('Blocks: ' + errorLog);
            } else {
                console.log('No errors detected');
            }

        }

        catch (err) {
            console.log(err.message);
            return err.message;
        }
    }

}
module.exports.Blockchain = Blockchain;
module.exports.Block = Block;