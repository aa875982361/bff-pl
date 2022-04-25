/**
 * 客户端通过rpc 调用微服务
 */

import { ResponseBody } from "../utils/buffHandler";
import { sendDataToService } from "./createClient";
import express from "express"
import bodyParser from "body-parser";


const port = "8081"
var app = express();
// 唯一请求id
let requestBffId = 1000

// 解析body的数据
app.use(bodyParser.json())

app.post('/order/add22', async function(req, res){
    const currentRequestBffId = requestBffId++
    console.log("开始处理 currentRequestBffId ", currentRequestBffId);
    res.end(JSON.stringify({
        code: 200,
        data: { 
            msg: "null data"
        }
    }));
})
// 当对主页发出 GET 请求时
app.post('/order/add', async function(req, res) {
    // console.log("res.body", req.body);
    const { testIndex = 0 } = req.body || {}
    if(testIndex){
        console.log("testIndex", testIndex);
    }
    const currentRequestBffId = requestBffId++
    let data = {
        msg: "发送给基础服务的数据"
    }
    // console.log("开始处理 currentRequestBffId ", currentRequestBffId);
    
    // 处理订单
    const { code: orderCode, data: orderResult} = await publicRequest(
        4444,
        "addOrder",
        data,
    );
    // console.log("orderResult", orderResult, orderCode);
    
    const {code: dataCode, data: dataResult} = await publicRequest(
        4445,
        "getData",
        data
    );
    // console.log("dataResult", dataResult, dataCode)
    // 处理完成
    console.log("处理 currentRequestBffId 完成 ", currentRequestBffId);
    res.status(200).end(JSON.stringify({
        code: 200,
        data: { orderResult, dataResult }
    }));
});

app.listen(port, () => {
    console.log("开始监听", port);
})

 
 // 公共请求方法
 async function publicRequest(port: number, method: string, data: any): Promise<ResponseBody> {
     // 处理port
    //  console.log("开始处理", port, data);
     return sendDataToService(port, {
        method,
        data
    })
 }
 