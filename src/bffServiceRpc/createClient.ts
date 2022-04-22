/**
 * 创建一个客户端链接
 */

import { createConnection, Socket } from "net";
import { decodeBuff, encodeBuff, ResponseBody, RequestBody, RequsetType } from "../utils/buffHandler";

/**
 * 客户端连接缓存
 */
const clientMap: Record<string, Socket> = {
}
/**
 * 事件列表
 */
const eventMap: Record<string, (data:ResponseBody)=>any> = {}

/**
 * 请求id，每次请求都不一样
 */
let requestId = 1000

/**
 * 创建一个客户端连接
 * @param port 
 * @returns 
 */
function createClient(port: number): Socket{
    // 判断是否有缓存
    if(clientMap[port]){
        return clientMap[port]
    }
    const client = createConnection(port)
    clientMap[port] = client
    client.on("connect", () => {
        console.log("client connect");
    })
    
    client.on("data", (data) => {
        // 反序列化数据
        const result = decodeBuff(data)
        if(result.requestType === RequsetType.RESPONSE){
            // 返回数据
            // 找到请求id对应的callback运行
            const requestId = result.requestId
            // 查找回调
            const callback = eventMap[requestId]
            // 检查是否存在回调
            if(callback && typeof callback === "function"){
                // 触发回调
                callback(result.body)
                // 运行完就可以解除关系
                delete eventMap[requestId]
            }
        }else if(result.requestType === RequsetType.REQUEST){
            // 服务端向客户端发送请求
            console.log("服务端发送的请求");
            
        }else{
            console.error("非法请求类型")
        }
    })
    // 定时发送心跳保活
    return client
}

/**
 * 发送数据到一个服务
 * @param port 
 * @param buf 
 * @param callback 
 */
export function sendDataToService(port: number, body: RequestBody, callback: (reponseBody: ResponseBody) => any){
    // 创建一个客户端连接，或者用存在的连接
    const client = createClient(port)
    // 获取当前请求id，并自增请求id, 保证不重复
    const currentRequestId = requestId++
    // 编码数据
    const sendBuff = encodeBuff({
        requestType: RequsetType.REQUEST,
        requestId: currentRequestId,
        body,
        timeOut: 60
    })
    // 绑定回调到当前的请求id
    eventMap[currentRequestId] = callback
    // 发送数据
    client.write(sendBuff)
}