var express = require('express');
var router = express.Router();
var db = require('./lib/db.js');
var sql = require('mssql');

router.get('/', function(req, res, next) {
	res.render('./What_is_the_K_line', {title: '股起勇氣' });
	
});

module.exports = router;