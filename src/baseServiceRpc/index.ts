/**
 * 基础服务，类似微服务
 */

import { RequestBody, ResponseBody } from "../utils/buffHandler";
import { createServices } from "./createServices";

/**
 * 订单服务
 */
const orderService = createServices(4444, handleOrderRequest)

/**
 * 数据服务
 */
const dataService = createServices(4445, handleDataRequest)



/**
 * 处理订单相关的请求
 * @param requestBody 
 */
function handleOrderRequest(requestBody: RequestBody): ResponseBody{
    const { method, data } = requestBody
    let res = undefined
    let code
    let msg = ""
    switch(method){
        case "addOrder":
            res = addOrder()
            code = 200
            msg = "success"
            break
        default :
            code = 500
            msg = "没找到对应的方法"
    }

    return {
        data: res,
        code,
        msg
    }
}

function addOrder(data?: any): any{
    return "add order success"
}

/**
 * 处理数据相关的请求
 * @param requestBody 
 * @returns 
 */
function handleDataRequest(requestBody: RequestBody): ResponseBody {
    const { method, data } = requestBody
    let res = undefined
    let code = 0
    let msg = ""
    switch(method){
        case "getData":
            res = getData()
            code = 200
            msg = "success"
            break
        default :
            code = 500
            msg = "没找到对应的方法"
    }

    return {
        data: res,
        code,
        msg
    }
}

function getData(): any {
    return {
        list: [1,2,3,4,5]
    }
}