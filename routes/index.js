var express = require('express');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var conn = require('./db');
var router = express.Router();

// 公共秘钥
var key = 'itsource'

// 记录失效token
const invalidTokens = []


//====================================================
// 配置上传存储对象
var storage = multer.diskStorage({
  // 目的地，安装目录
  destination: 'public/upload/personal/',
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

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express123456' });
// });

// 用户登录
router.post('/login', function (req, res, next) {
  // 1 准备
  var {
    username,
    password,
  } = req.body
  // 2 执行
  var sql = `SELECT * FROM t_account WHERE username='${username}' and password='${password}'`
  conn.query(sql, function (err, data) {
    if (data && data.length === 1) {
      var loginUser = data[0]
      //生成token
      //参数1：payload，简单对象
      //参数2：密钥或私钥,加密关键字
      //参数3：配置对象，expiresIn配置过期时间
      var tokenId = jwt.sign({
          id: loginUser.id, //用户的ID，将来用于修改密码
          username: loginUser.username, //用户名，用于登录后欢迎信息的显示
          role: loginUser.role
        },
        key, {
          expiresIn: 60 * 20
        } // 数字值，单位S(秒)
      )

      // 3 返回
      res.json({
        success: true,
        message: '恭喜，登录成功！',
        token: tokenId
      })
    } else {
      res.json({
        success: false,
        message: '抱歉，登录失败，用户名或密码错误！'
      })
    }
  })
});

router.post('/checkToken', function (req, res, next) {
  var {
    tokenId
  } = req.body;

  jwt.verify(tokenId, key, function (err, obj) {
    res.json(obj)
  })
})

// 注销
router.post('/logout', function (req, res, next) {
  // 1 准备
  var {
    token
  } = req.body
  // 2 执行
  invalidTokens.push(token)

  // 3 返回
  res.json({
    success: true,
    message: '注销成功！',
  })


});

//修改密码
router.post('/changePassword', function (req, res, next) {
  // 1 准备
  var {
    token,
    oldPassword,
    newPassword
  } = req.body

  console.log(invalidTokens.includes(token));


  if (invalidTokens.indexOf(token) >= 0) {
    res.send({
      success: false,
      message: '用户登陆已失效！'
    });
    return;
  }

  // 2 执行
  try {
    // 获取登陆对象
    var { id } = jwt.verify(token, key);

    const sql = `UPDATE t_account SET password='${newPassword}' WHERE password='${oldPassword}' AND id=${id}`
    conn.query(sql, function (err, result) {
      if (result.affectedRows === 1) {
        res.json({
          success: true,
          message: '密码修改成功！'
        });
      } else {
        res.json({
          success: false,
          message: '抱歉，密码修改失败！',
        })
      }
    });
  } catch (err) {
    res.json({
      success: false,
      message: '抱歉，你还未登陆！' + err,
    })
  }
});

/* 个人中心 获取账号信息 */
router.post('/personalInfo', (req, res) => {
  // 1 准备
  var {
    token,
  } = req.body


  if (invalidTokens.indexOf(token) >= 0) {
    res.send({
      success: false,
      message: '用户登陆已失效！'
    });
    return;
  }

  // 2 执行
  try {
    // 获取登陆对象
    var { id } = jwt.verify(token, key);

    const sql = `SELECT * FROM t_account WHERE id=${id}`
    conn.query(sql, (err, data) => {
      if (err) throw err;
      if (data.length) {
        res.send({ accountInfo: data[0] })
      }
    })
  } catch (err) {
    res.json({
      success: false,
      message: '抱歉，你还未登陆！' + err,
    })
  }
})



/* 个人中心 获取账号的角色信息 */
router.post('/getCurrentUserRole', (req, res) => {
  // 1 准备
  var {
    token,
  } = req.body


  if (invalidTokens.indexOf(token) >= 0) {
    res.send({
      success: false,
      message: '用户登陆已失效！'
    });
    return;
  }

  // 2 执行
  try {
    // 获取登陆对象
    var { role } = jwt.verify(token, key);

    if (role) {
      res.send({ role: role })
    }else{
      res.json({
        success: false,
        message: '抱歉，登录信息已失效' + err,
      })
    }
  } catch (err) {
    res.json({
      success: false,
      message: '抱歉，你还未登陆！' + err,
    })
  }
})


// 头像上传
router.post('/uploadAvatar', upload.single('file') ,function(req, res, next){
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

/* 个人中心 修改头像 */
router.post('/editAvatarImg', (req, res) => {
  // 1 准备
  var {
    avatar,
    token,
  } = req.body


  if (invalidTokens.indexOf(token) >= 0) {
    res.send({
      success: false,
      message: '用户登陆已失效！'
    });
    return;
  }

  // 2 执行
  try {
    // 获取登陆对象
    var { id } = jwt.verify(token, key);

    const sql = `UPDATE t_account SET avatar='${avatar}' WHERE id=${id}`
    conn.query(sql, (err, data) => {
      if (err) throw err;
      if (data.affectedRows === 1) {
        res.json({
          success: true,
          message: '头像修改成功！'
        });
      } else {
        res.json({
          success: false,
          message: '抱歉，头像修改失败！',
        })
      }
    })
  } catch (err) {
    res.json({
      success: false,
      message: '抱歉，你还未登陆！' + err,
    })
  }
})

module.exports = router;