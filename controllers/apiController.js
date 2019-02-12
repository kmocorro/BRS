let formidable = require('formidable');
let XLSX = require('xlsx');
let moment = require('moment');
let mysql = require('../config').poolLocal;

module.exports = function(app){

    /** Metadata for files to be uploaded */
    function file_metadata(){
        return new Promise(function(resolve, reject){

            let meta_data = {

                APL: {
                    name: 'Active Parts List',
                    nickname: 'F38',
                    acronym: 'APL',
                    filename: 'APL',
                    url: '/uploader?format=APL'
                },

                SCAT: {
                    name: 'Spares Category',
                    nickname: 'Category',
                    acronym: 'SCAT',
                    filename: 'SCAT',
                    url: '/uploader?format=SCAT'
                },

                OH: {
                    name: 'On-Hand',
                    nickname: 'On-Hand',
                    acronym: 'OH',
                    filename: 'OH',
                    url: '/uploader?format=OH'
                },  

                PO: {
                    name: 'Purchase Order',
                    nickname: 'Purchase Order',
                    acronym: 'PO',
                    filename: 'PO',
                    url: '/uploader?format=PO'
                },
                
                SCOST: {
                    name: 'Standard Costs',
                    nickname: 'Std Costs',
                    acronym: 'SCOST',
                    filename: 'SCOST',
                    url: '/uploader?format=SCOST'
                },

                SLLT: {
                    name: 'Supplier List & Lead Time',
                    nickname: 'Supplier List and Lead Time',
                    acronym: 'SLLT',
                    filename: 'SLLT',
                    url: '/uploader?format=SLLT'
                },
                
                /* i forgot. wala na pala tayong pos hahahaha nag email pa ko. xd
                POS: {
                    name: 'Purchase Order Status',
                    nickname: 'PO Status',
                    acronym: 'POS',
                    filename: 'POS',
                    url: '/uploader?format=POS'
                },
                */
                
                POR: {
                    name: 'Purchase Order Receipt',
                    nickname: 'PO Receipt',
                    acronym: 'POR',
                    filename: 'POR',
                    url: '/uploader?format=POR'
                }
                
            }
            
            resolve(meta_data);
        });
    }

    /** Metadata for search feature */
    function search_metadata(){
        return new Promise(function(resolve, reject){

            let search_metadata = {

                sidebar_list: [],

                item_attributes: {
                    type: 'item-attributes',
                    name: 'Item attributes',
                    description: 'APL, SCAT, SCOST, SLLT joins',
                    table: 'apl_data, scat_data, scost_data, sllt_data joined in a view table - item_attributes',
                    url: '/search?type=item-attributes',
                    table_headers: ['Part Number', 'Description', 'Item Status', 'Category', 'Standard Cost ($)', 'Pre Lead time', 'Lead time', 'Post Lead time', 'Supplier', 'Upload Date']
                },

                po_status:{
                    type: 'po-status',
                    name: 'Purchase Order Status',
                    description: 'PO',
                    table: 'po_data',
                    url: '/search?type=po-status',
                    table_headers: ['Part Number', 'Supplier', 'PO Number', 'PO Qty', 'PO Del', 'PO in transit', 'PO Bal', 'Promised Date', 'Auth Status', 'Upload Date']
                },

                on_hand:{
                    type: 'on-hand',
                    name: 'On-Hand',
                    description: 'OH',
                    table: 'on_hand',
                    url: '/search?type=on-hand',
                    table_headers: ['Org code', 'Part Number', 'Sub Inventory', 'Locator', 'UOM', 'Qty', 'Upload Date']
                }
            }


            resolve(search_metadata);

        });
    }

    app.get('/', function(req, res){

    });
    
    app.get('/search', function(req, res){

        if(req.query.type == 'item-attributes'){
            file_metadata().then(function(file_metadata){
                return search_metadata().then(function(search_metadata){
                    if(req.query.type == search_metadata.item_attributes.type){
                        let label = search_metadata.item_attributes.name;
                        let description = search_metadata.item_attributes.description;
                        let type = search_metadata.item_attributes.type;
                        let url = search_metadata.item_attributes.url;
                        let table_headers = search_metadata.item_attributes.table_headers;
                        let query_from_client = req.query.q;

                        let current_date = moment(new Date()).calendar();

                        if(req.query.q){
                            return query_item_attributes().then(function(query_results){

                                res.render('search_pn',{label, description, type, url, table_headers, file_metadata, search_metadata, query_results, query_from_client, current_date});
                            });
                        } else {
                            let query_results = []
                            res.render('search_pn',{label, description, type, url, table_headers, file_metadata, search_metadata, query_results, query_from_client, current_date});
                        }
                    }
                });
            });
        } else if(req.query.type == 'po-status'){
            file_metadata().then(function(file_metadata){
                return search_metadata().then(function(search_metadata){
                    let label = search_metadata.po_status.name;
                    let description = search_metadata.po_status.description;
                    let type = search_metadata.po_status.type;
                    let url = search_metadata.po_status.url;
                    let table_headers = search_metadata.po_status.table_headers;
                    let query_from_client = req.query.q;

                    let current_date = moment(new Date()).calendar();

                    if(req.query.q){
                        return query_po_status().then(function(query_results){

                            res.render('search_pn',{label, description, type, url, table_headers, file_metadata, search_metadata, query_results, query_from_client, current_date});
                        });
                    } else {
                        let query_results = []
                        res.render('search_pn',{label, description, type, url, table_headers, file_metadata, search_metadata, query_results, query_from_client, current_date});
                    }
                        
                });
            });
        } else if(req.query.type == 'on-hand'){
            file_metadata().then(function(file_metadata){
                return search_metadata().then(function(search_metadata){
                    if(req.query.type == search_metadata.on_hand.type){
                        let label = search_metadata.on_hand.name;
                        let description = search_metadata.on_hand.description;
                        let type = search_metadata.on_hand.type;
                        let url = search_metadata.on_hand.url;
                        let table_headers = search_metadata.on_hand.table_headers;
                        let query_from_client = req.query.q;
    
                        let current_date = moment(new Date()).calendar();
    
                        if(req.query.q){
                            return query_on_hand().then(function(query_results){
    
                                res.render('search_pn',{label, description, type, url, table_headers, file_metadata, search_metadata, query_results, query_from_client, current_date});
                            });
                        } else {
                            let query_results = []
                            res.render('search_pn',{label, description, type, url, table_headers, file_metadata, search_metadata, query_results, query_from_client, current_date});
                        }
                    }
                });
            });
        } else {
            res.send('Invalid link');
        }

        /** item-attributes query */
        function query_item_attributes(){
            return new Promise(function(resolve, reject){
                
                let query_pn_array = (req.query.q).split(' '); // split to array
                let uniq_pn_array = function(){ // accept only uniq pn numbers
                    return Array.from(new Set(query_pn_array));
                }

                mysql.getConnection(function(err, connection){
                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT * FROM item_attributes WHERE pn IN (?)',
                        values: [uniq_pn_array()]
                    },  function(err, results){
                        if(err){return reject(err)};

                        let query_result = [];

                        for(let i=0; i<results.length; i++){
                            query_result.push({
                                pn : results[i].pn,
                                description: results[i].description,
                                items_status_code: results[i].items_status_code,
                                category: results[i].category,
                                std_cost: results[i].std_cost,
                                pre_lt: results[i].pre_lt,
                                lt: results[i].lt,
                                post_lt: results[i].post_lt,
                                sllt_supplier: results[i].sllt_supplier,
                                upload_date: moment(results[i].upload_date).format('llll')
                            });
                        }

                        resolve(query_result);

                    });

                    connection.release();

                });

            });
        }

        /** po-status query */
        function query_po_status(){
            return new Promise(function(resolve, reject){
                
                let query_pn_array = (req.query.q).split(' '); // split to array
                let uniq_pn_array = function(){ // accept only uniq pn numbers
                    return Array.from(new Set(query_pn_array));
                }

                mysql.getConnection(function(err, connection){
                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT pn, supplier, po, po_qty, po_del, po_in_transit, po_bal, promised_dt, auth_status, upload_date FROM po_data WHERE upload_date = (SELECT MAX(upload_date) FROM po_data) AND auth_status != "NULL" AND pn IN (?)',
                        values: [uniq_pn_array()]
                    },  function(err, results){
                        if(err){return reject(err)};

                        let query_result = [];

                        for(let i=0; i<results.length; i++){
                            query_result.push({
                                pn : results[i].pn,
                                supplier: results[i].supplier,
                                po: results[i].po,
                                po_qty: results[i].po_qty,
                                po_del: results[i].po_del,
                                po_in_transit: results[i].po_in_transit,
                                po_bal: results[i].po_bal,
                                promised_dt: moment(results[i].promised_dt).format('llll'),
                                auth_status: results[i].auth_status,
                                upload_date: moment(results[i].upload_date).format('llll')
                            });
                        }

                        resolve(query_result);

                    });

                    connection.release();

                });

            });
        }

        /** on-hand query */
        function query_on_hand(){
            return new Promise(function(resolve, reject){
                
                let query_pn_array = (req.query.q).split(' '); // split to array
                let uniq_pn_array = function(){ // accept only uniq pn numbers
                    return Array.from(new Set(query_pn_array));
                }

                mysql.getConnection(function(err, connection){
                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT org_code, pn, subinv, locator, uom, qty, upload_date  FROM oh_data WHERE upload_date = (SELECT MAX(upload_date) FROM oh_data) AND pn IN (?)',
                        values: [uniq_pn_array()]
                    },  function(err, results){
                        if(err){return reject(err)};

                        let query_result = [];

                        for(let i=0; i<results.length; i++){
                            query_result.push({
                                pn : results[i].pn,
                                org_code: results[i].org_code,
                                subinv: results[i].subinv,
                                locator: results[i].locator,
                                uom: results[i].uom,
                                qty: results[i].qty,
                                upload_date: moment(results[i].upload_date).format('llll')
                            });
                        }

                        resolve(query_result);

                    });

                    connection.release();

                });

            });
        }

    });

    app.get('/uploader', function(req, res){

        /** FORMAT selection phase */
        if(req.query.format == 'APL'){
            file_metadata().then(function(meta_data){
                search_metadata().then(function(search_metadata){
                    if(req.query.format == meta_data.APL.acronym){
                        let label = meta_data.APL.name;
                        let acronym = meta_data.APL.acronym;
                        let current_date = moment(new Date()).calendar();

                        return file_apl_timeline().then(function(timeline){
                            res.render('upload_admin',{label, meta_data, acronym, timeline, search_metadata, current_date});
                        });

                    }
                });
            });
        } else if(req.query.format == 'SCAT'){
            file_metadata().then(function(meta_data){
                search_metadata().then(function(search_metadata){

                    if(req.query.format == meta_data.SCAT.acronym){
                        let label = meta_data.SCAT.name;
                        let acronym = meta_data.SCAT.acronym;
                        let current_date = moment(new Date()).calendar();
                        
                        return file_scat_timeline().then(function(timeline){
                            res.render('upload_admin',{label, meta_data, acronym, timeline, search_metadata, current_date});
                        });
                    }
                });
            });
        } else if(req.query.format == 'OH'){
            file_metadata().then(function(meta_data){
                search_metadata().then(function(search_metadata){
                    if(req.query.format == meta_data.OH.acronym){
                        let label = meta_data.OH.name;
                        let acronym = meta_data.OH.acronym;
                        let current_date = moment(new Date()).calendar();
                        
                        return file_oh_timeline().then(function(timeline){
                            res.render('upload_admin',{label, meta_data, acronym, timeline, search_metadata, current_date});
                        });
                    }
                });
            });
        } else if(req.query.format == 'PO'){
            file_metadata().then(function(meta_data){
                search_metadata().then(function(search_metadata){
                    if(req.query.format == meta_data.PO.acronym){
                        let label = meta_data.PO.name;
                        let acronym = meta_data.PO.acronym;
                        let current_date = moment(new Date()).calendar();
                        
                        return file_po_timeline().then(function(timeline){
                            res.render('upload_admin',{label, meta_data, acronym, timeline, search_metadata, current_date});
                        });
                    }
                });
            });
        } else if(req.query.format == 'SCOST'){
            file_metadata().then(function(meta_data){
                search_metadata().then(function(search_metadata){
                    if(req.query.format == meta_data.SCOST.acronym){
                        let label = meta_data.SCOST.name;
                        let acronym = meta_data.SCOST.acronym;
                        let current_date = moment(new Date()).calendar();
                        
                        return file_scost_timeline().then(function(timeline){
                            res.render('upload_admin',{label, meta_data, acronym, timeline, search_metadata, current_date});
                        });
                    }
                });
            });
        } else if(req.query.format == 'SLLT'){
            file_metadata().then(function(meta_data){
                search_metadata().then(function(search_metadata){
                    if(req.query.format == meta_data.SLLT.acronym){
                        let label = meta_data.SLLT.name;
                        let acronym = meta_data.SLLT.acronym;
                        let current_date = moment(new Date()).calendar();
                        
                        return file_sllt_timeline().then(function(timeline){
                            res.render('upload_admin',{label, meta_data, acronym, timeline, search_metadata, current_date});
                        });
                    }
                });
            });
        } else if(req.query.format == 'POR'){
            file_metadata().then(function(meta_data){
                search_metadata().then(function(search_metadata){
                    if(req.query.format == meta_data.POR.acronym){
                        let label = meta_data.POR.name;
                        let acronym = meta_data.POR.acronym;
                        let current_date = moment(new Date()).calendar();
                        
                        return file_por_timeline().then(function(timeline){
                            res.render('upload_admin',{label, meta_data, acronym, timeline, search_metadata, current_date});
                        });
                    }
                });
            });
        } else {
            res.send('Invalid link');
        }

        /** APL timeline */
        function file_apl_timeline(){
            return new Promise(function(resolve, reject){

                mysql.getConnection(function(err, connection){

                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT * FROM apl_logs ORDER BY id DESC;'
                    },  function(err, results){
                        if(err){return reject(err)};

                        let timeline_apl = [];

                        if(typeof results[0] !== 'undefined' && results[0] !== null && results.length > 0){

                            for(let i=0; i<results.length; i++){
                                
                                timeline_apl.push({
                                    excel_filename: results[i].excel_filename,
                                    excel_last_author: results[i].excel_last_author,
                                    upload_date: moment(results[i].upload_date).calendar(),
                                    exact_date: moment(results[i].upload_date).format('lll')
                                });
                            
                            }

                            resolve(timeline_apl);

                        } else {
                            resolve(timeline_apl)
                        }
                    });

                    connection.release();
            
                });

            });
        }

        /** SCAT */
        function file_scat_timeline(){
            return new Promise(function(resolve, reject){
                
                mysql.getConnection(function(err, connection){

                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT * FROM scat_logs ORDER BY id DESC;'
                    },  function(err, results){
                        if(err){return reject(err)};

                        let timeline_apl = [];

                        if(typeof results[0] !== 'undefined' && results[0] !== null && results.length > 0){

                            for(let i=0; i<results.length; i++){
                                
                                timeline_apl.push({
                                    excel_filename: results[i].excel_filename,
                                    excel_last_author: results[i].excel_last_author,
                                    upload_date: moment(results[i].upload_date).calendar(),
                                    exact_date: moment(results[i].upload_date).format('lll')
                                });
                            
                            }

                            resolve(timeline_apl);

                        } else {
                            resolve(timeline_apl)
                        }
                    });

                    connection.release();
            
                });

            });
        }

        /** OH */
        function file_oh_timeline(){
            return new Promise(function(resolve, reject){
                
                mysql.getConnection(function(err, connection){

                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT * FROM oh_logs ORDER BY id DESC;'
                    },  function(err, results){
                        if(err){return reject(err)};

                        let timeline_apl = [];

                        if(typeof results[0] !== 'undefined' && results[0] !== null && results.length > 0){

                            for(let i=0; i<results.length; i++){
                                
                                timeline_apl.push({
                                    excel_filename: results[i].excel_filename,
                                    excel_last_author: results[i].excel_last_author,
                                    upload_date: moment(results[i].upload_date).calendar(),
                                    exact_date: moment(results[i].upload_date).format('lll')
                                });
                            
                            }

                            resolve(timeline_apl);

                        } else {
                            resolve(timeline_apl)
                        }
                    });

                    connection.release();
            
                });

            });
        }

        /** PO */
        function file_po_timeline(){
            return new Promise(function(resolve, reject){
                
                mysql.getConnection(function(err, connection){

                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT * FROM po_logs ORDER BY id DESC;'
                    },  function(err, results){
                        if(err){return reject(err)};

                        let timeline_apl = [];

                        if(typeof results[0] !== 'undefined' && results[0] !== null && results.length > 0){

                            for(let i=0; i<results.length; i++){
                                
                                timeline_apl.push({
                                    excel_filename: results[i].excel_filename,
                                    excel_last_author: results[i].excel_last_author,
                                    upload_date: moment(results[i].upload_date).calendar(),
                                    exact_date: moment(results[i].upload_date).format('lll')
                                });
                            
                            }

                            resolve(timeline_apl);

                        } else {
                            resolve(timeline_apl)
                        }
                    });

                    connection.release();
            
                });

            });
        }

        /** SCOST */
        function file_scost_timeline(){
            return new Promise(function(resolve, reject){
                
                mysql.getConnection(function(err, connection){

                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT * FROM scost_logs ORDER BY id DESC;'
                    },  function(err, results){
                        if(err){return reject(err)};

                        let timeline_apl = [];

                        if(typeof results[0] !== 'undefined' && results[0] !== null && results.length > 0){

                            for(let i=0; i<results.length; i++){
                                
                                timeline_apl.push({
                                    excel_filename: results[i].excel_filename,
                                    excel_last_author: results[i].excel_last_author,
                                    upload_date: moment(results[i].upload_date).calendar(),
                                    exact_date: moment(results[i].upload_date).format('lll')
                                });
                            
                            }

                            resolve(timeline_apl);

                        } else {
                            resolve(timeline_apl)
                        }
                    });

                    connection.release();
            
                });

            });
        }

        /** SLLT */
        function file_sllt_timeline(){
            return new Promise(function(resolve, reject){
                
                mysql.getConnection(function(err, connection){

                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT * FROM sllt_logs ORDER BY id DESC;'
                    },  function(err, results){
                        if(err){return reject(err)};

                        let timeline_apl = [];

                        if(typeof results[0] !== 'undefined' && results[0] !== null && results.length > 0){

                            for(let i=0; i<results.length; i++){
                                
                                timeline_apl.push({
                                    excel_filename: results[i].excel_filename,
                                    excel_last_author: results[i].excel_last_author,
                                    upload_date: moment(results[i].upload_date).calendar(),
                                    exact_date: moment(results[i].upload_date).format('lll')
                                });
                            
                            }

                            resolve(timeline_apl);

                        } else {
                            resolve(timeline_apl)
                        }
                    });

                    connection.release();
            
                });

            });
        }

        /** POS - hidden again 
        function file_pos_timeline(){
            return new Promise(function(resolve, reject){
                
                mysql.getConnection(function(err, connection){

                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT * FROM pos_logs ORDER BY id DESC;'
                    },  function(err, results){
                        if(err){return reject(err)};

                        let timeline_apl = [];

                        if(typeof results[0] !== 'undefined' && results[0] !== null && results.length > 0){

                            for(let i=0; i<results.length; i++){
                                
                                timeline_apl.push({
                                    excel_filename: results[i].excel_filename,
                                    excel_last_author: results[i].excel_last_author,
                                    upload_date: moment(results[i].upload_date).calendar(),
                                    exact_date: moment(results[i].upload_date).format('lll')
                                });
                            
                            }

                            resolve(timeline_apl);

                        } else {
                            resolve(timeline_apl)
                        }
                    });

                    connection.release();
            
                });

            });
        }
        */

        /** POR */
        function file_por_timeline(){
            return new Promise(function(resolve, reject){
                
                mysql.getConnection(function(err, connection){

                    if(err){return reject(err)};

                    connection.query({
                        sql: 'SELECT * FROM por_logs ORDER BY id DESC;'
                    },  function(err, results){
                        if(err){return reject(err)};

                        let timeline_apl = [];

                        if(typeof results[0] !== 'undefined' && results[0] !== null && results.length > 0){

                            for(let i=0; i<results.length; i++){
                                
                                timeline_apl.push({
                                    excel_filename: results[i].excel_filename,
                                    excel_last_author: results[i].excel_last_author,
                                    upload_date: moment(results[i].upload_date).calendar(),
                                    exact_date: moment(results[i].upload_date).format('lll')
                                });
                            
                            }

                            resolve(timeline_apl);

                        } else {
                            resolve(timeline_apl)
                        }
                    });

                    connection.release();
            
                });

            });
        }

    });

    app.get('/search', function(req, res){


    });

    /** POST UPLOADER ROUTES - under - /uploader */
    app.post('/api/APL', function(req, res){

        let form = new formidable.IncomingForm();

        form.maxFileSize = 2 * 1024 * 1024; // max size 2MB. we can adjust this later ;)

        /** parse form & file */
        form.parse(req, function(err, fields, file){
            
            if(err){return res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid file. ' + err})}

            if(file){

                let excelFile = {
                    date_upload: new Date(),
                    path: file.upload_form.path,
                    name: file.upload_form.name,
                    type: file.upload_form.type,
                    date_modified: file.upload_form.lastModifiedDate
                }

                let workbook = XLSX.readFile(excelFile.path);
                let APL_Worksheet = XLSX.utils.sheet_to_json(workbook.Sheets['APL'], {header: 'A'});
                let cleaned_APL = [];

                let upload_date = new Date();

                // cleaning workbook sheets APL.
                for(let i=1; i<APL_Worksheet.length; i++){

                    if(APL_Worksheet[i].A){

                        cleaned_APL.push(

                            [APL_Worksheet[i].A,
                            APL_Worksheet[i].B,
                            APL_Worksheet[i].C,
                            upload_date]
    
                        );
                    }

                }

                // bulk insert thanks to dada! wohoo.
                function insertToAPL(){
                    return new Promise(function(resolve, reject){

                        mysql.getConnection(function(err, connection){
                            if(err){ return reject('Connection error') };

                            connection.query({
                                sql: 'INSERT INTO apl_data (pn, description, items_status_code, upload_date) VALUES ?',
                                values: [cleaned_APL]
                            },  function(err, results){
                                if(err){ return reject(err) };

                                resolve(results.insertID);
                            });

                        connection.release();
                            
                        });     
                        
                    });

                }

                insertToAPL().then(function(){

                    function insertToAPL_logs(){
                        return new Promise(function(resolve, reject){

                            let apl_logs = []

                            apl_logs.push(
                                [excelFile.name, '', upload_date]
                            )

                            mysql.getConnection(function(err, connection){
                                if(err){return reject(err)};

                                connection.query({
                                    sql: 'INSERT INTO apl_logs (excel_filename, excel_last_author, upload_date) VALUES ?',
                                    values:[apl_logs]
                                },  function(err, results){
                                    if(err){return reject(err)};
                                    
                                    resolve();
                                });

                                connection.release();

                            });
                                
                        });
                    }

                    insertToAPL_logs().then(function(){

                        res.send({auth:'<span class="fa fa-check" style="color: green;"></span> Successfully uploaded'});
                    },  function(err){
                        //console.log(err);
                        res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                    });

                },  function(err){
                    //console.log(err);
                    res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                });

            }

        });        

        /** form listener save to brs folder every upload file */
        form.on('fileBegin', function(name, file){
            
            let filePath = './public/brs/';
            let fileName = moment(new Date()).format('YYYY-MM-DD-h-m-s') + '-brs-APL.xlsx';

            if(file.name == 'APL.XLSX'){ // filename format is important. make sure to use appropriate filename per format ;)
                file.path = filePath + fileName;
            }
        });

        /** event listener for form errors */
        form.on('error', function(err){
        });

    });

    app.post('/api/SCAT', function(req, res){
        
        let form = new formidable.IncomingForm();

        form.maxFileSize = 2 * 1024 * 1024; // max size 2MB. we can adjust this later ;)

        /** parse form & file */
        form.parse(req, function(err, fields, file){
            
            if(err){return res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid file. ' + err})}

            if(file){

                let excelFile = {
                    date_upload: new Date(),
                    path: file.upload_form.path,
                    name: file.upload_form.name,
                    type: file.upload_form.type,
                    date_modified: file.upload_form.lastModifiedDate
                }

                let workbook = XLSX.readFile(excelFile.path);
                let SCAT_Worksheet = XLSX.utils.sheet_to_json(workbook.Sheets['SCAT'], {header: 'A'});
                let cleaned_SCAT = [];

                let upload_date = new Date();

                // cleaning workbook sheets SCAT.
                for(let i=1; i<SCAT_Worksheet.length; i++){

                    if(SCAT_Worksheet[i].A){

                        cleaned_SCAT.push(

                            [SCAT_Worksheet[i].A,
                            SCAT_Worksheet[i].B,
                            upload_date]
    
                        );
                    }

                }

                // bulk insert thanks to dada! wohoo.
                function insertToSCAT(){
                    return new Promise(function(resolve, reject){

                        mysql.getConnection(function(err, connection){
                            if(err){ return reject('Connection error') };

                            connection.query({
                                sql: 'INSERT INTO scat_data (pn, category, upload_date) VALUES ?',
                                values: [cleaned_SCAT]
                            },  function(err, results){
                                if(err){ return reject(err) };

                                resolve(results.insertID);
                            });

                        connection.release();
                            
                        });     
                        
                    });

                }

                insertToSCAT().then(function(){

                    function insertToSCAT_logs(){
                        return new Promise(function(resolve, reject){

                            let apl_logs = []

                            apl_logs.push(
                                [excelFile.name, '', upload_date]
                            )

                            mysql.getConnection(function(err, connection){
                                if(err){return reject(err)};

                                connection.query({
                                    sql: 'INSERT INTO scat_logs (excel_filename, excel_last_author, upload_date) VALUES ?',
                                    values:[apl_logs]
                                },  function(err, results){
                                    if(err){return reject(err)};
                                    
                                    resolve();
                                });

                                connection.release();

                            });
                                
                        });
                    }

                    insertToSCAT_logs().then(function(){

                        res.send({auth:'<span class="fa fa-check" style="color: green;"></span> Successfully uploaded'});
                    },  function(err){
                        //console.log(err);
                        res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                    });

                },  function(err){
                    //console.log(err);
                    res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                });

            }

        });        

        /** form listener save to brs folder every upload file */
        form.on('fileBegin', function(name, file){
            
            let filePath = './public/brs/';
            let fileName = moment(new Date()).format('YYYY-MM-DD-h-m-s') + '-brs-SCAT.xlsx';

            if(file.name == 'SCAT.XLSX'){ // filename format is important. make sure to use appropriate filename per format ;)
                file.path = filePath + fileName;
            }
        });

        /** event listener for form errors */
        form.on('error', function(err){
        });
    });
    
    app.post('/api/OH', function(req, res){
        
        let form = new formidable.IncomingForm();

        form.maxFileSize = 2 * 1024 * 1024; // max size 2MB. we can adjust this later ;)

        /** parse form & file */
        form.parse(req, function(err, fields, file){
            
            if(err){return res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid file. ' + err})}

            if(file){

                let excelFile = {
                    date_upload: new Date(),
                    path: file.upload_form.path,
                    name: file.upload_form.name,
                    type: file.upload_form.type,
                    date_modified: file.upload_form.lastModifiedDate
                }

                let workbook = XLSX.readFile(excelFile.path);
                let OH_Worksheet = XLSX.utils.sheet_to_json(workbook.Sheets['OH'], {header: 'A'});
                let cleaned_OH = [];

                let upload_date = new Date();

                // cleaning workbook sheets OH.
                for(let i=1; i<OH_Worksheet.length; i++){

                    if(OH_Worksheet[i].A){

                        cleaned_OH.push(

                            [OH_Worksheet[i].A,
                            OH_Worksheet[i].B,
                            OH_Worksheet[i].C,
                            OH_Worksheet[i].D,
                            OH_Worksheet[i].E,
                            OH_Worksheet[i].F,
                            upload_date]
    
                        );
                    }

                }

                // bulk insert thanks to dada! wohoo.
                function insertToOH(){
                    return new Promise(function(resolve, reject){

                        mysql.getConnection(function(err, connection){
                            if(err){ return reject('Connection error') };

                            connection.query({
                                sql: 'INSERT INTO oh_data (pn, org_code, subinv, locator, uom, qty, upload_date) VALUES ?',
                                values: [cleaned_OH]
                            },  function(err, results){
                                if(err){ return reject(err) };

                                resolve(results.insertID);
                            });

                        connection.release();
                            
                        });     
                        
                    });

                }

                insertToOH().then(function(){

                    function insertToOH_logs(){
                        return new Promise(function(resolve, reject){

                            let apl_logs = []

                            apl_logs.push(
                                [excelFile.name, '', upload_date]
                            )

                            mysql.getConnection(function(err, connection){
                                if(err){return reject(err)};

                                connection.query({
                                    sql: 'INSERT INTO oh_logs (excel_filename, excel_last_author, upload_date) VALUES ?',
                                    values:[apl_logs]
                                },  function(err, results){
                                    if(err){return reject(err)};
                                    
                                    resolve();
                                });

                                connection.release();

                            });
                                
                        });
                    }

                    insertToOH_logs().then(function(){

                        res.send({auth:'<span class="fa fa-check" style="color: green;"></span> Successfully uploaded'});
                    },  function(err){
                        //console.log(err);
                        res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                    });

                },  function(err){
                    //console.log(err);
                    res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                });

            }

        });        

        /** form listener save to brs folder every upload file */
        form.on('fileBegin', function(name, file){
            
            let filePath = './public/brs/';
            let fileName = moment(new Date()).format('YYYY-MM-DD-h-m-s') + '-brs-OH.xlsx';

            if(file.name == 'OH.XLSX'){ // filename format is important. make sure to use appropriate filename per format ;)
                file.path = filePath + fileName;
            }
        });

        /** event listener for form errors */
        form.on('error', function(err){
        });
    });
    
    app.post('/api/PO', function(req, res){
        
        let form = new formidable.IncomingForm();

        form.maxFileSize = 2 * 1024 * 1024; // max size 2MB. we can adjust this later ;)

        /** parse form & file */
        form.parse(req, function(err, fields, file){
            
            if(err){return res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid file. ' + err})}

            if(file){

                let excelFile = {
                    date_upload: new Date(),
                    path: file.upload_form.path,
                    name: file.upload_form.name,
                    type: file.upload_form.type,
                    date_modified: file.upload_form.lastModifiedDate
                }

                let workbook = XLSX.readFile(excelFile.path);
                let PO_Worksheet = XLSX.utils.sheet_to_json(workbook.Sheets['PO'], {header: 'A'});
                let cleaned_PO = [];

                let upload_date = new Date();

                // cleaning workbook sheets PO.
                for(let i=1; i<PO_Worksheet.length; i++){

                    if(PO_Worksheet[i].A){

                        cleaned_PO.push(

                            [PO_Worksheet[i].A,
                            PO_Worksheet[i].B,
                            PO_Worksheet[i].C,
                            PO_Worksheet[i].D,
                            PO_Worksheet[i].E,
                            PO_Worksheet[i].F,
                            PO_Worksheet[i].G,
                            new Date((PO_Worksheet[i].H - (25567 + 1))*86400*1000), // im doing this because excel serialized the date
                            new Date((PO_Worksheet[i].I - (25567 + 1))*86400*1000),
                            new Date((PO_Worksheet[i].J - (25567 + 1))*86400*1000),
                            new Date((PO_Worksheet[i].K - (25567 + 1))*86400*1000),
                            PO_Worksheet[i].L,
                            PO_Worksheet[i].M,
                            upload_date]
    
                        );
                    }

                }

                //console.log(cleaned_PO);

                // bulk insert thanks to dada! wohoo.
                function insertToPO(){
                    return new Promise(function(resolve, reject){

                        mysql.getConnection(function(err, connection){
                            if(err){ return reject('Connection error') };

                            connection.query({
                                sql: 'INSERT INTO po_data (pn, po, supplier, po_qty, po_del, po_bal, po_in_transit, creation_dt, approved_dt, promised_dt, need_by_date, auth_status, line_closed_code, upload_date) VALUES ?',
                                values: [cleaned_PO]
                            },  function(err, results){
                                if(err){ return reject(err) };

                                resolve(results.insertID);
                            });

                        connection.release();
                            
                        });     
                        
                    });

                }

                insertToPO().then(function(){

                    function insertToPO_logs(){
                        return new Promise(function(resolve, reject){

                            let apl_logs = []

                            apl_logs.push(
                                [excelFile.name, '', upload_date]
                            )

                            mysql.getConnection(function(err, connection){
                                if(err){return reject(err)};

                                connection.query({
                                    sql: 'INSERT INTO po_logs (excel_filename, excel_last_author, upload_date) VALUES ?',
                                    values:[apl_logs]
                                },  function(err, results){
                                    if(err){return reject(err)};
                                    
                                    resolve();
                                });

                                connection.release();

                            });
                                
                        });
                    }

                    insertToPO_logs().then(function(){

                        res.send({auth:'<span class="fa fa-check" style="color: green;"></span> Successfully uploaded'});
                    },  function(err){
                        //console.log(err);
                        res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                    });

                },  function(err){
                    //console.log(err);
                    res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                });

            }

        });        

        /** form listener save to brs folder every upload file */
        form.on('fileBegin', function(name, file){
            
            let filePath = './public/brs/';
            let fileName = moment(new Date()).format('YYYY-MM-DD-h-m-s') + '-brs-PO.xlsx';

            if(file.name == 'PO.XLSX'){ // filename format is important. make sure to use appropriate filename per format ;)
                file.path = filePath + fileName;
            }
        });

        /** event listener for form errors */
        form.on('error', function(err){
        });
    });
    
    app.post('/api/SCOST', function(req, res){
        
        let form = new formidable.IncomingForm();

        /** parse form & file */
        form.parse(req, function(err, fields, file){
            
            if(err){return res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid file. ' + err})}

            if(file){

                let excelFile = {
                    date_upload: new Date(),
                    path: file.upload_form.path,
                    name: file.upload_form.name,
                    type: file.upload_form.type,
                    date_modified: file.upload_form.lastModifiedDate
                }

                let workbook = XLSX.readFile(excelFile.path);
                let SCOST_Worksheet = XLSX.utils.sheet_to_json(workbook.Sheets['SCOST'], {header: 'A'});
                let cleaned_SCOST = [];

                let upload_date = new Date();

                // cleaning workbook sheets SCOST.
                for(let i=1; i<SCOST_Worksheet.length; i++){

                    if(SCOST_Worksheet[i].A){

                        cleaned_SCOST.push(

                            [SCOST_Worksheet[i].A,
                            SCOST_Worksheet[i].B,
                            SCOST_Worksheet[i].C,
                            SCOST_Worksheet[i].D,
                            upload_date]
    
                        );
                    }

                }

                // bulk insert thanks to dada! wohoo.
                function insertToSCOST(){
                    return new Promise(function(resolve, reject){

                        mysql.getConnection(function(err, connection){
                            if(err){ return reject('Connection error') };

                            connection.query({
                                sql: 'INSERT INTO scost_data (pn, description, cost_type, std_cost, upload_date) VALUES ?',
                                values: [cleaned_SCOST]
                            },  function(err, results){
                                if(err){ return reject(err) };

                                resolve(results.insertID);
                            });

                        connection.release();
                            
                        });     
                        
                    });

                }

                insertToSCOST().then(function(){

                    function insertToSCOST_logs(){
                        return new Promise(function(resolve, reject){

                            let apl_logs = []

                            apl_logs.push(
                                [excelFile.name, '', upload_date]
                            )

                            mysql.getConnection(function(err, connection){
                                if(err){return reject(err)};

                                connection.query({
                                    sql: 'INSERT INTO scost_logs (excel_filename, excel_last_author, upload_date) VALUES ?',
                                    values:[apl_logs]
                                },  function(err, results){
                                    if(err){return reject(err)};
                                    
                                    resolve();
                                });

                                connection.release();

                            });
                                
                        });
                    }

                    insertToSCOST_logs().then(function(){

                        res.send({auth:'<span class="fa fa-check" style="color: green;"></span> Successfully uploaded'});
                    },  function(err){
                        //console.log(err);
                        res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                    });

                },  function(err){
                    //console.log(err);
                    res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                });

            }

        });        

        /** form listener save to brs folder every upload file */
        form.on('fileBegin', function(name, file){
            
            let filePath = './public/brs/';
            let fileName = moment(new Date()).format('YYYY-MM-DD-h-m-s') + '-brs-SCOST.xlsx';

            if(file.name == 'SCOST.XLSX'){ // filename format is important. make sure to use appropriate filename per format ;)
                file.path = filePath + fileName;
            }
        });

        /** event listener for form errors */
        form.on('error', function(err){
        });
    });
    
    app.post('/api/SLLT', function(req, res){
        
        let form = new formidable.IncomingForm();

        /** parse form & file */
        form.parse(req, function(err, fields, file){
            
            if(err){return res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid file. ' + err})}

            if(file){

                let excelFile = {
                    date_upload: new Date(),
                    path: file.upload_form.path,
                    name: file.upload_form.name,
                    type: file.upload_form.type,
                    date_modified: file.upload_form.lastModifiedDate
                }

                let workbook = XLSX.readFile(excelFile.path);
                let SLLT_Worksheet = XLSX.utils.sheet_to_json(workbook.Sheets['SLLT'], {header: 'A'});
                let cleaned_SLLT = [];

                let upload_date = new Date();

                // cleaning workbook sheets SLLT.
                for(let i=1; i<SLLT_Worksheet.length; i++){

                    if(SLLT_Worksheet[i].A){

                        cleaned_SLLT.push(

                            [SLLT_Worksheet[i].A,
                            SLLT_Worksheet[i].B,
                            SLLT_Worksheet[i].C,
                            SLLT_Worksheet[i].D,
                            SLLT_Worksheet[i].E,
                            SLLT_Worksheet[i].F,
                            upload_date]
    
                        );
                    }

                }

                // bulk insert thanks to dada! wohoo.
                function insertToSLLT(){
                    return new Promise(function(resolve, reject){

                        mysql.getConnection(function(err, connection){
                            if(err){ return reject('Connection error') };

                            connection.query({
                                sql: 'INSERT INTO sllt_data (pn, description, pre_lt, lt, post_lt, supplier, upload_date) VALUES ?',
                                values: [cleaned_SLLT]
                            },  function(err, results){
                                if(err){ return reject(err) };

                                resolve(results.insertID);
                            });

                        connection.release();
                            
                        });     
                        
                    });

                }

                insertToSLLT().then(function(){

                    function insertToSLLT_logs(){
                        return new Promise(function(resolve, reject){

                            let apl_logs = []

                            apl_logs.push(
                                [excelFile.name, '', upload_date]
                            )

                            mysql.getConnection(function(err, connection){
                                if(err){return reject(err)};

                                connection.query({
                                    sql: 'INSERT INTO sllt_logs (excel_filename, excel_last_author, upload_date) VALUES ?',
                                    values:[apl_logs]
                                },  function(err, results){
                                    if(err){return reject(err)};
                                    
                                    resolve();
                                });

                                connection.release();

                            });
                                
                        });
                    }

                    insertToSLLT_logs().then(function(){

                        res.send({auth:'<span class="fa fa-check" style="color: green;"></span> Successfully uploaded'});
                    },  function(err){
                        //console.log(err);
                        res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                    });

                },  function(err){
                    //console.log(err);
                    res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                });

            }

        });        

        /** form listener save to brs folder every upload file */
        form.on('fileBegin', function(name, file){
            
            let filePath = './public/brs/';
            let fileName = moment(new Date()).format('YYYY-MM-DD-h-m-s') + '-brs-SLLT.xlsx';

            if(file.name == 'SLLT.XLSX'){ // filename format is important. make sure to use appropriate filename per format ;)
                file.path = filePath + fileName;
            }
        });

        /** event listener for form errors */
        form.on('error', function(err){
        });
    });
    
    app.post('/api/POR', function(req, res){
        
        let form = new formidable.IncomingForm();

        /** parse form & file */
        form.parse(req, function(err, fields, file){
            
            if(err){return res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid file. ' + err})}

            if(file){

                let excelFile = {
                    date_upload: new Date(),
                    path: file.upload_form.path,
                    name: file.upload_form.name,
                    type: file.upload_form.type,
                    date_modified: file.upload_form.lastModifiedDate
                }

                let workbook = XLSX.readFile(excelFile.path);
                let POR_Worksheet = XLSX.utils.sheet_to_json(workbook.Sheets['POR'], {header: 'A'});
                let cleaned_POR = [];

                let upload_date = new Date();

                // cleaning workbook sheets POR.
                for(let i=1; i<POR_Worksheet.length; i++){

                    if(POR_Worksheet[i].A){

                        cleaned_POR.push(

                            [POR_Worksheet[i].A,
                            POR_Worksheet[i].B,
                            POR_Worksheet[i].C,
                            new Date((POR_Worksheet[i].D - (25567 + 1))*86400*1000),
                            POR_Worksheet[i].E,
                            POR_Worksheet[i].F,
                            POR_Worksheet[i].G,
                            upload_date]
    
                        );
                    }

                }

                // bulk insert thanks to dada! wohoo.
                function insertToPOR(){
                    return new Promise(function(resolve, reject){

                        mysql.getConnection(function(err, connection){
                            if(err){ return reject('Connection error') };

                            connection.query({
                                sql: 'INSERT INTO por_data (pn, po, supplier, transaction_dt, transact_qty, uom, subinventory, upload_date) VALUES ?',
                                values: [cleaned_POR]
                            },  function(err, results){
                                if(err){ return reject(err) };

                                resolve(results.insertID);
                            });

                        connection.release();
                            
                        });     
                        
                    });

                }

                insertToPOR().then(function(){

                    function insertToPOR_logs(){
                        return new Promise(function(resolve, reject){

                            let apl_logs = []

                            apl_logs.push(
                                [excelFile.name, '', upload_date]
                            )

                            mysql.getConnection(function(err, connection){
                                if(err){return reject(err)};

                                connection.query({
                                    sql: 'INSERT INTO por_logs (excel_filename, excel_last_author, upload_date) VALUES ?',
                                    values:[apl_logs]
                                },  function(err, results){
                                    if(err){return reject(err)};
                                    
                                    resolve();
                                });

                                connection.release();

                            });
                                
                        });
                    }

                    insertToPOR_logs().then(function(){

                        res.send({auth:'<span class="fa fa-check" style="color: green;"></span> Successfully uploaded'});
                    },  function(err){
                        console.log(err);
                        res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                    });

                },  function(err){
                    console.log(err);
                    res.send({err: '<span class="fa fa-times" style="color: red;"></span> Invalid format'});
                });

            }

        });        

        /** form listener save to brs folder every upload file */
        form.on('fileBegin', function(name, file){
            
            let filePath = './public/brs/';
            let fileName = moment(new Date()).format('YYYY-MM-DD-h-m-s') + '-brs-POR.xlsx';

            if(file.name == 'POR.XLSX'){ // filename format is important. make sure to use appropriate filename per format ;)
                file.path = filePath + fileName;
            }
        });

        /** event listener for form errors */
        form.on('error', function(err){
        });
    });

    /* hidden chos
    app.post('/api/POS', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    */
}