/**
 * 客户端发送请求
 */

const request = require("request")


let url = "http://127.0.0.1:8081/order/add"


function test(){
    // 发出请求
    console.log("开始发送请求", url);
    request({
        url,
        method: "POST"
    }, (err: any, response: any, body: any): void => {
        if(err){
            console.log("err", err);
            return
        }
        console.log("res", response.statusCode, body)
    })
}

new Array(50).fill(5).forEach(() => test())