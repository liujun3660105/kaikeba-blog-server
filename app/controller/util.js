'use strict';
const svgCaptcha = require('svg-captcha');
const BaseController = require('./base');
const fse = require("fs-extra");
const path = require('path');
class UtilController extends BaseController {
  async captcha() {
    const { ctx } = this;
    const captcha = svgCaptcha.create({
        size:4,
        fontSize:50,
        width:100,
        height:40,
        noise:3,
        color:true,
        background:"#cc9966"
    })
    this.ctx.session.captcha = captcha.text;
    this.ctx.response.type="image/svg+xml";
    ctx.body = captcha.data;
  }
  async sendEmail(){
    const {ctx} = this;
    const {email} = ctx.query.email;
    let code = Math.random().toString().slice(2,6);
    ctx.session.emailCode = code;
    console.log(code);

    const subject = "开课吧";
    const text = "";
    const html = `<h2>小开社区<h2> <a href="http://localhost:8081/login"><span>${code}</span></a>`;
    const hasSend = await this.service.tools.sendEmail(email, subject, text, html);
    if(hasSend){
      this.message('邮件发送成功');
    }
    else{
      this.error('邮件发送失败');
    }

  }

  //上传一般文件接口
  async upload(){
    const {ctx} = this;
    console.log(ctx.request.body);
    const file = ctx.request.files[0];
    const filename = file.filename;
    await fse.move(file.filepath,this.config.UPLOAD_DIR+'/'+filename);

    return this.success({
      url:`/public/${filename}`
    });

  }
  //上传切片文件接口
  async uploadChunk(){
    // /public/hash/(hash+index)

    //模拟上传错误
    if(Math.random()<0.3){
      return
    }
    const {ctx} = this;
    const file = ctx.request.files[0];
    console.log(ctx.request.body)
    const {hash,name} = ctx.request.body;
    const chunkPath = path.resolve(this.config.UPLOAD_DIR,hash);
    if(!fse.existsSync(chunkPath)){
      await fse.mkdir(chunkPath)
    }
    await fse.move(file.filepath,`${chunkPath}/${name}`);
    return this.message(chunkPath+`${name}`);

  }
  async mergeChunks(){
    const {ctx} = this;
    const {ext,hash,size} = ctx.request.body;
    console.log(hash);
    const filePath = path.resolve(this.config.UPLOAD_DIR,`${hash}.${ext}`);
    await this.ctx.service.tools.mergeFile(filePath,hash,size);
    this.success({
      url:`/public/${hash}.${ext}`
    })

  }
  async checkFile(){
    const {ctx} = this;
    const {ext, hash} = ctx.request.body;
    const fileDir = path.resolve(this.config.UPLOAD_DIR,`${hash}.${ext}`);
    let uploaded = false;
    let uploadedList = [];
    if(fse.existsSync(fileDir)){
      uploaded = true
    }else{
      uploadedList = await this.getUploadedList(path.resolve(this.config.UPLOAD_DIR,hash));
    }
    this.success({
      uploaded,
      uploadedList
    })
  }
  async getUploadedList(dirPath){
    return fse.existsSync(dirPath)
            ?(await fse.readdir(dirPath)).filter(name => name[0]!='.')
            :[]
  }
}

module.exports = UtilController;
