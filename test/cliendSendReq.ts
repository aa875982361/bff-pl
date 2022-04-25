/**
 * 客户端发送请求
 */

const request = require("request")
const childProcess = require("child_process")


let url = "http://127.0.0.1:8081/order/add"
let maxNum = 2500
let successNum = 0
let failNum = 0
let successList: number[] = []
let failList: number[] = []

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
                failList.push(index)
                resolve("")
                return
            }
            if(response.statusCode === 200){
                // console.log(index + "res 200", body)
                successNum++
                successList.push(index)
                resolve(response.statusCode)
            }else{
                // console.log(index + " res not 200", response.statusCode, body)
                failNum++
                failList.push(index)
                resolve("")
            }
        })
    })
}

childProcess.error = (err: any) => {
    console.log("childProcess error", err);
}

process.on("error", (err: any) => {
    console.log("process error", err);
})

/**
 * 测试通过curl
 * @param index 
 * @returns 
 */
function testByCurl(index: number){
    return new Promise((resolve, reject) => {
        // const commandStr = `curl -X POST ${url}`
        const commandStr = `curl -H "Content-Type: application/json" -X POST -d '${JSON.stringify({
            testIndex: index,
        })}'  ${url}`
        try {
            const curlCommand = childProcess.exec(commandStr, {maxBuffer: 1024*1024*100}, (err: string, stdout: string, stderr: string) => {
                if(err){
                    debugger
                    console.log("执行curl失败", commandStr, err);
                    failNum++
                    failList.push(index)
                // }else if(stderr){
                //     // console.log("执行curl 产生失败日志", commandStr, stderr);
                //     failNum++
                //     failList.push(index)
                }else{
                    successNum++
                    successList.push(index)
                    // console.log("执行curl成功");
                }
                resolve("")
            })
            curlCommand.on("error", (err: any) => {
                console.log("curlCommand error", err);
                
                resolve("")
            })
            curlCommand.on("close", (err: any) => {
                console.log("curlCommand close", err);
                
                resolve("")
            })
        } catch (error) {
            console.log("exec 执行失败", error);
            failNum++
            failList.push(index)
            resolve("")
        }

    })
}
/**
 * 主要测试代码
 */
function mainTest(): void{
    successList = []
    failList = []
    const preTime = +new Date()
    Promise.all(new Array(maxNum).fill(1).map((num, index) => testByCurl(index))).then(() => {
        console.log("successList", successList);
        console.log("failList", failList);
        
        console.log("successNum", successNum);
        console.log("failNum", failNum);
        console.log("all", maxNum);
        const currentTime = +new Date()
        console.log("time", currentTime - preTime);

        // mainTest()
    })
}
mainTest()