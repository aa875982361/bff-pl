"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServices = void 0;
/**
 * 创建服务的基础方法，传入端口和处理回调，即可创建服务
 */
var net_1 = require("net");
var buffHandler_1 = require("../utils/buffHandler");
var buffSplit_1 = require("../utils/buffSplit");
/**
 * 数据包的头部长度
 */
var packageHeadLength = 10;
/**
 * 创建一个后端服务
 * @param port 端口
 * @param callback 处理回调
 * @returns 服务
 */
function createServices(port, callback) {
    var services = (0, net_1.createServer)(function (socket) {
        // 上次未处理buffer
        var preBuffer = Buffer.alloc(0);
        // 连接
        socket.on("connect", function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log("connect", port, args);
        });
        // 事件
        socket.on("data", function (data) {
            data = Buffer.concat([preBuffer, data]);
            // 处理粘包问题
            preBuffer = (0, buffSplit_1.handleStickPackage)(data, function (onePackageBuff) {
                // 单独处理一个数据包
                handleOneDataPackages(onePackageBuff, socket, callback);
            });
        });
        // 结束
        socket.on("end", function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log("end", port, args);
        });
    });
    services.listen(port, function () {
        // 开始监听端口
        console.log("start listen port", port);
    });
    return services;
}
exports.createServices = createServices;
/**
 * 处理一个数据包
 * @param data 数据包buffer
 * @param socket 连接
 * @param callback 回调服务
 * @returns
 */
function handleOneDataPackages(data, socket, callback) {
    var result;
    try {
        // 解密数据
        result = (0, buffHandler_1.decodeBuff)(data);
    }
    catch (error) {
        console.log("反序列化buff失败", error);
        return;
    }
    // 区分是请求，还是返回
    if (result.requestType === buffHandler_1.RequsetType.REQUEST) {
        // 客户端的请求 
        if (result.body.method === "jump") {
            // 心跳包，忽略
            return;
        }
        // 否则处理方法
        console.log('server receive data', result.requestId);
        var resData = callback(result.body);
        // 构建返回帧
        var responResultBuff = (0, buffHandler_1.encodeBuff)({
            requestType: buffHandler_1.RequsetType.RESPONSE,
            requestId: result.requestId,
            body: resData
        });
        // 写入返回结果
        socket.write(responResultBuff);
    }
    else {
        // 客户端的回调
    }
}
