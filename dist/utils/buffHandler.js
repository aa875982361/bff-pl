"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBuff = exports.encodeBuff = exports.RequsetType = void 0;
var RequsetType;
(function (RequsetType) {
    RequsetType[RequsetType["REQUEST"] = 0] = "REQUEST";
    RequsetType[RequsetType["RESPONSE"] = 1] = "RESPONSE";
})(RequsetType = exports.RequsetType || (exports.RequsetType = {}));
/**
 * 序列化数据
 * @param {*} requestType 一个字节 0代表请求， 1代表响应
 * @param {*} requestId 请求id
 * @param {*} body 传输数据
 */
function encodeBuff(requestControl) {
    if (!requestControl) {
        throw new Error("需要传入 requestControl");
    }
    var requestType = requestControl.requestType, requestId = requestControl.requestId, body = requestControl.body, _a = requestControl.timeOut, timeOut = _a === void 0 ? 60 : _a;
    // 设定好数据格式
    var bodyStr = JSON.stringify(body);
    // 字符串的字节长度
    var length = strlen(bodyStr);
    // console.log("bodyStr length", length);
    // 头部数据buff 10个字节包括: 1(请求类型) + 4（请求id）+ 4（数据长度）+ 1（超时时间）
    var headerBuffer = Buffer.alloc(10);
    // 传输数据buff 长度是字符串长度
    var bodyBuffer = Buffer.alloc(length, bodyStr);
    // console.log("bodyBuffer ", bodyBuffer.toString());
    // 第一位是类型
    headerBuffer[0] = requestType;
    // 第2-5位是请求id
    headerBuffer.writeInt32BE(requestId, 1);
    // 第6-9位是请求长度
    headerBuffer.writeInt32BE(length, 5);
    // 第10位是超时时间
    headerBuffer[9] = timeOut;
    // console.log("headerBuffer", headerBuffer);
    // 拼接结果
    var resBuff = Buffer.concat([headerBuffer, bodyBuffer]);
    // 返回结果
    return resBuff;
}
exports.encodeBuff = encodeBuff;
/**
 * 反序列化buffer
 * @param buff
 * @returns 结果
 */
function decodeBuff(buff) {
    // 按照协议取值
    // console.log("decodeBuff", buff.length);
    if (buff.length < 10) {
        throw new Error("decodeBuff length small");
    }
    // 请求类型
    var requestType = buff[0];
    // 请求id
    var requestId = buff.readInt32BE(1);
    // body的数据长度
    var bodyLength = buff.readInt32BE(5);
    // 超时时间
    var timeOut = buff[9];
    var bodyBuff;
    try {
        // body数据内容
        bodyBuff = buff.slice(10, 10 + bodyLength);
    }
    catch (error) {
        console.log("分割body数据失败", error);
        throw new Error("分割body数据失败");
    }
    // 输出body内容
    // console.log("bodyBuff", bodyBuff);
    // console.log("bodyBuffStr", bodyBuff.toString());
    var bodyStr = bodyBuff.toString();
    var bodyObj = {
        method: "unknow",
    };
    try {
        bodyObj = JSON.parse(bodyStr);
    }
    catch (error) {
        console.error("转换json失败", bodyStr);
        throw new Error("转换json失败:" + bodyStr);
    }
    return {
        requestId: requestId,
        requestType: requestType,
        body: bodyObj,
        timeOut: timeOut
    };
}
exports.decodeBuff = decodeBuff;
/*计算字符串的字节长度*/
function strlen(str) {
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
