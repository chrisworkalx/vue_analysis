// 依赖收集小朋友 
class Dep {
	constructor() {
		// 存数所有的依赖 
		this.deps = []
	}
	// 在deps中添加一个监听器对象 
	addDep(dep) {
		this.deps.push(dep)
	}
	// 通知所有监听器去更新视图 
	notify() {
		this.deps.forEach((dep) => { dep.update() })
	}
}


class Watcher {
	constructor() {
		// 在new一个监听器对象时将该对象赋值给Dep.target，在get中会用到 
		Dep.target = this; 
	}
	// 更新视图的方法 
	update() { console.log("视图更新啦～") }
}






class KVue {
	constructor(options) {
		this._data = options.data;
		this.observer(this._data);
		// 新建一个Watcher观察者对象，这时候Dep.target会指向这个Watcher对象 
		new Watcher();
		console.log('模拟render，触发test的getter', this._data.test);
	}

	observer(value) {
		if (!value || typeof value !== "object") {
			return;
		}
		Object.keys(value).forEach(key => {
			this.defineReactive(value, key, value[key]);
		});
	}

	defineReactive(obj, key, val) {
		const _this = this;
		const dep = new Dep()
		Object.defineProperty(obj, key, {
			enumerable: true /* 属性可枚举 */,
			configurable: true /* 属性可被修改或删除 */,
			get() {
				// 将Dep.target（即当前的Watcher对象存入Dep的deps中） 
				dep.addDep(Dep.target)
				return val;
			},
			set(newVal) {
				if (newVal === val) return;
				// _this.cb(newVal);
				dep.notify()
			}
		});
	}
	cb(val) {
		console.log("更新数据了", val);
	}
}

let o = new KVue({
	data: { 
		test: "I am test.",
		name: 'vue'
	}
});
o._data.test = "hello,kaikeba";