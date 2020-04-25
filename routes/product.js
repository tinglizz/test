var express = require('express');
var multer = require('multer');
// 准备数据库连接
var conn = require('./db');
var router = express.Router();

// 前置连接：解决跨域
// 1.JSONP
// 2.CORS,请求头 【重点掌握】
// 3.代理跨域
// router.all('*', function (req, res, next) {
//   // 定义跨域配置
//   // res.header('key','value')  ??????????????
//   res.header('Access-Control-Allow-Origin', '*')

//   // 放行
//   next();
// });

//====================================================
// 配置上传存储对象
var storage = multer.diskStorage({
  // 目的地，安装目录
  destination: 'public/upload/product/',
  // 文件名称，重命名的文件名称
  filename: function (req, file, callback) {
    
    var fileInfo = file.originalname.split('.');
    // 最终新文件名 =  原文件名 + ‘-’+ 时间戳 + 文件后缀
    // callback(null, file.fieldname + '-' + Date.now() + '.' +extName)
    callback(null, fileInfo[0] + '-' + Date.now() + '.' + fileInfo[1])
  }
})
 
// 通过存储对象，创建上传对象
var upload = multer({ storage: storage })
//====================================================


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('商品管理页面');
});

// 商品列表
router.get('/list', function (req, res, next) {
  // 1.准备： 接收参数
  // 2.执行:  准备sql，执行sql
  const sql = 'SELECT * FROM t_product order by inputtime';
  conn.query(sql, (err, data) => {
    if (err) throw err;
    // 返回结果
    if (data && data.length >= 0) {
      // 3.结果
      res.json(data)
    }
  })
});
// 商品查询
router.post('/search', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    name,
    priceStart,
    priceEnd
  } = req.body;
  // 2.执行:  准备sql，执行sql
  let sql = 'SELECT * FROM t_product';
  let firstCondition = true;
  if (name) {
    if (firstCondition) {
      sql += ` WHERE `
      firstCondition = false
    } else {
      sql += ` AND `
    }
    sql += `name like '${name}%'`
  }
  if (priceStart) {
    if (firstCondition) {
      sql += ` WHERE `
      firstCondition = false
    } else {
      sql += ` AND `
    }
    sql += `price>=${priceStart}`
  }
  if (priceEnd) {
    if (firstCondition) {
      sql += ` WHERE `
      firstCondition = false
    } else {
      sql += ` AND `
    }
    sql += `price<=${priceEnd}`
  }
  conn.query(sql, (err, data) => {
    if (err) throw err;
    // 返回结果
    if (data && data.length >= 0) {
      // 3.结果
      res.json(data)
    }
  })
});

// 商品添加
router.post('/add', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    name,
    category,
    feature,
    isPromotion,
    imgUrl,
    price,
    packingexpense,
    desc
  } = req.body
  // 2.执行:  准备sql，执行sql
  const sql = `INSERT INTO t_product ( name, category, feature,  isPromotion,imgUrl, price, packingexpense, \`desc\`) VALUES ('${name}', '${category}', '${feature}', '${isPromotion}', '${imgUrl}', '${price}', '${packingexpense}', '${desc}');`
  conn.query(sql,function(err,data){
    if(data.affectedRows===1){
      res.json({
        success:true,
        message:'商品添加成功！'
      });
      
    }else{
        res.json({
          success:true,
          message:'商品添加失败！'
        });

    }
  })
  // 3.结果
});

// 商品修改
router.post('/edit', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    id,
    name,
    category,
    feature,
    isPromotion,
    price,
    packingexpense,
    desc
  } = req.body
  // 2.执行:  准备sql，执行sql
  const sql = `UPDATE t_product SET name='${name}', category='${category}', feature='${feature}',  isPromotion='${isPromotion}', price='${price}', packingexpense='${packingexpense}', \`desc\`='${desc}' WHERE id=${id};`
  conn.query(sql,function(err,data){
    
  // 3.结果
    if(data.affectedRows===1){
      res.json({
        success:true,
        message:'商品修改成功！'
      });

    }else{
      res.json({
        success:false,
        message:'商品修改失败！'
      });
    }
  })
});

// 商品删除
router.get('/del', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    id,
  } = req.query
  // 2.执行:  准备sql，执行sql
  const sql = `DELETE FROM t_product WHERE id=${id};`
  conn.query(sql,function(err,data){
    if(data.affectedRows===1){
      res.json({
        success:true,
        message:'商品删除成功！'
      });

    }else{
      res.json({
        success:false,
        message:'商品删除失败！'
      });
    }
  })
  // 3.结果
});

// 商品上传
// router.post('upload',文件上传处理器,function(req, res, next){})
router.post('/upload', upload.single('file') ,function(req, res, next){
  // 1. 接收参数
  const fileName = req.file.filename;
  // 2. 处理请求
  // 3. 返回结果
  if(fileName){
    res.json({
      success:true,
      fileName: fileName
    })
  }
  
})
module.exports = router;