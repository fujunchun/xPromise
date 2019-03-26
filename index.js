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

let TRY_CATCH_ERROR = { error: null }

// resolve过程参照promise 规范
function resolve (promise, value) {
    // 如果resolve的值是promise本身，则报TypeError
    if (promise === value) {
       reject(promise, selfFullfillment())
    } else if (isObjectOrFunction(value)) {
        // 如果是对象或者函数，则需要判断其是否thenable
        handleMaybeThenable(promise, value, getThen(value))
    } else {
        // 普通值，直接fullfil
        fullfil(promise, value)
    }
}

// 对可能为promise的对象和函数进行处理
function handleMaybeThenable (promise, maybeThenable, then) {
    //此处对比constructor是因为，需要将此函数分离出去，模块引入，故不作instanceOf比较
    if (promise.constructor === maybeThenable.constructor) {
        // 同一类型promise, 按照规范，promise的结果取决于maybeThenable的决议，故将promise注册为maybeThenable的订阅者
        handleOwnThenable(promise, maybeThenable)
    } else {
        // 获取then方法报错
        if (then === TRY_CATCH_ERROR) {
            reject(promise, TRY_CATCH_ERROR.error)
            TRY_CATCH_ERROR.error = null
        } else if (isFunction(then)) {
            // 具有then函数，但两者不是同一类的实例
            handleForeignThenable(promise, maybeThenable)
        } else {
            // 普通对象，直接fullfill
            fullfil(promise, maybeThenable)
        }
    }
}

// 同一类，xPromise实例
function handleOwnThenable (promise, thenable) {
    if (thenable.state === 'fullfilled') {
        fullfil(promise, thenable.result)
    } else if (thenable.state === 'rejected') {
        reject(promise, thenable.result)
    } else {
        // 订阅thenable的结果，当thenable有结果后再resolve promise
        subscribe(thenable, undefined, (value) => {resolve(promise, value)}, (reason) => { reject(promise, reason) }))
    }
}

// 处理外部promise，拥有then方法，但与当前promise不是同一类
function handleForeignThenable (promise, maybeThenable) {

}

// 获取promise的then方法，如果获取失败，将使用error来reject当前promise
function getThen(promise) {
    try {
        return promise.then
    } catch (e) {
        TRY_CATCH_ERROR.error = e
        return TRY_CATCH_ERROR
    }
}

function isObjectOrFunction (value) {
    const type = typeof value

    return type !== null && (type === 'object' || type === 'function')
}

function fullfil (promise, value) {
    if (promise.state !=== 'pending') return

    promise.state = 'fullfilled'
    promise.result = value

    publish(promise)
}

function reject (promise, reason) {
    if (promise.state !== 'pending') return
    promise.state = 'rejected'
    promise.result = reason

    // 发布
    publish(promise)
}

// 订阅
function subscribe () {

}

function selfFullfillment () {
    return new TypeError('You cannot resolve a promise with itself')
}
