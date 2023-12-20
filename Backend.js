var express = require('express');
var bodyParser = require("body-parser");
var cors = require('cors');
var mysql = require('mysql'); //npm install mysql

var app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// connect

var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "************",
    insecureAuth: true,
    database: "csdl_iot"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!!!")
});

app.post("/add", function (req, res) {
    const { CardID, ThoiGianQuetThe, ThaoTac } = req.body;
    var sql = "insert into Systemlog (CardID,ThoiGianQuetThe,ThaoTac) values('" + CardID + "', '" + ThoiGianQuetThe + "', '" + ThaoTac + "')";
    con.query(sql, function (err, results) {
        if (err) throw err;
        res.send(" Thêm thành công");
    });
})

app.post("/addnewcard", function (req, res) {
    const { CardID , BienSoXe, ChuXe } = req.body;
    var sql = "insert into Quanlithe values ('"+CardID+"','"+BienSoXe+"','"+ChuXe+"')";
    con.query(sql, function (err, results) {
        if (err) throw err;
        res.send(" Thêm thành công");
    });
})

app.delete("/remove/:CardID", function (req, res) {
    const { CardID } = req.params; // Lấy giá trị CardID từ URL
    var sql = "DELETE FROM Quanlithe WHERE CardID = ?";
    con.query(sql, [CardID], function (err, results) {
        if (err) {
            console.error('Lỗi khi xóa thẻ:', err);
            res.status(500).send('Lỗi khi xóa thẻ');
        } else {
            res.send("Xóa thẻ thành công");
        }
    });
});

app.get("/get/:CardID", function (req, res) {
    const CardID = req.params['CardID'];
    var sql = "select * from Systemlog where  CardID = '" + CardID + "'";
    con.query(sql, function (err, results) {
        if (err) throw err;
        res.send(results);
    });
});

app.get("/getCardInfo", function (req, res) {
    var sql = "select * from Quanlithe";
    con.query(sql, function (err, results) {
        if (err) throw err;
        res.send(results);
    });
})

var server = app.listen(1234, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Server is listening at http://%s:%s", host, port)
})
