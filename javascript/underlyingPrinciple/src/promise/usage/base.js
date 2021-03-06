// promise test

let promise = new Promise((resolve, reject)=>{
    // 初始化promise， 状态：pending
    console.log("promise init start")

    // 执行异步操作，通常是发送ajax请求、开启定时器
    setTimeout(()=>{
        console.log("promise inner timer")
        let data = "timer data"
        // 根据异步任务的返回结果去修改promise的状态
        // 异步任务成功
        resolve(data) //修改promise的状态为resolved
        // 异步任务失败
        // reject(data) //修改promise的状态为rejected
    }, 2000)
})

console.log("promise init end")

promise.then(
    data=>console.log("success " + data),  // 成功的回调
    error=>console.log("failure " + error)   // 失败的回调
)

console.log("promise end")

// 输出:
// promise init start
// promise init end
// promise end
// promise inner timer
// success timer data