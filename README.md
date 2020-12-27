# trustana koajs

 nodejs web server with mongo driver

 prerequisite - a locally running mongo db server

### running instructions
  0. yarn
  1. nav to src folder
  2. node ./controller/server.js

### explanation

  1.  since the free version of mongodb does not support db at rest encryption, application level encryption was used, using node native crypto library. 
  2.  all string fields are encrypted with the user's password, sent as a request header before being written to db.  resume file binary data is also encrypted before being saved in the db.
  3.  for preparing files for download, a temp folder was created.  The files written here should be cleaned after being served to the client.
  4.  bson objects save the resumes, and have a limit of 16MB, a OSS/S3 server should be used for long term solutions

### API

all calls not starting with ex2 require a decryption-token header (must match the user's password field in order to decrypt the data)
  
post /uploadResume
body: formData with { file: {File Object} }
description: uploads a resume 

get /downloadResume/:id/:fileName
path params: id - the resumeId, fileName - the name of the file
description: downloads the decrypted resume locally

get /user/findAll
description: gets all users in db

put /user/:id
path params: id - user id
body: { name, email, resumeId, resumeName }
description: updates the user with the fields

post /user
body: { name, email, resumeId, resumeName }
desc: creates user with the fields

post /ex2/sensitiveData
body: { value }
desc: gets the currently stored senstive Data (stored as a singleton)

post /ex2/generateToken
body: { expiration, oneTime }
desc: creates a token and stores it in the db, returning both the encrypted string and the metadata (including obj id) of the token.  

get /ex2/sensitiveData/:token?tokenId
path params: token - the encrypted token containing metadata about the token
query params: tokenId - the id of the token used for decryption
description - this attempts to decrypt the sensitive data singleton saved and returns the cleartext string 
  

### TODO

  1.  unit tests
  2.  deployment (dockerfile, k8s yamls)
  3.  modularization of controllers and routes
  4.  Move resumes out of mongo to OSS/S3
  5.  hide the hardcoded encryption key for sensitive data in exercise 2 from source code