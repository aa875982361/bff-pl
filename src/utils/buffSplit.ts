/**
 * 处理一些buffer的问题，比如说：
 * 1. 数据粘包
 */

/**
 * 处理时间回调
 * @param dataBuffer 
 * @param callback 
 */
export function handleStickPackage(dataBuffer: Buffer, callback: (onePackageBuff: Buffer ) => void): Buffer{
    // 先判空
    while(dataBuffer.length > 0){
        // 粘包问题 先读取10位 然后读取数据长度的大小, 然后再处理
        console.log("dataBuffLength", dataBuffer.length);
        const dataBuffLength = dataBuffer.length
        // 数据包的传输数据长度
        const packageBodyLength = dataBuffer.readInt32BE(5)
        // 数据包总长度
        const packageLength = 10 + packageBodyLength
        // 如果长度小于一个数据包的长度
        if(dataBuffLength < packageLength){
            console.log("存在buff数据长度，小于一个数据包的情况", dataBuffLength, packageLength)
            break
        }
        // 截取数据包
        console.log("packageLength", packageLength);
        
        const packageData = dataBuffer.slice(0, packageLength)
        // 调用数据包的处理
        callback(packageData)
        // 延长下一段
        dataBuffer = dataBuffer.slice(packageLength)
        console.log("dataBufferLength", dataBuffer.length);
    }
    return dataBuffer
}