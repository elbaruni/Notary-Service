/* ===== Leveldb ===========================================
|  Learn more: level: https://github.com/Level/level        |
|  =========================================================*/
const level = require('level');
const validationDB = './validationdataelb';
const db = level(validationDB);


// Validation Request Object  to keep each request information 
class ValidationRequest {
    constructor(walletaddress) {
        this.address = walletaddress;
        this.timestamp = 0;
        this.ExpiresTimeStamp = 0;
        this.validsignature = false;
        this.message = "";
        
    }
}
// This Calss to store each request and manage validations 
class Validationdb{

    constructor() {
       
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
    putValidationRequest(key, value) {
        return new Promise(function (resolve, reject) {
            db.put(key, value, function (err) {
                if (err) reject(err);
                console.log('fff' + value);
                resolve(value);
            })

        });
    }


    //Delete from level db 
    DeleteValidationRequest(key, value) {
        return new Promise(function (resolve, reject) {
            db.del(key , function (err) {
                if (err) reject(err);
                resolve(true);
            })

        });
    }
    //===================end of helper Methods Section======================================


    //====================start of Class Methods====================================
    async ValidationRequest(Address) {  /* this method used to generate new validation request if the requesting address not exist or the validation window expired, 
    and if exist  returns the validation request
    */
        try {

            let ex = await this.IsExist(Address); // check if request address is exist 
            if (ex) { // yes exist 
                
                 
                 
               

                let validationrequest = await db.get(Address);
                validationrequest = JSON.parse(validationrequest);

                let check = await this.IsItValidWindow(validationrequest.timestamp, new Date().getTime(), 300000); //check if the validation window still valid
                if (check) { 
                    
                    // if it is valid window return validationrequest object 
                    
                     
                    return validationrequest;
                }
                else {
                  // if not Valid window   Generate new Validation request object with default values and new timesstamp
                    let validationrequest = new ValidationRequest(Address);
                    
                    validationrequest.timestamp = parseInt(new Date().getTime(),10);
                    validationrequest.ExpiresTimeStamp = parseInt(parseInt(validationrequest.timestamp, 10) + 300000, 10);
                    validationrequest.message = `${validationrequest.address}:${validationrequest.timestamp}:starRegistry`;
                    
                    // after sucesseful insertion returning the added object
                    let putvalidationrequest = await this.putValidationRequest(validationrequest.address, JSON.stringify(validationrequest));
                    putvalidationrequest = JSON.parse(putvalidationrequest);
                   
                    return putvalidationrequest;
                } 
            } else {
               ///here when the address is not exist creating new validation request object with default values and current time stamp
                let validationrequest = new ValidationRequest(Address);
                validationrequest.timestamp = parseInt(new Date().getTime(), 10);
                validationrequest.ExpiresTimeStamp = parseInt(parseInt(validationrequest.timestamp, 10) + 300000, 10);
                validationrequest.message = `${validationrequest.address}:${validationrequest.timestamp}:starRegistry`
                // after sucesseful insertion returning the added object
                let putvalidationrequest = await this.putValidationRequest(validationrequest.address, JSON.stringify(validationrequest));
                putvalidationrequest= JSON.parse(putvalidationrequest);
               
                return putvalidationrequest;

 
            }
            

        }
        catch (err) {
            //handling any error and returns 
            console.log(err.message);
            return err.message;
        }

    }




    async getValidationRequest(Address) {


        try {
            let validationrequest = await db.get(Address);
            validationrequest = JSON.parse(validationrequest);
            
            return validationrequest;
        }
        catch (err) {
            console.log(JSON.stringify(err.message)); 
            return { Error: err.message };



        }



    }
    // method checks if the address is exist 
    async IsExist(Address) {
        try {
            let validationrequest = await db.get(Address);
           // console.log("hi");
            return true;
        }
        catch (err) {
            if (err.notFound) {
              //  console.log("bye");
                return false;
            }
            console.log(err.message);
            return err.message;
        }

    }
    // method checks if the validation window still valid 
     IsItValidWindow(RequestTimeStamp, againstTimeStamp, timeWindow) {
       
        if (RequestTimeStamp + timeWindow >= againstTimeStamp) {
            
            return true;
        }
        
        return false;
    }

    // method returns the validate of the signature provided by the user // a flag used to determine the signature validation to allow or deny Star registration
    async IsitValidSignature(Address) {
        try {
            let validationrequest = await db.get(Address);

            validationrequest = JSON.parse(validationrequest);
            return validationrequest.validsignature;
        }
        catch (err) {
           
            return err.message;
        }

     }
   

        
    
}

module.exports.ValidationRequest = ValidationRequest;
module.exports.Validationdb = Validationdb;

