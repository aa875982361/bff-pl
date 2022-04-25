"use strict";
/**
 * 创建一个客户端链接
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDataToService = void 0;
var net_1 = require("net");
var buffHandler_1 = require("../utils/buffHandler");
var buffSplit_1 = require("../utils/buffSplit");
/**
 * 客户端连接缓存
 */
var clientMap = new Map();
/**
 * 事件列表
 */
var eventMap = {};
/**
 * 请求id，每次请求都不一样
 */
var requestId = 1000;
/**
 * 创建一个客户端连接
 * @param port
 * @returns
 */
function createClient(port) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!clientMap.has(port)) return [3 /*break*/, 2];
                    return [4 /*yield*/, clientMap.get(port)];
                case 1:
                    cacheClient = _a.sent();
                    if (cacheClient && cacheClient.readyState !== "closed") {
                        // 存在缓存
                        return [2 /*return*/, cacheClient];
                    }
                    _a.label = 2;
                case 2:
                    console.log("新起一个链接", port);
                    // 设置缓存 等待连接成功
                    cacheClient = new Promise(function (resolve, reject) {
                        var client = (0, net_1.createConnection)(port);
                        client.on("connect", function () {
                            console.log("client connect", port);
                            resolve(client);
                        });
                        // 上次未处理buffer
                        var preBuffer = Buffer.alloc(0);
                        client.on("data", function (data) {
                            // 拼接上次未处理
                            data = Buffer.concat([preBuffer, data]);
                            // 这里也会有数据粘包问题
                            preBuffer = (0, buffSplit_1.handleStickPackage)(data, function (onePacakgeBuff) {
                                var result;
                                try {
                                    // 反序列化数据
                                    result = (0, buffHandler_1.decodeBuff)(onePacakgeBuff);
                                }
                                catch (error) {
                                    console.log("解析数据包失败，跳过", error);
                                    return;
                                }
                                if (result.requestType === buffHandler_1.RequsetType.RESPONSE) {
                                    // 返回数据
                                    // 找到请求id对应的callback运行
                                    var requestId_1 = result.requestId;
                                    // 查找回调
                                    var callback = eventMap[requestId_1];
                                    // 检查是否存在回调
                                    if (callback && typeof callback === "function") {
                                        // 触发回调
                                        callback(result.body);
                                        // 运行完就可以解除关系
                                        delete eventMap[requestId_1];
                                    }
                                }
                                else if (result.requestType === buffHandler_1.RequsetType.REQUEST) {
                                    // 服务端向客户端发送请求
                                    console.log("服务端发送的请求");
                                }
                                else {
                                    console.error("非法请求类型");
                                }
                            });
                        });
                        client.on("error", function (err) {
                            console.log("client connect error", err);
                            reject(err);
                        });
                        client.on("close", function () {
                            console.log("client closed", port);
                            clientMap.delete(port);
                        });
                    });
                    clientMap.set(port, cacheClient);
                    return [2 /*return*/, cacheClient];
            }
        });
    });
}
/**
 * 发送数据到一个服务
 * @param port
 * @param buf
 * @param callback
 */
function sendDataToService(port, body) {
    return __awaiter(this, void 0, void 0, function () {
        var client, currentRequestId, sendBuff;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createClient(port)
                    // 获取当前请求id，并自增请求id, 保证不重复
                ];
                case 1:
                    client = _a.sent();
                    currentRequestId = requestId++;
                    sendBuff = (0, buffHandler_1.encodeBuff)({
                        requestType: buffHandler_1.RequsetType.REQUEST,
                        requestId: currentRequestId,
                        body: body,
                        timeOut: 60
                    });
                    // console.log("调用客户端连接发送数据", port, currentRequestId);
                    try {
                        // 发送数据
                        return [2 /*return*/, _clientSendData(client, sendBuff, currentRequestId)];
                    }
                    catch (error) {
                        console.log("发送数据包失败", currentRequestId);
                        // 重试
                        return [2 /*return*/, sleep(1000).then(function () { return sendDataToService(port, body); })];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.sendDataToService = sendDataToService;
/**
 * 真正发送数据到服务端
 * @param client 客户端链接
 * @param data 数据
 * @param requestId 请求id
 * @returns
 */
function _clientSendData(client, data, requestId) {
    return new Promise(function (resolve, reject) {
        // 绑定回调到当前的请求id
        eventMap[requestId] = resolve;
        try {
            client.write(data);
        }
        catch (error) {
            reject(error);
        }
    });
}
function sleep(sleepTime) {
    return new Promise(function (resolve) {
        setTimeout(resolve, sleepTime);
    });
}
