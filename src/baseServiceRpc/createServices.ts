/**
 * 创建服务的基础方法，传入端口和处理回调，即可创建服务
 */
 import { createServer, Server, Socket } from 'net';
 import { decodeBuff, encodeBuff, RequestBody, RequsetType, ResponseBody } from '../utils/buffHandler';
import { handleStickPackage } from '../utils/buffSplit';


 /**
  * 数据包的头部长度
  */
 const packageHeadLength = 10
 
 /**
  * 创建一个后端服务
  * @param port 端口
  * @param callback 处理回调
  * @returns 服务
  */
 export function createServices(port: number, callback: (requestBody: RequestBody) => ResponseBody): Server{
    const services = createServer((socket: Socket) => {
        // 上次未处理buffer
        let preBuffer:Buffer = Buffer.alloc(0)
        // 连接
        socket.on("connect", (...args) => {
            console.log("connect", port, args);
        })
        // 事件
        socket.on("data", (data:Buffer) => {
            data = Buffer.concat([preBuffer, data])
            // 处理粘包问题
            preBuffer = handleStickPackage(data, (onePackageBuff: Buffer) => {
                // 单独处理一个数据包
                handleOneDataPackages(onePackageBuff, socket, callback)
            })

        })
        // 结束
        socket.on("end", (...args) => {
            console.log("end", port, args);
        })
    })
    services.listen(port, () => {
        // 开始监听端口
        console.log("start listen port", port);
    })
    return services
 }
 

 /**
  * 处理一个数据包
  * @param data 数据包buffer
  * @param socket 连接
  * @param callback 回调服务
  * @returns 
  */
 function handleOneDataPackages(data: Buffer, socket: Socket, callback: (requestBody: RequestBody) => ResponseBody): void{
    let result 
    try {
        // 解密数据
        result = decodeBuff(data)
     } catch (error) {
        console.log("反序列化buff失败", error);
        return 
     }
     
     // 区分是请求，还是返回
     if(result.requestType === RequsetType.REQUEST){
         // 客户端的请求 
         if(result.body.method === "jump"){
             // 心跳包，忽略
             return
         }
         // 否则处理方法
         console.log('server receive data', result.requestId);
         const resData = callback(result.body)
         // 构建返回帧
         const responResultBuff = encodeBuff({
             requestType: RequsetType.RESPONSE,
             requestId: result.requestId,
             body: resData
         })
         // 写入返回结果
         socket.write(responResultBuff);
     }else{
         // 客户端的回调

     }
 }