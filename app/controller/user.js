const BaseController = require('./base');
const md5 = require('md5');
const jwt = require("jsonwebtoken");
const hashSalt = "June@126.com@__-498+138";
const validateRules = {
    email:{
        type:"email"
    },
    password:{
        type:"string"
    },
    captcha:{
        type:"string"
    },
    nickname:{
        type:"string"
    }
}
class UserController extends BaseController{
    async login(){
        const {ctx,app} = this;
        const {email, password, captcha,emailCode} = ctx.request.body;
        if(captcha.toUpperCase()!==ctx.session.captcha.toUpperCase()){
            return this.error("验证码错误");
        }
        if(emailCode!==ctx.session.emailCode){
            return this.error("邮箱验证码错误");
        }
        const user = await ctx.model.User.findOne({
            email,
            password:md5(password+hashSalt)
        });
        console.log(user);
        if(!user){
            return this.error("用户名密码错误");
        }
        const token = jwt.sign({
            id:user._id,
            email
        },app.config.jwt.secret,{
            expiresIn:"1h"
        })
        this.success({token,email,nickname:user.nickname})
    }
    async register(){
        const {ctx} = this;

        try {
            ctx.validate(validateRules);
        } catch (e) {
            this.error('校验失败',-1, e.error)
        }
        const {email, nickname, password, captcha} = ctx.request.body;
        //默认就会对ctx.request.body进行检验
        //想检验ctx.query的话，那就ctx.validate({ userName: 'string' }, ctx.query);
        if(captcha.toUpperCase()===ctx.session.captcha.toUpperCase()){
            //邮箱是不是重复
            if(await this.checkEmail(email)){
                this.error('邮箱重复了');
            }
            else{
                const ret = await ctx.model.User.create({
                    email,
                    password:md5(password+hashSalt),
                    captcha,
                    nickname
                });
                console.log('注册返回结果',ret);

                if(ret._id){
                    this.message('注册成功')
                }
            }

        }else{
            this.error('验证码错误');
        }
        // this.success({
        //     name:'kkb'
        // })
    }
    async checkEmail(email){
        const user = await this.ctx.model.User.findOne({email});
        return user;
    }
    async verify(){
        //校验用户名是否存在


    }
    async info(){
        const {ctx} = this;
        const {email} = ctx.state;
        try {
            const user = await this.checkEmail(email);
            console.log(user);
            console.log(user.email);
            // this.success(user);
            this.message('email');
        } catch (error) {
            console.log(error);
        }
        
        // console.log(user);
        
    }
}
module.exports = UserController;