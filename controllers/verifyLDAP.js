let jwt = require('jsonwebtoken');
let bodyParser = require('body-parser');
let config = require('../config').authSecret;
let formidable = require('formidable');
let bcrypt = require('bcryptjs');
let uuidv4 = require('uuid/v4');
let nodemailer = require('nodemailer');
let mailer = require('../config');
let approver = require('../config');
let mysql = require('../config').pool;

let passport = require('passport');
let LdapStrategy = require('passport-ldapauth');
let ldap = require('../config').ldap_config;

module.exports = function(app){

    // api to verify account :3
    app.post('/api/login', function(req, res){
        let form = new formidable.IncomingForm();

        form.parse(req, function(err, fields){
            if(err){return res.send({err: 'Form parse error.'})};

            if(fields){
                let form_login_details = fields;

                if(form_login_details.authenticity_token && form_login_details.username && form_login_details.password){

                    // verify authenticity_token from fields
                    let token = fields.authenticity_token;

                    if(!token){
                        res.send({err: 'Invalid login'});
                    } else {

                        // check ifTokenValid
                        function isTokenValid(){
                            return new Promise(function(resolve, reject){

                                jwt.verify(token, config.secret, function(err, decoded){
                                    if(err){ reject('Invalid') };

                                    let isSignUpValidToken = decoded.claim;

                                    if(isSignUpValidToken.signup == 'valid'){
                                        resolve();
                                    } else {
                                        let invalidToken = 'Invalid';
                                        reject(invalidToken);
                                    }

                                });

                            });
                        }

                        isTokenValid().then(function(){

                            let credentials = {
                                username: form_login_details.username,
                                pass: form_login_details.password
                            };

                            let OPTS = {
                                server: {
                                    url: ldap.url,
                                    bindDN: ldap.bindUser,
                                    bindCredentials: ldap.bindPass,
                                    searchFilter: '(sAMAccountName={{username}})',
                                    searchBase: ldap.searchBase,
                                    connectionTimeout: ldap.connectionTimeout
                                },
                                credentialsLookup: function(){
                                    return { username: credentials.username , password: credentials.pass };
                                }
                            };
                        
                            let strategy = new LdapStrategy(OPTS);
                            passport.use(strategy);
                            passport.initialize();

                            res.render('index', passport.authenticate('ldapauth', function(err, user, info){
                                if(err){
                                    res.send({err: err});
                                } else if(!user){
                                    res.send({err: info.message});
                                } else {
                                    
                                    /** Admin feature only */
                                    function for_admins(){
                                        return new Promise(function(resolve, reject){
                                            mysql.getConnection(function(err, connection){
                                                if(err){return reject(err)};

                                                connection.query({
                                                    sql: 'SELECT * FROM brs_admins WHERE username = ?',
                                                    values: [user.sAMAccountName]
                                                },  function(err, results){
                                                    if(err){return reject(err)};

                                                    if(typeof results !== 'undefined' && results !== null && results.length > 0 ){
                                                        let isAdmin = true;

                                                        resolve(isAdmin);
                                                    } else {
                                                        let isAdmin = false;

                                                        resolve(isAdmin);
                                                    }
                                                });

                                                connection.release();
                                            });

                                        });
                                    }

                                    return for_admins().then(function(isAdmin){
                                        if(isAdmin){
                                            let token = jwt.sign({
                                                id: user.employeeID, // diff from employeeNumber
                                                claim: {
                                                    employeeNumber: user.employeeNumber,
                                                    displayName: user.displayName,
                                                    givenName: user.givenName,
                                                    title: user.title,
                                                    department: user.department,
                                                    username: user.sAMAccountName,
                                                    isAdmin: true
                                                }
        
                                            }, config.secret);
        
                                            res.cookie('auth', token);
                                            res.status(200).send({auth: 'Authenticated'});

                                        } else {
                                            let token = jwt.sign({
                                                id: user.employeeID, // diff from employeeNumber
                                                claim: {
                                                    employeeNumber: user.employeeNumber,
                                                    displayName: user.displayName,
                                                    givenName: user.givenName,
                                                    title: user.title,
                                                    department: user.department,
                                                    username: user.sAMAccountName,
                                                    isAdmin: false
                                                }
        
                                            }, config.secret);
        
                                            res.cookie('auth', token);
                                            res.status(200).send({auth: 'Authenticated'});
                                        }
                                    });

                                }

                            }));

                        }, function(err){
                            if(err){return res.send({err: err + ' token. Please refresh the page.'})};
                        });


                    }

                }

            } else {
                res.send({err: 'No fields found'});
            }


        });


    });

}