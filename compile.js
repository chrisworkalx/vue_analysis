/*
 * @Description: 
 * @Version: 2.0
 * @Autor: yaomingfei
 * @Date: 2020-01-09 15:34:17
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-10-16 16:32:47
 */
console.log(11111);
class Compile {
    /**
     * 
     * @param {*} el 即将挂载的dom节点
     * @param {*} vm vm是 vue的实例
     */
    constructor(el, vm) {
        this.$vm = vm;
        this.$el = document.querySelector(el);
        if (this.$el) {
            this.$fragment = this.node2Fragment(this.$el); //复制一份开始搬家
            this.compileElement(this.$fragment);
            this.$el.appendChild(this.$fragment);
        }
    }
    node2Fragment(el) {
        // 新建文档碎片 dom接口 
        let fragment = document.createDocumentFragment();
        let child;
        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }
    compileElement(el) {
        let childNodes = el.childNodes;
        Array.from(childNodes).forEach((node) => {
            let text = node.textContent;
            // 表达式文本 // 就是识别{{}}中的数据 
            let reg = /\{\{(.*)\}\}/;
            // 按元素节点方式编译 
            if (this.isElementNode(node)) {
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                // 文本 并且有{{}} 
                this.compileText(node, RegExp.$1);
            }
            // 遍历编译子节点 
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        })
    }

    compile(node) {
        let nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach((attr) => {
            // 规定：指令以 v-xxx 命名 
            // 如 <span v-text="content"></span> 中指令为 v-text 
            let attrName = attr.name
            // v-text 
            let exp = attr.value // content 
            if (this.isDirective(attrName)) {
                let dir = attrName.substring(2); // text 
                // 普通指令 
                this[dir] && this[dir](node, this.$vm, exp)
            }
            if (this.isEventDirective(attrName)) {
                let dir = attrName.substring(1) // 类似@click 这种 dir=“click”
                this.eventHandler(node, this.$vm, exp, dir) //exp值得是@click="eventHandle"中eventHandle这个函数
            }
        })
    }
    /**
     * @description: 
     * @param {node} //dom节点
     * @param {exp} /正则表达式匹配的字段内容
     * @return: 
     * @author: chrisworkalx
     */
    compileText(node, exp) {
        this.text(node, this.$vm, exp);
    }

    //普通指令
    isDirective(attr) {
        return attr.indexOf('k-') == 0;
    }

    //@click = ''类似这种指令
    isEventDirective(dir) {
        return dir.indexOf('@') === 0;
    }

    //判断节点是否为元素
    isElementNode(node) {
        return node.nodeType == 1;
    }
    //判断节点是否为文本
    isTextNode(node) {
        return node.nodeType == 3
    }

    //针对k-text
    text(node, vm, exp) {
        this.update(node, vm, exp, 'text');
    }
    //针对k-html
    html(node, vm, exp) {
        this.update(node, vm, exp, 'html');
    }

    /**
     * @description: 
     * @param {node}  // dom函数
     * @param {vm}  // vue实例
     * @param {exp}  // v-model=“aa” data中绑定的aa
     * @return: 
     * @author: chrisworkalx
     */
    model(node, vm, exp) {
        this.update(node, vm, exp, 'model')
        let val = vm.exp
        node.addEventListener('input', (e) => {
            let newValue = e.target.value
            vm[exp] = newValue
            val = newValue
        })
    }

    /**
     * 
     * @param {*} node 节点
     * @param {*} vm vue实例
     * @param {*} exp  //正则表达式匹配
     * @param {*} dir  //指令名称 k-text k-html等
     */
    update(node, vm, exp, dir) {
        let updaterFn = this[dir + 'Updater']
        updaterFn && updaterFn(node, vm[exp])
        new Watcher(vm, exp, function (value) {
            updaterFn && updaterFn(node, value)
        })
    }


    // 事件处理 
    /**
     * @description: 
     * @param {node} //dom节点
     * @param {vm}  //vm   vue this实例
     * @param {exp} // exp 指的是methods方法中的函数key值
     * @param {dir} // dir指的是@click中的‘click’
     * @return: 
     * @author: chrisworkalx
     */
    eventHandler(node, vm, exp, dir) {
        let fn = vm.$options.methods && vm.$options.methods[exp]
        if (dir && fn) {
            node.addEventListener(dir, fn.bind(vm), false)
        }
    }

    //普通文本进行更改 k-text
    textUpdater(node, value) {
        node.textContent = value
    }

    //k-html
    htmlUpdater(node, value) {
        node.innerHTML = value
    }

    modelUpdater(node, value) {
        node.value = value
    }
}