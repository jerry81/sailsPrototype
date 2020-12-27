# trustana koajs

 nodejs web server with mongo driver

 prerequisite - a locally running mongo db server

### running instructions
  0. yarn
  1. nav to src folder
  2. node ./controller/server.js

### explanation

  1.  since the free version of mongodb does not support db at rest encryption, application level encryption was used, using node native crypto library
  2.  for preparing files for download, a temp folder was created.  The files written here should be cleaned after being served to the client.

### TODO

  1.  unit tests
  2.  deployment (dockerfile, k8s yamls)