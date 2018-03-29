const express = require('express');
const router = express.Router();
const User = require('../models/user');
const sendMail = require('../utils/sendMail');
const createCode = require('../utils/tools');
const {requiredLogin, requiredAdmin} = require('../middleware/auth');

// 获取session状态
router.get('/session',requiredLogin, (req, res) => {
    if (req.session.user) {
        res.json({code: 200, data: req.session.user});
    } else {
        res.json({code: 403, desc: '暂无登录状态'});
    }
});
// 登录接口
router.post('/login', (req, res) => {
    let _user = req.body;
    let name = _user.name;
    let password = _user.password;
    User.findOne({name: name}, (err, user) => {
        if (err) console.log(err);
        if (!user) {
            res.json({code: 403, desc: '用户不存在，去注册吧'});
        } else {
            // console.log('用户存在:' + name, password);
            user.comparePassword(password, (err, isMatch) => {
                console.log(password, isMatch);
                if (err) console.log(err);
                if (isMatch) {
                    req.session.user = user;
                    // console.log(req.session);
                    // console.log('登录成功:Password is matched');
                    res.json({code: 200, desc: '登录成功',data:user});
                } else {
                    res.json({code: 403, desc: '登录失败，密码可能错误，请重新登录'});
                }
            })
        }
    })
});
// 注册接口
router.post('/register', (req, res) => {
    let userObj = req.body;
    console.log("userObj", userObj);
    User.findOne({name: userObj.name}, (err, user) => {
        if (err) console.log(err);
        if (user) {
            res.json({code: 403, desc: '账号存在，请重新注册或去登录'});
        } else {
            let _user = new User(userObj);
            _user.firstSave = true;
            _user.save((err) => {
                if (err) console.log(err);
                res.json({code: 200, desc: '注册成功，去登录吧'});
            })
        }
    })
});
// 登出接口
router.get('/logout', (req, res) => {
    delete req.session.user;
    res.json({code: 200, desc: '注销成功'});
});
// 确认信息，发送邮件验证码
router.post('/getBackPassword', (req, res) => {
    let userObj = req.body;
    User.findOne({name: userObj.name}, (err, user) => {
        if (err) console.log(err);
        if (user) {
            console.log(user.email, userObj.email);
            let identifyingCode = createCode();
            if (user.email === userObj.email) {
                sendMail(userObj.email, '邮箱验证码', '您的验证码为：<b>' + identifyingCode + '</b>').then(sendRes => {
                    res.json({code: 200, desc: '发送邮件成功，请重新输入新密码', data: sendRes, identifyingCode: identifyingCode});
                }).catch(err => {
                    res.json({code: 403, desc: '发送邮件失败，请联系管理员', msg: err.message});
                });
            } else {
                res.json({code: 403, desc: '邮箱不匹配，请输入注册邮箱'});
            }
        } else {
            res.json({code: 403, desc: '没有此用户'});
        }
    });
});
// 保存新密码
router.post('/savePassword', (req, res) => {
    let userObj = req.body;
    User.findOne({name: userObj.name}, (err, user) => {
        if (err) console.log(err);
        if (user) {
            let _user = Object.assign(user, userObj, {firstSave: true});
            _user.save((err) => {
                if (err) console.log(err);
                res.json({code: 200, desc: 'success'});
            })
        } else {
            res.json({code: 403, desc: '没有此用户'});
        }
    });
});

module.exports = router;