/**
 * 客户端通过rpc 调用微服务
 */

import { ResponseBody } from "../utils/buffHandler";
import { sendDataToService } from "./createClient";
import { createServer, IncomingMessage, ServerResponse } from "http"
 const BFF = createServer((req, res) => {
     console.log("监听服务");
     
     handleBFF(req, res);
 });
 
 let port = 8081
 BFF.listen(port, () => {
     console.log(`BFF Server is running at ${port} port`);
 });
 
 function handleBFF(req: IncomingMessage, res: ServerResponse): void {
     console.log("调用bff层接口", req.url);
     switch (req.url) {
         case '/order/add':
             addOrder(req, res);
             break;
         default:
             res.end('{ code: 500, msg: "route not found", data: "" }');
             break;
     }
 }
 
 // 处理添加订单方法
 function addOrder(req: IncomingMessage, res: ServerResponse): void {
     if (req.method !== 'POST') {
         res.end('{ code: 500, msg: "route method not support", data: "" }');
         return;
     }
 
     let data = '';
     req.on('data', (chunk: Buffer) => {
         data += chunk;
     });
 
     req.on('end', async () => {
         const { code: orderCode, data: orderResult} = await publicRequest(
             4444,
             "addOrder",
             data
         );
         console.log("orderResult", orderResult, orderCode);
         
         const {code: dataCode, data: dataResult} = await publicRequest(
             4445,
             "getData",
             data
         );
         console.log("dataResult", dataResult, dataCode)
         res.end(JSON.stringify({
             code: 200,
             data: { orderResult, dataResult }
         }));
     });
 }
 
 // 公共请求方法
 async function publicRequest(port: number, method: string, data: any): Promise<ResponseBody> {
     // 处理port
     console.log("开始处理", port, data);
     return new Promise((resolve) => {
         function callback(res: ResponseBody){
             console.log("处理完成", port, data);
            resolve(res)
         }
         // 发送数据
         sendDataToService(port, {
             method,
             data
         }, callback)
     });
 }
 