var express = require('express');
var router = express.Router();
var db = require('./lib/db.js');
var sql = require('mssql');
/* GET shedule page. */
router.get('/', function(req, res, next) {
	var code = req.query.code;
	if(code == undefined){ //若為undefined代表沒有輸入code，直接跳轉頁面到Schedule的1101
		res.redirect("/Schedule?code=1101");
	}
	else{
		new sql.ConnectionPool(db).connect().then(pool => {
			//convert(varchar, [time], 108)轉換hh:mm:ss 
  			return pool.request().query("SELECT Schedule.code,CompanyProfile.company,convert(varchar, event_date, 111) AS event_date,event_type,event_note,convert(varchar, [time], 108) AS event_time,place,content,StockPrice.clos,StockPrice.[open],StockPrice.up,StockPrice.down,Replace(CONVERT(NVARCHAR(20),CAST(StockPrice.trading_volume AS money),1),'.00','') AS trading_volume,CAST ( YEAR(StockPrice.price_date) AS VARCHAR(10) )+'/'+CAST ( MONTH(StockPrice.price_date) AS VARCHAR(10) )+'/'+CAST ( DAY(StockPrice.price_date) AS VARCHAR(10) )AS updateDate,Replace(CONVERT(NVARCHAR(20),CEILING(CAST(CompanyProfile.capital AS money)/1000000),1),'.00','') AS capital,IndustryType.industry_name FROM Schedule INNER JOIN (SELECT TOP 1 * FROM StockPrice WHERE StockPrice.code='"+code+"' ORDER BY price_date DESC) AS StockPrice ON Schedule.code = StockPrice.code INNER JOIN (SELECT CompanyProfile.code,company,industry,capital FROM CompanyProfile WHERE CompanyProfile.code='"+code+"') AS CompanyProfile ON StockPrice.code=CompanyProfile.code  INNER JOIN (SELECT * FROM IndustryType) AS IndustryType ON CompanyProfile.industry = IndustryType.industry_id WHERE Schedule.code='"+code+"' ORDER BY event_date DESC")
  		}).then(result => {
    		let rows = result.recordset
   			 res.setHeader('Access-Control-Allow-Origin', '*')
   		 	// res.status(200).json(rows);
   			 // sql.close();
   			 if(result.rowsAffected =='0'){ //若為0代表輸入的code並沒有資料可以顯示，跳轉頁面到Schedule的1101
					res.redirect("/Schedule?code=1101");
				}
			 else{
				res.render('./Schedule', {title:'股起勇氣',data: rows });
			 }
  			}).catch(err => {
   			 res.status(500).send({ message: "${err}"})
   			 // sql.close();
  			});
	}
});


module.exports = router;