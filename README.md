# blockchain-Notary-Service webservice
	This is a simple project using webservice to consum private blockchain backend  to allow users to add stars to blockchain by validating thier identity

## Prerequisites Packages
   - Expressjs
   - level
   - crypto-js
   - bitcoinjs-lib
   - bitcoinjs-message
## Install command
  to install prerequisites   run  `npm install`	
## Start command
  to start the application run  `npm start` or `node server.js`
## server.js
   this is the starting script to start the server at defined port in the .env file  ,in this project port is 8000
## app.js
  this where handling the midleware for the restful api and route the request to its endpoint

## ./api/Routes directory:  
   - block.js is  the routes endpoints for the restful api   
     - Get route handles get method requests and returns requested blockheight   
        ```
        {"hash":"47b8a9c0d947f255c83f37dfbca715908351e7e1401bb6d8725229355900a922","height":0,
        "body":"First block in the chain - Genesis block","time":"1534100203","previousBlockHash":""}
        ```
     - Post route handles Post method requests and adds new block to the blockchain 
            as body payload in this format 
            ```
            {"body":"block body contents"} 
             ```                              
           and returns back added new block in JSON format 
            ```
            {"hash":"47b8a9c0d947f255c83f37dfbca715908351e7e1401bb6d8725229355900a922","height":1,"body":"{"address":"1LFZtQVeBtKfV3u9YAKvbVMfCH7oSoXgQj",
                 "star":{"ra":"16h 29m 1.0s","dec":"-26° 29  24.9","con":"test","story":"466f756e642020737461727573696e6768747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f""}
                 }","time":"1534100203","previousBlockHash":"ff33a9c0d947f255c83f37aebca715908351e7e1401bb6d872522935590033cd"}
            ``` 
   - requestValidation.js  is  the routes endpoints to  handle request validation
     - Post will recive an wallet address in JSON format 
        ```
        {'address':'1LFZtQVeBtKfV3u9YAKvbVMfCH7oSoXgQj'}
        ```
       if this wallet address validation request not exist or expired  an new validation request window of 5 mintues created  	,if exist will return remaining time to expire 
       response is in JSON format  contains a meesage to be signed ,wallet address ,request timestamp,validation window
       ```
         {
          "address": "1LFZtQVeBtKfV3u9YAKvbVMfCH7oSoXgQj",
          "requestTimeStamp": 1537277998808,
          "message": "1LFZtQVeBtKfV3u9YAKvbVMfCH7oSoXgQj:1537277998808:starRegistry",
          "validationWindow": 300  }
       ```
   - message-signature.js is the routes endpoint  to handle validating users message signature
     - /validate post endpoint will receive wallet address and signature in JSON format 
        {"address":"1LFZtQVeBtKfV3u9YAKvbVMfCH7oSoXgQj", "signature": "IAdbnXWajS1C3DYG93o6JzpgMqrtduN4mX8uk0ejbnH29dihst7Hy5+kukinvckG4lrw+nXyX7XdwO1VRiCOVuk=="}
        when the validation request window still valid and the signature is valid
        a response  will returned contains 
        register star flag=true
        status object contains 
        - address
        - request timestamp
        - message
        - validation window
        message signature flag= valid
        ```
        {
          "registerStar": true,
            "status": {
                         "address": "1LFZtQVeBtKfV3u9YAKvbVMfCH7oSoXgQj",
                         "requestTimeStamp": 1537272803729,
                         "message": "1LFZtQVeBtKfV3u9YAKvbVMfCH7oSoXgQj:1537272803729:starRegistry",
                         "validationWindow": 256,
                         "messageSignature": "valid"
                                           }
                                             }
      ```                                             
                                             
   - stars.js this rout to handle stars look up 
     - /address Get endpoint will look up for stars in blockchain for given address in a JSON format 
       ```                                                 
        [
          {
            "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
            "height": 1,
            "body": {
              "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
              "star": {
                "ra": "16h 29m 1.0s",
                "dec": "-26° 29' 24.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
              }
            },
            "time": "1532296234",
            "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
          },
          {
            "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
            "height": 2,
            "body": {
              "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
              "star": {
                "ra": "17h 22m 13.1s",
                "dec": "-27° 14' 8.2",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
              }
            },
            "time": "1532330848",
            "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
          }
        ]
        ```   
     - /hash Get endpoint will look up for  a star in blockchain for  a given  hash in  JSON format
     
       ```
        {
          "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
          "height": 1,
          "body": {
            "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
            "star": {
              "ra": "16h 29m 1.0s",
              "dec": "-26° 29' 24.9",
              "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
              "storyDecoded": "Found star using https://www.google.com/sky/"
            }
          },
          "time": "1532296234",
          "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
        }
        ```
## ./api/classes directory:
   - private-blockchain.js is the block and blockchain classes 
     - Block class 
       - it is the template structure for the block
     - Blockchain class
       - this class used to get the blockchain information from leveldb 
       - add Genisis Block "first Block at heigth 0" 
       - methods to add new block,getblock by height, get block height ,validates a block and chain validation
       
   - Validation-db.js  is the ValidationRequest  and Validationdb classes 
     - ValidationRequest class 
       - it is the template structure for the ValidationRequest
     - Validationdb class
       - this class used to get the ValidationRequests information from leveldb 
       - add new validation request when user request
       - methods to add new ValidationRequest by address  "will  generate new validateion request if invalid or not exist",getValidationRequest by address "will not generate new validateion request" ,IsExist,IsItValidWindow and IsitValidSignature  
        




 