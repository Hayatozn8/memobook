// 02 Promise构造函数的实现

// 调用方式: new MyPromise( (resolve, reject) => {...})
function MyPromise(executor) {
    // 1. 保存 this 对象，使得在 resolve、reject 中都可以使用
    const self = this;
    // 或者为 resolve、reject 绑定this为当前对象
    // resolve = resolve.bind(this);
    // reject = reject.bind(this);

    this.status = 'pending';// 给Promise对象指定指定初始状态
    this.data = undefined;  // 用于保存结果数据
    this.callbacks = [];    // 保存回调函数，每个元素的结构: `{onResolved(){}, onRejected(){}}`

    // 2. 定义 resolve、reject 函数
    function resolve(value) {
        if (self.status !== 'pending') return;  // 只能修改一次状态
        self.status = 'fulfilled';              // 修改状态
        self.data = value;                      // 保存value数据

        if (self.callbacks.length > 0) {
            // 4. 如果 callbacks 中已经有了回调函数
            // （常规顺序：先设置回调函数，再改变状态)
            // 通过 setTimeout，【异步执行】所有成功的回调
            setTimeout(
                () => self.callbacks.forEach(cbObj => cbObj.onResolved(value))
            );
        }
    }
    function reject(reason) {
        // 判断状态，并且只能修改一次状态
        if (self.status !== 'pending') return;  // 只能修改一次状态
        self.status = 'rejected';               // 修改状态
        self.data = reason;                     // 保存value数据

        if (self.callbacks.length > 0) {
            // 4. 如果 callbacks 中已经有了回调函数
            // （常规顺序：先设置回调函数，再改变状态)
            // 通过 setTimeout，【异步执行】所有失败的回调
            setTimeout(
                () => self.callbacks.forEach(cbObj => cbObj.onRejected(reason))
            );
        }
    }

    // 3. 同步调用 executor
    // 为了实现抛出异常时，状态变成 rejected，并且传递异常数据，
    // 需要在 try...catch 内执行 executor
    try {
        executor(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

// 接收成功、失败的响应函数，并返回一个新的Promise对象
MyPromise.prototype.then = function (onResolved, onRejected) {
    // 假设都是pending状态，直接添加到回调数组中
    this.callbacks.push({ onResolved, onRejected });
}

// 接收失败的响应函数，并返回一个新的Promise对象
MyPromise.prototype.catch = function (onRejected) {
    // 假设都是pending状态，直接添加到回调数组中
    this.callbacks.push({ onResolved: undefined, onRejected });
}

// 返回一个成功的Promise对象
MyPromise.resolve = function (value) { }

// 返回一个失败的Promise对象
MyPromise.reject = function (reason) { }

// 返回一个Promise
// 只有所有Promise都成功时，才成功；只要有一个失败，则立刻返回一个失败的Promise
MyPromise.all = function (promises) { }

// 返回一个Promise。返回第一个完成的 Promise
MyPromise.race = function (promises) { }

module.exports = MyPromise