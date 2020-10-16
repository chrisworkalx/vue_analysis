/*
 * @Description: 
 * @Version: 2.0
 * @Autor: yaomingfei
 * @Date: 2020-01-09 16:15:21
 * @LastEditors: chrisworkalx
 * @LastEditTime: 2020-05-15 10:53:26
 */


//依赖收集
class Dep {
    constructor() {
        // 存数所有的依赖 
        this.deps = []
    }
    // 在deps中添加一个监听器对象 
    addDep(dep) {
        this.deps.push(dep);
    }
    depend() {
        Dep.target.addDep(this);
    }
    // 通知所有监听器去更新视图 
    notify() {
        this.deps.forEach((dep) => {
            dep.update();
        })
    }
}



// 监听器 

// new Watcher(vm, exp, function (value) {
//     updaterFn && updaterFn(node, value)
// })
/**
     * 
     * @param {*} vm vue实例
     * @param {*} key  //data: {key:value} 对应的key
     * @param {*} cb  //回调函数
     */
class Watcher {
    constructor(vm, key, cb) {
        // 在new一个监听器对象时将该对象赋值给Dep.target，在get中会用到
        // 将 Dep.target 指向自己 
        // 然后触发属性的 getter 添加监听
        // 最后将 Dep.target 置空 
        this.cb = cb;
        this.vm = vm;
        this.key = key;
        this.value = this.get();
    }
    get() {
        Dep.target = this;
        let value = this.vm[this.key];
        return value;
    }
    // 更新视图的方法 
    update() {
        this.value = this.get()
        this.cb.call(this.vm, this.value)
    }
}



class KVue {
    constructor(options) {
        this.$data = options.data
        this.$options = options
        this.observer(this.$data)
        // 新建一个Watcher观察者对象，这时候Dep.target会指向这个Watcher对象 // 
        // 在这里模拟render的过程，为了触发test属性的get函数 
        console.log('模拟render，触发test的getter', this.$data)
        if (options.created) {
            options.created.call(this)
        }
        this.$compile = new Compile(options.el, this)
    }
    observer(value) {
        if (!value || (typeof value !== 'object')) {
            return
        }
        Object.keys(value).forEach((key) => {
            this.proxyData(key)
            this.defineReactive(value, key, value[key])
        })
    }
    defineReactive(obj, key, val) {
        const dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                // 将Dep.target（即当前的Watcher对象存入Dep的deps中） 
                Dep.target && dep.addDep(Dep.target)
                return val
            },
            set(newVal) {
                if (newVal === val) return;
                val = newVal
                // 在set的时候触发dep的notify来通知所有的Watcher对象更新视图 
                dep.notify()
            }
        })

    }

    //proxyData该方法是将data里的属性绑定到vue实例上  即vm
    proxyData(key) {
        Object.defineProperty(this, key, {
            configurable: false,
            enumerable: true,
            get() {
                return this.$data[key]
            },
            set(newVal) {
                this.$data[key] = newVal
            }
        })
    }
}