// 引入mysql模块
var mysql = require('mysql');
// 配置数据库连接信息
var conn = mysql.createConnection({
  // host: '172.16.12.254', // 主机域名
  host: 'localhost', // 主机域名
  port     : 3306,          // 端口，默认为3306
  user: 'root', // 用户名
  password: 'root', // 密码
  database: 'market' // 需要连接的数据库
});

// 创建连接
conn.connect();


// 导出模块
module.exports=conn;