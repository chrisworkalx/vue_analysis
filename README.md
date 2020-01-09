<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: yaomingfei
 * @Date: 2020-01-09 11:48:57
 * @LastEditors  : yaomingfei
 * @LastEditTime : 2020-01-09 17:05:50
 -->

###MyVue分析
+ 1. ##### vue工作机制
+ 2. ##### Vue响应式的原理
+ 3. ##### 依赖收集与追踪
+ 4. ##### 编译compile
```
我们在增加了一个 Dep 类的对象，用来收集 Watcher 对象。读数据的时候，会触发 reactiveGetter 函数把当前的
Watcher 对象（存放在 Dep.target 中）收集到 Dep 类中去。
写数据的时候，则会触发 reactiveSetter 方法，通知Dep 类调用 notify 来触发所有 watcher 对象的update 方法更
新对应视图
```
`欢迎交流`[邮箱](857717575@qq.com)
