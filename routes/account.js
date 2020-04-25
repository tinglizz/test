var express = require('express');
var conn = require('./db');

var router = express.Router();


/* GET users listing. */
router.get('/', function (req, res, next) {
  // 测试连接
  // conn.query('SELECT * FROM t_account',function(error,data){
  //   console.log(data);
  // })

  // res.json(req.query) // get请求获取参数
  // res.json(req.body) // post请求获取参数
  res.send('账号管理页面');
});

router.post('/add', function (req, res, next) {

  // 1.准备：接收参数
  let {
    username,
    password,
    checkPass,
    email,
    role
  } = req.body

  // res.json(req.body) // post请求获取参数
  // res.send(`${username}, ${password},${checkPass},${email},${role}`) // post请求获取参数

  // 2.执行: 拼接sql语句，发送sql获得结果
  if (password !== checkPass) { // 后台的验证逻辑
    res.json({
      "success": false,
      "message": "对不起，两次密码不一致，请重新输入！"
    })
    return
  }
  // 准备sql
  const addSql = `INSERT INTO t_account (username, password, email, role) VALUES ('${username}', '${password}', '${email}', '${role}')`
  // 执行sql
  conn.query(addSql, function (error, data) {
    if (error) { // 失败   throw new Error('错误！')
      res.json({
        "success": false,
        "message": "对不起，账号添加失败！"
      })
      return
    }
    // 3.结果: 把结果封装成需要的结构，再返回前台
    if (data.affectedRows === 1) { // 这次操作在数据库新增了1条
      res.json({
        "success": true,
        "message": "恭喜，账号添加成功！"
      })
    }
  })

  // res.send('账号添加');
});

router.post('/edit', function (req, res, next) {
  // 1.准备：接收参数
  let {
    id,
    username,
    role
  } = req.body

  // 2.执行: 拼接sql语句，发送sql获得结果
  // 准备sql
  const editSql = `UPDATE t_account SET username='${username}', role='${role}' WHERE id=${id}`
  // 执行sql
  conn.query(editSql, function (error, data) {
    if (error) { // 失败   throw new Error('错误！')
      res.json({
        "success": false,
        "message": "对不起，账号修改失败！"
      })
      return
    }
    // 3.结果: 把结果封装成需要的结构，再返回前台
    if (data.affectedRows === 1) { // 这次操作在数据库新增了1条
      res.json({
        "success": true,
        "message": "恭喜，账号修改成功！"
      })
    }
  })
});

router.get('/del', function (req, res, next) {
  // 1.准备：接收参数
  let {
    id,
  } = req.query

  // 2.执行: 拼接sql语句，发送sql获得结果
  // 准备sql
  const deleteSql = `DELETE FROM  t_account WHERE id=${id}`
  // 执行sql
  conn.query(deleteSql, function (error, data) {
    if (error) { // 失败   throw new Error('错误！')
      res.json({
        "success": false,
        "message": "对不起，账号删除失败！"
      })
      return
    }
    // 3.结果: 把结果封装成需要的结构，再返回前台
    if (data.affectedRows > 0) { // 这次操作在数据库删除了1条
      res.json({
        "success": true,
        "message": "恭喜，账号删除成功！"
      })
    }
  })
});

// 商品列表
router.get('/list', function (req, res, next) {
  // 1.准备： 接收参数
  // 2.执行:  准备sql，执行sql
  const sql = 'SELECT id,username,email,role,inputtime FROM t_account';
  conn.query(sql, (err, data) => {
    if (err) throw err;
    // 返回结果
    if (data && data.length >= 0) {
      // 3.结果
      res.json(data)
    }
  })
});

// 账户搜索列表
router.post('/search', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    username,
    role
  } = req.body
  // 2.执行:  准备sql，执行sql
  let sql = 'SELECT id,username,email,role,inputtime FROM t_account';
  let firstCondition = true
  if (username) {
    if (firstCondition) {
      sql += ` WHERE `
      firstCondition = false
    } else {
      sql += ` AND `
    }
    sql += `username like '${username}%'`
  }
  if (role) {
    if (firstCondition) {
      sql += ` WHERE `
      firstCondition = false
    } else {
      sql += ` AND `
    }
    sql += `role=${role}`
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

// 商品列表
router.post('/page', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    username,
    role,
    pageSize,
    currentPage
  } = req.body
  // 2.执行:  准备sql，执行sql
  let sql = 'SELECT id,username,email,role,inputtime FROM t_account';
  let countSql = 'SELECT  count(id) total FROM t_account';

  let firstCondition = true
  if (username) {
    if (firstCondition) {
      sql += ` WHERE `
      countSql += ` WHERE `
      firstCondition = false
    } else {
      sql += ` AND `
      countSql += ` AND `
    }
    sql += `username like '${username}%'`
    countSql += `username like '${username}%'`
  }
  if (role) {
    if (firstCondition) {
      sql += ` WHERE `
      countSql += ` WHERE `
      firstCondition = false
    } else {
      sql += ` AND `
      countSql += ` AND `
    }
    sql += `role=${role}`
    countSql += `role=${role}`
  }
  conn.query(countSql, (err, data) => {
    if (err) throw err;
    // 返回结果
    if (data && data.length >= 0) {
      // 3.结果
      const total = data[0].total;


      let start = (currentPage-1)*pageSize
      let end = pageSize
      sql += ` limit ${start},${end}`
      conn.query(sql, (err, data) => {
        if (err) throw err;
        // 返回结果
        if (data && data.length >= 0) {
          // 3.结果
          res.json({
            total:total,
            data:data
          })
        }
      })
    }
  })
});

module.exports = router;