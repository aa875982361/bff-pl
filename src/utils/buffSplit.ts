/**
 * 处理一些buffer的问题，比如说：
 * 1. 数据粘包
 */

/**
 * 处理时间回调
 * @param dataBuffer 
 * @param callback 
 */
export function handleStickPackage(dataBuffer: Buffer, callback: (onePackageBuff: Buffer ) => void): void{
    // 先判空
    while(dataBuffer.length > 0){
        // 粘包问题 先读取10位 然后读取数据长度的大小, 然后再处理
        console.log("dataBuffLength", dataBuffer.length);
        // 数据包的传输数据长度
        const packageBodyLength = dataBuffer.readInt32BE(5)
        // 数据包总长度
        const packageLength = 10 + packageBodyLength
        // 截取数据包
        const packageData = dataBuffer.slice(0, packageLength)
        // 调用数据包的处理
        callback(packageData)
        // 延长下一段
        dataBuffer = dataBuffer.slice(packageLength)
    }
}