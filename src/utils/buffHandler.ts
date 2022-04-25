/**
 * 数据的序列化和反序列化
 * 数据结构
 * {
 *  requestType: 0, 一个字节 0代表请求， 1代表响应
 *  requestId: 1001, 4个字节 请求id
 *  dataLength: 100, 数据长度,
 *  body: "xxxx", 传输数据 
 * }
 * 
 * body: {
 *  method: "addOrder",// 请求方法
 *  data: {
 *      acId: "2321231231",// 请求数据
 *  }
 * }
 */

export enum RequsetType {
    REQUEST = 0,
    RESPONSE = 1
}

export interface RequestBody {
    method: string,
    data?: any,
}

export interface ResponseBody {
    code: number,
    data?: any,
    msg?: string
}

export type RequestOrResponseControl = BaseControl & (RequestControl | ResponseControl)

interface BaseControl {
    /** 请求id 4个字节 */
    requestId: number,
    /** 超时时间 1个字节 0-256 */
    timeOut?: number
}

export interface ResponseControl {
    /** 请求类型 0代表请求， 1代表响应 */
    requestType: RequsetType.RESPONSE,
    /** 请求内容 */
    body: ResponseBody,
}

/**
 * 请求控制结构
 */
export interface RequestControl {
    /** 请求类型 0代表请求， 1代表响应 */
    requestType: RequsetType.REQUEST,
    /** 请求内容 */
    body: RequestBody,
}

/**
 * 序列化数据
 * @param {*} requestType 一个字节 0代表请求， 1代表响应
 * @param {*} requestId 请求id
 * @param {*} body 传输数据
 */
export function encodeBuff(requestControl: RequestOrResponseControl): Buffer {
    if(!requestControl){
        throw new Error("需要传入 requestControl")
    }
    const { requestType , requestId , body , timeOut = 60} = requestControl
    // 设定好数据格式
    const bodyStr = JSON.stringify(body)
    // 字符串的字节长度
    const length = strlen(bodyStr)
    // console.log("bodyStr length", length);
    
    
    // 头部数据buff 10个字节包括: 1(请求类型) + 4（请求id）+ 4（数据长度）+ 1（超时时间）
    const headerBuffer = Buffer.alloc(10)
    // 传输数据buff 长度是字符串长度
    const bodyBuffer = Buffer.alloc(length, bodyStr)
    // console.log("bodyBuffer ", bodyBuffer.toString());
    // 第一位是类型
    headerBuffer[0] = requestType
    // 第2-5位是请求id
    headerBuffer.writeInt32BE(requestId, 1)
    // 第6-9位是请求长度
    headerBuffer.writeInt32BE(length, 5)
    // 第10位是超时时间
    headerBuffer[9] = timeOut
    // console.log("headerBuffer", headerBuffer);
    // 拼接结果
    const resBuff = Buffer.concat([headerBuffer, bodyBuffer])
    // 返回结果
    return resBuff
}

/**
 * 反序列化buffer
 * @param buff 
 * @returns 结果
 */
export function decodeBuff(buff: Buffer): RequestOrResponseControl{
    // 按照协议取值
    // console.log("decodeBuff", buff.length);
    if(buff.length < 10){
        throw new Error("decodeBuff length small")
    }
    // 请求类型
    const requestType = buff[0]
    // 请求id
    const requestId = buff.readInt32BE(1)
    // body的数据长度
    const bodyLength = buff.readInt32BE(5)
    // 超时时间
    const timeOut = buff[9]
    let bodyBuff:Buffer
    try {
        // body数据内容
        bodyBuff = buff.slice(10, 10 + bodyLength)
    } catch (error) {
        console.log("分割body数据失败", error);
        throw new Error("分割body数据失败")
    }
    // 输出body内容
    // console.log("bodyBuff", bodyBuff);
    // console.log("bodyBuffStr", bodyBuff.toString());
    const bodyStr = bodyBuff.toString()
    let bodyObj = {
        method: "unknow",
    }
    try {
        bodyObj = JSON.parse(bodyStr)
    } catch (error) {
        console.error("转换json失败", bodyStr);
        throw new Error("转换json失败:" + bodyStr)
    }
    return {
        requestId,
        requestType,
        body: bodyObj,
        timeOut
    }
}

/*计算字符串的字节长度*/
function strlen(str: string): number{
    return Buffer.byteLength(str, "utf8");
}

// -------------------- test -----------------------

// const body: RequestBody = {
//     method: "add",
//     data: {
//         id: "中文测试中文"
//     }
// }

// const endcodeBuffRes = encodeBuff({
//     requestType: RequsetType.REQUEST,
//     requestId: 1001,
//     body,
//     timeOut: 60
// })
// console.log("endcodeBuffRes", endcodeBuffRes);

// const decodeObjRes = decodeBuff(endcodeBuffRes)
// console.log("decodeObjRes", decodeObjRes);

