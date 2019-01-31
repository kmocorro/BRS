let formidable = require('formidable');


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
    app.post('/api/apl', function(req, res){

        let form = new formidable.IncomingForm();

    });

    app.post('/api/scat', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/oh', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/po', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/scost', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/sllt', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/pos', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
    
    app.post('/api/por', function(req, res){
        
        let form = new formidable.IncomingForm();
    });
}