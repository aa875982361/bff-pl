/**
 * 客户端发送请求
 */

const request = require("request")


let url = "http://127.0.0.1:8081/order/add"
let maxNum = 1000
let successNum = 0
let failNum = 0

function test(index: number){
    // 发出请求
    // console.log("开始发送请求", url);
    return new Promise((resolve, reject) => {
        request({
            url,
            method: "POST",
            json: true,
            body: {
                testIndex: index
            }
        }, (err: any, response: any, body: any): void => {
            if(err){
                console.log("err", err);
                failNum++
                resolve("")
                return
            }
            if(response.statusCode === 200){
                // console.log(index + "res 200", body)
                successNum++
                resolve(response.statusCode)
            }else{
                console.log(index + " res not 200", response.statusCode, body)
                failNum++
                resolve("")
            }
        })
    })
}

Promise.all(new Array(maxNum).fill(1).map((num, index) => test(index))).then(() => {
    console.log("successNum", successNum);
    console.log("failNum", failNum);
    console.log("all", maxNum);
})