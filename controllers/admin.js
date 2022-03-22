const { query } = require("express");

module.exports = function(User, Category, Type, Contact, Sub, moment){
    return {
        SetRouting: function(router){
            router.get('/admin', this.admin);
            router.get('/create/new/category/', this.newCategoryPage);
            router.get('/create/new/subcat/', this.newSubcatPage);
            router.get('/admin/add/service', this.addService);
            router.get('/admin/edit/service/:slug' , this.editService);

            router.post('/new/category', this.newCategory);
            router.post('/new/subcat', this.newSubCat);
            router.post('/new/head/sub/', this.newHead);
            router.post('/admin/edit/service/', this.editServiceExecute)
        },
        admin: async function(req, res){
            if(req.user){
                var subcats = await Category.find({}).exec();
                var types = await Type.find({}).sort('-created').exec();
                var notifications = await Contact.find({ status: 'unread'}).sort('-created').exec();
                res.render('admin/admin.ejs', {subcats: subcats, types: types, notifications: notifications, moment: moment});
            }else{
                res.render('404');
            }
        },
        newCategoryPage: async function(req, res){
            if(req.user){
                var subcats = await Category.find({}).exec();
                var types = await Type.find({}).sort('-created').exec();
                var notifications = await Contact.find({ status: 'unread'}).sort('-created').exec();
                res.render('admin/create-category', { subcats: subcats, types: types, notifications: notifications, moment: moment});
            }else{
                res.render('404');
            }
        },
        newCategory: function(req, res){
            if(req.user){
                const newCat = new Category({
                    name: req.body.name
                });
                newCat.save(() => {
                    console.log("Created Successfully");
                });
    
                res.redirect('/create/new/subcat/');
            }else{
                res.render('404');
            }
        },
        newSubcatPage: async function(req, res){
            if(req.user){
                var subcats = await Category.find({}).exec();
                var types = await Type.find({}).sort('-created').exec();
                var notifications = await Contact.find({ status: 'unread'}).sort('-created').exec();
                res.render('admin/add-headcat', { subcats: subcats, types: types, notifications: notifications, moment: moment});
            }else{
                res.render('404');
            }
        },
        newHead: function(req, res){
            if(req.user){
                const newSub = new Sub();
            newSub.category = req.body.subcat;
            newSub.name = req.body.name;
            newSub.save((err) => {
                console.log("Sub category Created");
            });

            Category.updateOne({
                _id: req.body.subcat
            }, {
                $push: {
                    subcat: newSub._id
                }
            }, (err) => {
                console.log("Success")
            })

            res.redirect('/admin/add/service');
            }else{
                res.render('404');
            }
        },
        newSubCat: async function(req, res){
            if(req.user){
                // console.log(req.body);

            Sub.find({
                _id: req.body.subcat
            }, (err, sub) => {
                if(sub){
                    var json = JSON.stringify(req.body);

                    var obj = JSON.parse(json);
                    var values = Object.keys(obj).map(function (key) { return obj[key]; });
                    values = values.splice(-1)[0];
                    console.log(values);

                    const newSub = new Type({
                        sub: req.body.subcat,
                        name: req.body.subcatname,
                        desc: req.body.requirements,
                        steps: values,
                        important: req.body.important,
                        features: [
                            {
                                head: req.body.bhead1,
                                desc: req.body.bdesc1
                            },
                            {
                                head: req.body.bhead2,
                                desc: req.body.bdesc2
                            },
                            {
                                head: req.body.bhead3,
                                desc: req.body.bdesc3
                            },
                            {
                                head: req.body.bhead4,
                                desc: req.body.bdesc4
                            },
                            {
                                head: req.body.bhead5,
                                desc: req.body.bdesc5
                            },
                            {
                                head: req.body.bhead6,
                                desc: req.body.bdesc6
                            },
                        ],
                        documents: [
                            {
                                title: req.body.head1,
                                desc: req.body.desc1
                            },
                            {
                                title: req.body.head2,
                                desc: req.body.desc2
                            }
                        ]
                    });
        
                    newSub.save(() => {
                        console.log("Sub Category Created Successfully");
                    })

                    Sub.updateOne({
                        _id: req.body.subcat
                    }, {
                        $push: {
                            subcat: newSub._id
                        }
                    }, (err) => {
                        console.log("Success")
                    })
                }else{
                    res.redirect("back");
                }
            })

            res.redirect('/admin')
            }else{
                res.render('404');
            }
        },
        addService: async function(req, res){
            if(req.user){
                var subcats = await Sub.find({}).exec();
                const services = await Type.find({}).sort('name').exec();
                var types = await Type.find({}).sort('-created').exec();
                var notifications = await Contact.find({ status: 'unread'}).sort('-created').exec();
                res.render('admin/add-service', { subcats: subcats, services: services, types: types, notifications, moment: moment});
            }else{
                res.render('404');
            }
        },
        editService: async function(req, res){
            if(req.user){
                var subcats = await Category.find({}).exec();
                const service = await Type.findOne({ slug: req.params.slug}).exec();
                const services = await Type.find({}).sort('name').exec();
                var types = await Type.find({}).sort('-created').exec();
                var notifications = await Contact.find({ status: 'unread'}).sort('-created').exec();
                const documents = service.documents;
                const features = service.features;
                const steps = service.steps;
                res.render('admin/edit-service', { subcats: subcats, service: service, services: services, steps:steps, features: features, documents: documents, types: types, notifications: notifications, moment: moment});
            }else{
                res.render('404');
            }
        },
        editServiceExecute: async function(req, res){
            if(req.user){
                var json = JSON.stringify(req.body);

            var obj = JSON.parse(json);
            var values = Object.keys(obj).map(function (key) { return obj[key]; });
            values = values.splice(-1)[0];
            console.log(values);

            Type.updateOne({
                _id: req.body.subcatid
            }, {
                $set: { 
                    name: req.body.subcatname,
                    desc: req.body.requirements,
                    important: req.body.important,
                    steps: values,
                    documents: [
                        {
                            title: req.body.head1,
                            desc: req.body.desc1
                        },
                        {
                            title: req.body.head2,
                            desc: req.body.desc2
                        },
                        
                    ],
                }
            }, (err) => {
                console.log('update success');
            });

            Type.updateOne({
                _id: req.body.subcatid
            }, {
                $set: { 
                    features: [
                        {
                            head: req.body.bhead1,
                            desc: req.body.bdesc1
                        },
                        {
                            head: req.body.bhead2,
                            desc: req.body.bdesc2
                        },
                        {
                            head: req.body.bhead3,
                            desc: req.body.bdesc3
                        },
                        {
                            head: req.body.bhead4,
                            desc: req.body.bdesc4
                        },
                        {
                            head: req.body.bhead5,
                            desc: req.body.bdesc5
                        },
                        {
                            head: req.body.bhead6,
                            desc: req.body.bdesc6
                        },
                    ],features: [
                            {
                                head: req.body.bhead1,
                                desc: req.body.bdesc1
                            },
                            {
                                head: req.body.bhead2,
                                desc: req.body.bdesc2
                            },
                            {
                                head: req.body.bhead3,
                                desc: req.body.bdesc3
                            },
                            {
                                head: req.body.bhead4,
                                desc: req.body.bdesc4
                            },
                            {
                                head: req.body.bhead5,
                                desc: req.body.bdesc5
                            },
                            {
                                head: req.body.bhead6,
                                desc: req.body.bdesc6
                            },
                        ],
                }
            }, (err) => {
                console.log('update success');
            });

            res.redirect('back');
            }else{
                res.render('404');
            }
        }
    }
}