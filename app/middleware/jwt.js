//解析token中的中间件  也可以用egg-jwt,自己封装更适合了解原理
const jwt = require("jsonwebtoken");
module.exports = ({app}) => {
    return async function vefify(ctx,next){
        if(!ctx.request.header.authorization){
            ctx.body = {
                code:-1,
                info:"用户没有登录"
            }
            return
        }
        const token = ctx.request.header.authorization.replace("Bearer ","");
        try {
            const ret = await jwt.verify(token,app.config.jwt.secret)
            console.log(ret);
            ctx.state.email = ret.email;
            ctx.state.userid = ret._id;
            next();
        } catch (error) {
            console.log(error);
            if(error.message ==="TokenExpiredError"){
                ctx.body = {
                    code:-666,
                    message:"用户Token过期"
                }
            }else{
                ctx.body = {
                    code:-1,
                    message:"用户信息出错"
                }
            }

        }
    }
}