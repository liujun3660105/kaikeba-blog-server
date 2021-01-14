const {Service} = require('egg');
const nodemailer = require('nodemailer');
const path = require('path');
const fse = require('fs-extra');
const userEmail = "liujun198707@126.com";
const transporter = nodemailer.createTransport({
    service:"126",
    secureConnection:true,
    auth:{
        user:userEmail,
        pass:"youmei1024"
    }
});
class ToolService extends Service{
    async sendEmail(email,subject,text,html){
        const mailOptions = {
            from:userEmail,
            cc:userEmail,
            to:email,
            subject,
            text,
            html
        }
        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.log('email error',error);
            return false;
        }
    }
    async mergeFile(destFile,fileHash,size){
        const chunksDir = path.resolve(this.config.UPLOAD_DIR,fileHash);//切片文件夹
        let chunks = await fse.readdir(chunksDir);
        console.log('chunks',chunks);
        chunks.sort((a,b)=>a.split('-')[1]-b.split('-')[1]);
        chunks = chunks.map(cp => path.resolve(chunksDir,cp));
        await this.mergeChunks(chunks,destFile,size)
    }
    async mergeChunks(chunks,destFile,size){
        const pipeStream = (filePath,writeStream)=>{
            return new Promise(resolve => {
                const readStream = fse.createReadStream(filePath);
                readStream.on('end',()=>{
                    fse.unlinkSync(filePath);
                    resolve();
                })
                readStream.pipe(writeStream);
            })
        }
        await Promise.all(
            chunks.map((chunk,index)=>{
                pipeStream(chunk,fse.createWriteStream(destFile,{
                    start:index*size,
                    end:(index+1)*size
                }))
            })
        )

        // chunks.map(async (chunk,index)=>{
        //     const readerStream =await fse.createReadStream(chunk);
        //     const writerStream =await fse.createWriteStream(destFile,{
        //         start:index*size,
        //         end:(index+1)*size
        //     });
        //     await readerStream.pipe(writerStream);
        // })
    }
}
module.exports = ToolService;