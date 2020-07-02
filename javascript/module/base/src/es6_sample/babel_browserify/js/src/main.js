// 无法通过模块名导入
// import module1 from "./module1"
// import module2 from "./module2"

// console.log(module1,module2)

// 使用解构赋值的方式来导入
import {foo as foo1, bar as bar1} from "./module1"
// 使用别名解决命名冲突
import {foo as foo2, bar as bar2, obj} from "./module2"
import module3 from "./module3"
import * as module4 from "./module4"

foo1()
bar1()
foo2()
bar2()
console.log(obj)
module3.foo()
module4.fun()
module4.fun2()
