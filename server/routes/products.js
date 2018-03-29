const express = require('express');
const router = express.Router();
const Products = require('../models/product');
const {requiredLogin, requiredAdmin} = require('../middleware/auth');
// 查询接口
router.get('/', (req, res, next) => {
    Products.find({}).populate('category').exec((err, products) => {
        if (err) {
            res.json({code: 403, desc: err.message});
        } else {
            res.json({code: 200, desc: 'success', list: products});
        }
    })
});
// 添加更新商品接口
router.post('/save', (req, res, next) => {
    if (req.body._id) {
        let productObj = req.body;
        Products.findById(req.body._id, (err, product) => {
            if (err) console.log(err);
            let _product = Object.assign(product, productObj);
            _product.save((err) => {
                if (err) {
                    console.log(err)
                    res.json({code: 403, desc: 'fail'});
                } else {
                    res.json({code: 200, desc: 'success'});
                }
            })
        })
    } else {
        let products = new Products(req.body);
        products.save((err) => {
            if (err) {
                res.json({code: 403, desc: 'fail'});
            } else {
                res.json({code: 200, desc: 'success'});
            }
        })
    }
});
// 查询接口
router.post('/inquire', (req, res, next) => {
    let productId = req.body.id;
    if (productId) {
        Products.findById(productId, (err, product) => {
            if (err) {
                res.json({code: 403, desc: 'fail'});
            } else {
                res.json({code: 200, desc: 'success', data: product});
            }
        })
    } else {
        res.json({code: 500, desc: '系统错误'});
    }
});
// 删除商品
router.post('/delete', (req, res, next) => {
    let productId = req.body.id;
    if (productId) {
        Products.remove({_id: productId}, (err, products) => {
            if (err) {
                res.json({code: 403, desc: 'fail'});
            } else {
                res.json({code: 200, desc: 'success'});
            }
        })
    } else {
        res.json({code: 500, desc: '系统错误'});
    }
});
module.exports = router;