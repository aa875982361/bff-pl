"use strict";
/**
 * 基础服务，类似微服务
 */
Object.defineProperty(exports, "__esModule", { value: true });
var createServices_1 = require("./createServices");
/**
 * 订单服务
 */
var orderService = createServices_1.createServices(4444, handleOrderRequest);
/**
 * 数据服务
 */
var dataService = createServices_1.createServices(4445, handleDataRequest);
/**
 * 处理订单相关的请求
 * @param requestBody
 */
function handleOrderRequest(requestBody) {
    var method = requestBody.method, data = requestBody.data;
    var res = undefined;
    var code;
    var msg = "";
    switch (method) {
        case "addOrder":
            res = addOrder();
            code = 200;
            msg = "success";
            break;
        default:
            code = 500;
            msg = "没找到对应的方法";
    }
    return {
        data: res,
        code: code,
        msg: msg
    };
}
function addOrder(data) {
    return "add order success";
}
/**
 * 处理数据相关的请求
 * @param requestBody
 * @returns
 */
function handleDataRequest(requestBody) {
    var method = requestBody.method, data = requestBody.data;
    var res = undefined;
    var code = 0;
    var msg = "";
    switch (method) {
        case "getData":
            res = getData();
            code = 200;
            msg = "success";
            break;
        default:
            code = 500;
            msg = "没找到对应的方法";
    }
    return {
        data: res,
        code: code,
        msg: msg
    };
}
function getData() {
    return {
        list: [1, 2, 3, 4, 5]
    };
}
