const http = require('http');

// 订单服务
const orderApp = http.createServer((req, res) => {
    handleOrderInput(req, res);
});

orderApp.listen(8081, () => {
    console.log('Order Server is running at 8081 port');
});

// 数据服务
const dataApp = http.createServer((req, res) => {
    handleDataInput(req, res);
});

dataApp.listen(8082, () => {
     console.log('Data Server is running at 8082 port');
});

function handleOrderInput(req, res) {
    console.log("调用订单服务", req.url);
    switch (req.url) {
        case '/order/add':
        res.end('{ code: 200, msg: "success", data: "" }');
        break;
        default:
        res.end('{ code: 500, msg: "route not found", data: "" }');
        break;
    }
}

function handleDataInput(req, res) {
    console.log("调用数据服务", req.url);
    switch (req.url) {
        case '/data/add':
        res.end('{ code: 200, msg: "success", data: "" }');
        break;
        default:
        res.end('{ code: 500, msg: "route not found", data: "" }');
        break;
    }
}

