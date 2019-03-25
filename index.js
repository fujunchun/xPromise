class xPromise {
    // 状态， pending fullfiled rejected
    state = undefined
    // 当前promise resolve的值
    result = undefined
    // 订阅者, then函数注册的回调均为当前promise的订阅者，包括then函数返回的新的promise，当promise状态改变，将做发布操作
    subscribers = []
    constructor (resolver) {
        // 创建即调用传入的函数，将resolve和reject方法给到传入的函数
        resolver(function resolvePromise (value) {
            resolve(this, value)
        }, function rejectPromise (value) {
            reject(this, value)
        })
    }

    then () {

    }  
}

// resolve过程参照promise 规范
function resolve (promise, value) {
    // 如果resolve的值是promise本身，则报TypeError
    if (promise === value) {
       reject(promise, selfFullfillment())
    } else if () {
        
    }
}

function reject (promise, reason) {
    if (promise.state !== 'pending') return
    promise.state = 'rejected'
    promise.result = reason

    // 发布
    publish(promise)
}

function selfFullfillment () {
    return new TypeError('You cannot resolve a promise with itself')
}
