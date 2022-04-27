const buff = Buffer.alloc(10)
buff.write("write")
console.log("buff", buff);

// 测试slice
const slice = buff.slice(0, 100)
console.log("sliceLength", buff.length);
console.log("slice", slice);

