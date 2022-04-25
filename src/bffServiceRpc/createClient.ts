/**
 * 创建一个客户端链接
 */

import { createConnection, Socket } from "net";
import { decodeBuff, encodeBuff, ResponseBody, RequestBody, RequsetType } from "../utils/buffHandler";
import { handleStickPackage } from "../utils/buffSplit";

/**
 * 客户端连接缓存
 */
const clientMap: Map<number, Promise<Socket>> = new Map<number, Promise<Socket>>()
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
async function createClient(port: number): Promise<Socket>{
    // 判断是否有缓存
    let cacheClient
    // 需要判断是否还在连接
    if(clientMap.has(port)){
        cacheClient = await clientMap.get(port)
        if(cacheClient && cacheClient.readyState !== "closed"){
            // 存在缓存
            return cacheClient
        }
    }
    console.log("新起一个链接", port);
    // 设置缓存 等待连接成功
    cacheClient = new Promise<Socket>((resolve, reject) => {
        const client = createConnection(port)
        client.on("connect", () => {
            console.log("client connect", port);
            resolve(client)
        })
    
        // 上次未处理buffer
        let preBuffer:Buffer = Buffer.alloc(0)
        
        client.on("data", (data) => {
            // 拼接上次未处理
            data = Buffer.concat([preBuffer, data])
            // 这里也会有数据粘包问题
            preBuffer = handleStickPackage(data, (onePacakgeBuff: Buffer) => {
                let result
                try {
                    // 反序列化数据
                    result = decodeBuff(onePacakgeBuff)
                } catch (error) {
                    console.log("解析数据包失败，跳过", error)
                    return
                }
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
        })

        client.on("error", (err) => {
            console.log("client connect error", err);
            reject(err)
        })
    
        client.on("close", () => {
            console.log("client closed", port);
            clientMap.delete(port)
        })
    })
    clientMap.set(port, cacheClient)
    return cacheClient
    
}

/**
 * 发送数据到一个服务
 * @param port 
 * @param buf 
 * @param callback 
 */
export async function sendDataToService(port: number, body: RequestBody): Promise<ResponseBody>{
    // 创建一个客户端连接，或者用存在的连接
    const client = await createClient(port)
    // 获取当前请求id，并自增请求id, 保证不重复
    const currentRequestId = requestId++
    // 编码数据
    const sendBuff = encodeBuff({
        requestType: RequsetType.REQUEST,
        requestId: currentRequestId,
        body,
        timeOut: 60
    })
    // console.log("调用客户端连接发送数据", port, currentRequestId);
    try {
        // 发送数据
        return _clientSendData(client, sendBuff, currentRequestId)
    } catch (error) {
        console.log("发送数据包失败", currentRequestId);
        // 重试
        return sleep(1000).then(() => sendDataToService(port, body))
    }
}

/**
 * 真正发送数据到服务端
 * @param client 客户端链接
 * @param data 数据
 * @param requestId 请求id
 * @returns 
 */
function _clientSendData(client: Socket, data: Buffer, requestId: number): Promise<ResponseBody> {
    return new Promise((resolve, reject) => {
        // 绑定回调到当前的请求id
        eventMap[requestId] = resolve
        try {
            client.write(data)
        } catch (error) {
            reject(error)
        }
    })
}


function sleep(sleepTime: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, sleepTime)
    })
}