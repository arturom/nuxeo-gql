# nuxeo-gql
A basic GraphQL server for Nuxeo


### Prerequisites
 - Nodejs and NPM
 - A Nuxeo server and an account


#### Getting started
Clone the repo and install dependencies
```shell
git clone https://github.com/arturom/nuxeo-gql.git
cd nuxeo-gql
npm install
```

#### Start Nuxeo GraphQL server
The following command connects to a Nuxeo server runing in http://localhost:8080 with the default `Administrator` password
``` shell
node index.js
# Open  http://localhost:4000 in your browser
```

#### Connect to a different server or provide a different account
``` shell
export NUXEO_HOST="http://other-nuxeo-host:8080/nuxeo"
export NUXEO_USER="SuperAdmin"
export NUXEO_PASSWORD="SecretPassword"
node index.js
```

#### Or the same process in a single line:
``` shell
NUXEO_HOST="http://other-nuxeo-host:8080/nuxeo" NUXEO_USER="SuperAdmin" NUXEO_PASSWORD="SecretPassword" node index.js
```