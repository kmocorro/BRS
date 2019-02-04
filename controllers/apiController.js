let formidable = require('formidable');
let XLSX = require('xlsx');
let mysql = require('../config').poolLocal;

module.exports = function(app){

    app.get('/', function(req, res){

    });

    app.get('/uploader', function(req, res){

        /** FORMAT selection phase */
        if(req.query.format == 'APL'){
            file_metadata().then(function(meta_data){
                if(req.query.format == meta_data.APL.acronym){
                    let label = meta_data.APL.name;
                    let acronym = meta_data.APL.acronym;

                    res.render('upload_admin',{label, meta_data, acronym});
                }
            });
        } else if(req.query.format == 'SCAT'){
            file_metadata().then(function(meta_data){
                if(req.query.format == meta_data.SCAT.acronym){
                    let label = meta_data.SCAT.name;
                    let acronym = meta_data.SCAT.acronym;
                    

                    res.render('upload_admin',{label, meta_data, acronym});
                }
            });
        } else if(req.query.format == 'OH'){
            file_metadata().then(function(meta_data){
                if(req.query.format == meta_data.OH.acronym){
                    let label = meta_data.OH.name;
                    let acronym = meta_data.OH.acronym;

                    res.render('upload_admin',{label, meta_data, acronym});
                }
            });
        } else if(req.query.format == 'PO'){
            file_metadata().then(function(meta_data){
                if(req.query.format == meta_data.PO.acronym){
                    let label = meta_data.PO.name;
                    let acronym = meta_data.PO.acronym;

                    res.render('upload_admin',{label, meta_data, acronym});
                }
            });
        } else if(req.query.format == 'SCOST'){
            file_metadata().then(function(meta_data){
                if(req.query.format == meta_data.SCOST.acronym){
                    let label = meta_data.SCOST.name;
                    let acronym = meta_data.SCOST.acronym;

                    res.render('upload_admin',{label, meta_data, acronym});
                }
            });
        } else if(req.query.format == 'SLLT'){
            file_metadata().then(function(meta_data){
                if(req.query.format == meta_data.SLLT.acronym){
                    let label = meta_data.SLLT.name;
                    let acronym = meta_data.SLLT.acronym;

                    res.render('upload_admin',{label, meta_data, acronym});
                }
            });
        } else if(req.query.format == 'POS'){
            file_metadata().then(function(meta_data){
                if(req.query.format == meta_data.POS.acronym){
                    let label = meta_data.POS.name;
                    let acronym = meta_data.POS.acronym;

                    res.render('upload_admin',{label, meta_data, acronym});
                }
            });
        } else if(req.query.format == 'POR'){
            file_metadata().then(function(meta_data){
                if(req.query.format == meta_data.POR.acronym){
                    let label = meta_data.POR.name;
                    let acronym = meta_data.POR.acronym;

                    res.render('upload_admin',{label, meta_data, acronym});
                }
            });
        }

        /** Functionsss here */
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
                    
                    POS: {
                        name: 'Purchase Order Status',
                        nickname: 'PO Status',
                        acronym: 'POS',
                        filename: 'POS',
                        url: '/uploader?format=POS'
                    },
                    
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

    });

    /** POST UPLOADER ROUTES - under - /upload_admin */
    app.post('/api/APL', function(req, res){

        let form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, file){
            
            if(err){return res.send({err: 'Invalid file. Try again.' + err})}

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

                // cleaning workbook sheets APL.
                for(let i=2; i<APL_Worksheet.length; i++){

                    if(APL_Worksheet[i].A){
                        
                        let upload_date = new Date();

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
                            if(err){ return reject(err) };

                            connection.query({
                                sql: 'INSERT INTO apl_data (pn, description, items_status_code, upload_date ) VALUES ?',
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
                    res.send({auth:'<span class="fa fa-check"></span> Successfully uploaded'});
                },  function(err){
                    res.send({err: '<span class="fa fa-times"></span> Invalid format'});
                });

            }

        });


    });

    app.post('/api/SCAT', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/OH', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/PO', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/SCOST', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/SLLT', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/POS', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/POR', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
}