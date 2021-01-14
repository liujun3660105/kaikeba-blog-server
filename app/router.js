'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  console.log(app);
  const { router, controller } = app;
  const jwt = app.middleware.jwt({app});
  router.get('/', controller.home.index);
  router.get('/captcha', controller.util.captcha);
  router.get('/sendemail', controller.util.sendEmail);
  router.post('/upload', controller.util.upload);
  router.post('/uploadchunk', controller.util.uploadChunk);
  router.post('/mergechunks', controller.util.mergeChunks);
  router.post('/checkfile', controller.util.checkFile);

  router.group({name:'user',prefix:'/user'},router=>{
    const {info,register,login,verify} = controller.user;
    router.post('/register',register);
    router.post('/login',login);
    router.get('/info',jwt,info);
    router.get('/verify',verify);
  })
};
