# Actinium-api (back-end)

## Stack
- project bootstrapped with [Nest.js](https://nestjs.com/)

## Database and project setup 
* Start docker container with postgres database
  ```bash
  $ docker:up
  ``` 
  (argument -d means detached mode)
* Create database `actinium_dev` in DB;
* Create .env file: 
  ```bash
  $ cp env.example .env
  ``` 
  Fill correct env variables in .env file;
* Run migrations:
  ```bash
  $ npm run migration:run
  ```

## Seed application with initial data 
1) Fill common test data: 
  * run on console 
  ```bash 
  $ curl http://localhost:3030/api/import-data/default
  ``` 
  * or open `http://localhost:3030/api/import-data/default`
  
2) Fill customer to test imported orders:
  * run on console
  ```bash
  $ curl http://localhost:3030/api/customer/default
  ```
  * process this file `test-imported-order` to import order for this customer
  
3) Fill data for imported-orders:
  * add files to `order_import/unprocessed` folder 
    * run on console   
    ```bash 
    $ curl http://localhost:3030/api/import-data/xml-order
    ``` 
    * or open `http://localhost:3030/api/import-data/xml-order`


## Start application

```bash
# development mode
$ npm run start

# development watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Work with typeorm:
* Create a new migration file:
  ```bash 
  $ npm run migration:create -n <migration_name>
  ```
* Run migrations:
  ```bash
  $ npm run migration:run
  ```
  
## Work with docker container

### Pay attention, you have to create you own `docker-dev.env` file to run docker container

*  start docker container 
```bash
$ npm run docker:up
```
* stop containers and networks
```bash
$ docker-compose stop
```
* stop and remove containers and networks
```bash
$ npm run docker:down
```
