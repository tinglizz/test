var express = require('express');
// 准备数据库连接
var conn = require('./db');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('商品类别管理页面');
  // conn.query('SELECT * FROM t_product', (err, data) => {
  //   res.json(data)
  // })
});

// 商品分类列表
router.get('/list', function (req, res, next) {
  // 1.准备： 接收参数
  // 2.执行:  准备sql，执行sql
  const sql = 'SELECT * FROM t_producttype order by \`order\` asc';
  conn.query(sql, (err, data) => {
    if (err) throw err;
    // 返回结果
    if (data && data.length >= 0) {
      // 3.结果
      res.json(data)
    }
  })
});

// 商品分类搜索列表
router.post('/search', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    name
  } = req.body
  // 2.执行:  准备sql，执行sql
  let sql = 'SELECT * FROM t_producttype';
  if (name) {
    sql += ` WHERE name like '${name}%'`
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

// 商品分类搜索列表
router.post('/page', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    name,
    pageSize,
    currentPage
  } = req.body
  // 2.执行:  准备sql，执行sql
  let sql = 'SELECT * FROM t_producttype';
  if (name) {
    sql += ` WHERE name like '${name}%'`;
  }
  if(pageSize&&currentPage){
    let start = (currentPage-1)*pageSize;
    let end = pageSize;
    sql += ` limit ${start},${end}`
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


// 商品分类添加
router.post('/add', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    name,
    order,
    desc
  } = req.body
  // 2.执行:  准备sql，执行sql
  const sql = `INSERT INTO t_producttype (name, \`order\`,\`desc\`) VALUES ('${name}', ${order}, '${desc}');`
  conn.query(sql,function(err,data){
    if(data && data.affectedRows===1){
      res.json({
        success:true,
        message:'商品类型添加成功！'
      });

    }else{
      res.json({
        success:false,
        message:'商品类型添加失败！'
      });
    }
  })
  // 3.结果
});

// 商品分类修改
router.post('/edit', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    id,
    name,
    order,
    desc
  } = req.body
  // 2.执行:  准备sql，执行sql
  const sql = `UPDATE t_producttype SET name='${name}', \`order\`=${order}, \`desc\`='${desc}'  WHERE id=${id};`
  // res.send(sql);
  conn.query(sql,function(err,data){
    if(data.affectedRows===1){
      res.json({
        success:true,
        message:'商品分类修改成功！'
      });

    }else{
      res.json({
        success:true,
        message:'商品分类修改失败！'
      });
    }
  })
  // 3.结果
});

// 商品修改
router.get('/del', function (req, res, next) {
  // 1.准备： 接收参数
  let {
    id,
  } = req.query
  // 2.执行:  准备sql，执行sql
  const sql = `DELETE FROM t_producttype WHERE id=${id};`
  conn.query(sql,function(err,data){
    if(data.affectedRows===1){
      res.json({
        success:true,
        message:'商品类别删除成功！'
      });

    }else{
      res.json({
        success:false,
        message:'商品类别删除失败！'
      });
    }
  })
  // 3.结果
});

module.exports = router;