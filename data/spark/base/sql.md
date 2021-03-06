<span id="catalog"></span>

<span style='font-size:18px'>目录---sparkSQL</span>

- [sparkSQL特点](#sparkSQL特点)
- [上下文对象的划分](#上下文对象的划分)
- [抽象编程模型](#抽象编程模型)
    - [RDD、DataFrame、DataSet的关系](#RDD、DataFrame、DataSet的关系)
    - [DataFrame、DataSet的关系](#DataFrame、DataSet的关系)
    - [DataFrame](#DataFrame)
    - [RDD转换为DataFrame](#RDD转换为DataFrame)
    - [DataFrame转换为RDD](#DataFrame转换为RDD)
    - [DataSet](#DataSet)
    - [RDD转换为DataSet](#RDD转换为DataSet)
    - [DataSet转换为RDD](#DataSet转换为RDD)
    - [DataFrame转DataSet](#DataFrame转DataSet)
    - [DataSet转DataFrame](#DataSet转DataFrame)
    - [RDD、DataFrame、DataSet之间的转换](#RDD、DataFrame、DataSet之间的转换)
- [SparkSQL语法](#SparkSQL语法)
    - [sql基础](#sql基础)
    - [dsl语法](#dsl语法)
- [SparkSql开发](#SparkSql开发)
    - [创建上下文对象](#创建上下文对象)
    - [maven配置](#maven配置)
    - [开发基础--模型间转换](#开发基础--模型间转换)
    - [UDF--自定义sql函数](#UDF--自定义sql函数)
    - [UDAF--自定义sql聚合函数](#UDAF--自定义sql聚合函数)
        - [弱类型的自定义聚合函数](#弱类型的自定义聚合函数)
        - [强类型的自定义聚合函数](#强类型的自定义聚合函数)
    - [数据读写](#数据读写)
        - [加载数据](#加载数据)
        - [直接读取数据并执行sql](#直接读取数据并执行sql)
        - [保存数据](#保存数据)
    - [连接mysql](#连接mysql)
    - [连接hive](#连接hive)
- [练习--各区域热门商品Top3](#练习--各区域热门商品Top3)
    - [需求分析](#需求分析)
    - [UDF实现](#UDF实现)
    - [UDAF实现](#UDAF实现)
- [](#)

val df = spark.read.json()
df.show 显示二维表结构
`df.createTempView("user")` 创建临时表
  - 不能重名
spark.sql().show

# sparkSQL特点
[top](#catalog)
- sparkSQL的数据兼容性，兼容
    - Hive
    - RDD
    - parquet文件
    - json文件
- 兼容Hive
    - 在仓库上可以直接运行SQL或者HiveQL
- 支持JDBC、ODBC

# 上下文对象的划分
[top](#catalog)
- spark core 中的核心对象：上下文环境对象，`SparkContext`
- spark sql 可以看作 spark core 的封装，模型、上下文对象的封装
- sparkSQL老版本的上下文
    - `SQLContext`，用于spark自己提供的sql查询
    - `HiveContext`，用于连接Hive查询
- sparkSQL新的上下文: `SparkSession`
    - 本质上是: `SQLContext` 和 `HiveContext` 的组合
        - `SparkSession` 上可以使用与 `SQLContext` 和 `HiveContext` 相同的API
    - `SparkSession` 内部封装了 `SparkContext`
    - 实际计算时，是由 `SparkContext` 负责的
- 在控制台中
    - `sc` 表示 `SparkContext` 的实例对象
    - `spark` 表示 `SparkSession` 的实例对象

# 抽象编程模型
## RDD、DataFrame、DataSet的关系
[top](#catalog)
- 三种数据结构之间的关系
    - RDD + 结构信息 = DF
    - DF + 类型信息 = DS
    - 新模型: DataSet
    - 旧模型: DataFrame
    - 基础模型: RDD

- RDD、DataFrame、DataSet 的相同点
    - 都是 spark 下的 `分布式弹性数据集`，便于处理超大型数据
    - 惰性机制
        - 创建、转换时不会计算
        - 调用行动算子时才开始计算
    - 存在一些一样的算子
    - 都会根据 spark 的内存情况自动缓存运算，可以避免内存溢出
    - 都有 分区 partition 的概念

- RDD、DataFrame、DataSet 的区别
    - 各模型的关注点
        - `Dataset` 更关心类型
        - `DataFrame` 更关心结构
        - `RDD` 只关心数据内容
    - RDD 一般和 spark mlib 一起使用；DS、DF一般单独使用

## DataFrame、DataSet的关系
[top](#catalog)
- sparkSQL 的 2个抽象编程模型，类似 Spark Core 的RDD
    - 新模型: DataSet
    - 旧模型: DataFrame

- DataFrame
    - sparkSQL内旧的结构
    - DF 是一种以 RDD 为基础的分布式数据集
    - 类似于数据库的二维表
    - DF 与 RDD 的主要区别
        - DF 带有 schema元信息
        - 即DF数据集的每一列都带有名称和类型
- DataSet
    - DS 是 spark 1.6 之后添加的新抽象
    - DS 是 DF 的扩展，具有**强类型**
    - 用样例类定义数据的结构信息

- `DF = DS[Row]`，**DF 是 DS 的一种特殊情况**


## DataFrame
[top](#catalog)
- 创建 DF 的三种方式
    1. 读取文件: 从spark支持的数据源创建
    2. 从 RDD 创建
    3. 从 Hive Table 创建
- **读取文件**: 从spark支持的数据源创建
    - `val df = spark.read.类型(文件路径)`
    - 示例
        ```sh
        val df = spark.read.json("file:///opt/module/spark-3.0.1-bin-without-hadoop/examples/src/main/resources/people.json")

        # 结构化信息
        org.apache.spark.sql.DataFrame = [age: bigint, name: string]
        ```

- DataFrame中的数字类型
    - 如果从内存中获取数据，spark 可以知道数据类型具体是什么
        - 如果是数字，默认作为 `Int` 处理
    - 从文件中读取的数字，用 `bigint` 接收
        - 不能确定是什么类型，所以用 `bigint` 接收
        - 可以和 `Long` 类型转换，但是和 `Int` 不能进行转换

## RDD转换为DataFrame
[top](#catalog)
- 从 RDD 转换到 DF
    ```scala
    val rdd = sc.makeRDD(List(1,2,3,4))
    //增加结构
    val df2 = rdd.toDF("id")
    ```
- tuple数组转 DF，需要手动设置 tuple中每个元素的**列名**
    ```scala
    val rdd = sc.makeRDD(List((1,"aaa",40),(2,"bbb",50),(3,"ccc",60)))
    val df2 = rdd.toDF("id","name","age")
    ```
- 用样例类设置结构
    - 列名的设置
        - 如果不设置，则默认使用样例类的属性名作为列名
        - 如果设置
            - 列名数量一致时，自动替换列名
            - 列名数量不一致时，抛出异常
    - 示例
        ```scala
        val rdd = sc.makeRDD(List((1,"aaa",40),(2,"bbb",50),(3,"ccc",60)))
        case class User(id:Int, name:String, age:Int)
        val userRDD = rdd.map(t=>User(t._1, t._2, t._3))
        val df = userRDD.toDF
        // 列名数量一致时，自动替换列名
        val df = userRDD.toDF("id1","name1","age1")
        // 列名数量不一致时，异常
        ```
- **实际开发中一般通过 样例类 将 RDD 转换为 DataFrame**

## DataFrame转换为RDD
[top](#catalog)
- DataFrame其实就是对RDD的封装，所以可以直接获取内部的RDD
- 转换方法: `val rdd = df.rdd`
- 转换后没有结构了，所以转换成了 `org.apache.spark.sql.Row`
    ```
    scala> df.rdd
    res29: org.apache.spark.rdd.RDD[org.apache.spark.sql.Row] = MapPartitionsRDD[72] at rdd at <console>:26
    ```

## DataSet
[top](#catalog)
- DataSet是具有**强类型**的数据集合，需要提供对应的类型信息
    - DataFrame 只知道列名，不知道列的类型，用的时候不方便
- 创建 DS
    - 使用 `样例类 + 序列` 创建 DataSet
        ```scala
        case class Person(name:String, age:Long)
        val ds = List(Person("aaa",22)).toDS
        ```
    - 使用基本类型序列创建 DataSet，默认列名为 `value`
        ```scala
        val lds = Seq(1,2,3,4,5).toDS
        lds.show
        ```

## RDD转换为DataSet
[top](#catalog)
- 包含 case 类的RDD可以自动转换为DataSet
- case类属性通过反射变为表的列名
- 转换方法: `rdd.toDS`
    ```scala
    val rdd = sc.makeRDD(List((1,"aaa",40),(2,"bbb",50),(3,"ccc",60)))
    case class User(id:Int, name:String, age:Int)
    val userRDD = rdd.map(t=>User(t._1, t._2, t._3))
    val ds = userRDD.toDS
    ```

## DataSet转换为RDD
[top](#catalog)
- `df.rdd`
    ```scala
    scala> ds.rdd
    res36: org.apache.spark.rdd.RDD[User] = MapPartitionsRDD[80] at rdd at <console>:26
    ```
- 如果样例类的**属性数量 < RDDd的列数**
    - `ds.show` 仍然可以显示所有列的数据
    - `ds.rdd` 返回的结果中，只有该类所包含的属性
        - 不会包含未声明的列的数据
    - 示例
        ```scala
        // 创建 DF，并指定列名
        val rdd = sc.makeRDD(List((1,"aaa",40),(2,"bbb",50),(3,"ccc",60)))
        val df = rdd.toDF("id", "name", "age")

        // 创建 样例类，并用样例类将 DF 转换为 DS
        case class User(id:Int, name:String, age:Int)
        val ds = df.as[User]

        case class People(id:Int, name:String)
        val ds = df.as[People]
        val rdd = ds.rdd    // 返回的结果中只有 id、name 两个属性

        scala> rdd.foreach(println)
        People(1,aaa)
        People(3,ccc)
        People(2,bbb)
        ```

## DataFrame转DataSet
[top](#catalog)
- 转换方法: `val ds = df.as[样例类]`
- **样例类的属性和df中的列名需要相同**
    ```scala
    // 创建 DF，并指定列名
    val rdd = sc.makeRDD(List((1,"aaa",40),(2,"bbb",50),(3,"ccc",60)))
    val df = rdd.toDF("id", "name", "age")

    // 创建 样例类，并用样例类将 DF 转换为 DS
    case class User(id:Int, name:String, age:Int)
    val ds = df.as[User]
    ```

## DataSet转DataFrame
[top](#catalog)
- `ds.toDF`

## RDD、DataFrame、DataSet之间的转换
[top](#catalog)
- 转换方法

    |转换方向               |方法|
    |----------------------:|-|
    |RDD --> DataFrame      |`rdd.toDF(列名)`|
    |DataFrame --> RDD      |`df.rdd`|
    |RDD --> DataSet        |`rdd[样例类].toDS`|
    |DataSet --> RDD        |`df.rdd`|
    |DataFrame --> DataSet  |`df.as[样例类]`|
    |DataSet --> DataFrame  |`ds.toDF`|

- [图](?????)

# SparkSQL语法
## sql基础
[top](#catalog)
- 执行sql的前提
    - 在Spark SQL中SparkSession是创建DataFrame和执行SQL的入口
    - 执行sql之前必须要有 视图
- 创建临时视图
    - 创建视图的方法
        ```scala
        // 创建 DF
        val df = spark.read.json("file:///opt/module/spark-3.0.1-bin-without-hadoop/examples/src/main/resources/people.json")

        // 在当前 session 中创建临时视图
        df.createTempView("user")
        // 如果视图已存在，则覆盖
        df.createOrReplaceTempView("user")
        ```
    - 如果数据源被修改了，想要同步数据，则需要**重新创建读取数据并创建表**
    - 执行sql: `spark.sql("select * from user")`
        - <span style='color:red'>执行的结果仍然是 DataFrame</span>

- 创建全局视图
    - `df.createGlobalTempView("people")`
    - 全局表在所有 session 中都可以使用
    - 访问时，表名需要改为: `global_temp.表名`

- 使用顺序
    1. 准备: `数据源`
    2. `read.xxx(数据源路径)`
    3. `DataFrame`
    4. `df.createXXX`
    5. 操纵/view
        - 有了 view 就可以通过spark在会话中使用

## dsl语法
[top](#catalog)
- DSL，domain-specific language
- DF 提供 DSL 来管理结构化的数据，使用 DSL 操作数据可以**不用创建临时视图**
- `df.printSchema`，显示表的列
- `df.select("列名1","列名2",...).show`，只显示某列，或多列数据
- 列运算
    - 涉及到运算的时候, 每列都必须使用`$field`, 或者采用引号表达式：`'field`
    - df.select($"name",$"age" + 1).show
    - df.select('name, 'age + 1).show()
    - df.select('name, 'age + 1 as "newage").show()
- 过滤 df.filter
    - `df.filter($"age">30).show`
- 分组后，聚合
    - `df.groupBy("age").count.show`
    - groupBy 的结果没有show方法


# SparkSql开发
## 创建上下文对象
[top](#catalog)
- 参考
    - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/SQLTest01.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/SQLTest01.scala)

- 创建方法
    ```scala
    // 创建环境对象
    val conf: SparkConf = new SparkConf().setMaster("local[*]").setAppName("sqltest")
    val spark = SparkSession.builder().config(conf).getOrCreate()
    // 导入隐式转换，spark表示环境对象的名称
    // 要求 spark 必须用 val 声明
    import spark.implicits._

    // 添加隐式转换后，就可以在dsl语法中使用 $、' 符号了
    ```

## maven配置
[top](#catalog)
- 参考
    - [src/spark-learn/spark-sql/pom.xml](src/spark-learn/spark-sql/pom.xml)
- 配置内容
    ```xml
    <dependency>
        <groupId>org.apache.spark</groupId>
        <artifactId>spark-core_2.12</artifactId>
        <version>...</version>
    </dependency>
    <dependency>
        <groupId>org.apache.spark</groupId>
        <artifactId>spark-sql_2.12</artifactId>
        <version>...</version>
    </dependency>
    ```

## 开发基础--模型间转换
[top](#catalog)
- 参考
    - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/SQLTest01.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/SQLTest01.scala)
- 代码内容
    ```scala
    def main(args: Array[String]): Unit = {
      // 创建环境对象
      val conf: SparkConf = new SparkConf().setMaster("local[*]").setAppName("sqltest")
      val spark = SparkSession.builder().config(conf).getOrCreate()
      // 导入隐式转换，spark表示环境对象的名称
      // 要求 spark 必须用 val 声明
      import spark.implicits._

      // 创建 df 和 table
      val df = spark.read.json("./input/sql/user.json")
      df.createOrReplaceTempView("user")

      // sql 访问数据
      spark.sql("select * from user").show

      // df 访问数据
      // 如果列名查询用单引号，需要做隐式转换
      df.select('name, 'age + 1).show

      // RDD --> DF
      val rdd = spark.sparkContext.makeRDD(List(
        (1, "aaa", 22),
        (2, "bbb", 33),
        (3, "ddd", 55)
      ))

      val df2: DataFrame = rdd.toDF("id", "name", "age")
      df2.show

      // DF --> RDD
      val rddRows: RDD[Row] = df2.rdd
      rddRows.foreach(row=>{
        println(s"id=${row(0)}")
      })

      // RDD --> DataSet
      val userRDD: RDD[User] = rdd.map(d=>User(d._1, d._2, d._3))
      val userDS: Dataset[User] = userRDD.toDS
      userDS.show()

      // DataSet --> RDD
      val dsToRDD: RDD[User] = userDS.rdd
      dsToRDD.foreach(println)

      // DataFrame --> DataSet
      val dfToDS: Dataset[User] = df2.as[User]
      dfToDS.show

      // DataSet --> DataFrame
      val dsToDF: DataFrame = dfToDS.toDF
      dsToDF.show

      // 关闭资源
      spark.stop()
    }
    ```

## UDF--自定义sql函数
[top](#catalog)
- 注册自定义函数
    ```scala
    spark.udf.register("函数名", 匿名函数)
    ```

- 示例
    - 参考
        - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/UDFTest.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/UDFTest.scala)
    - 代码内容
        ```scala
        // 1. 创建RDD
        val rdd: RDD[(Int, String, Int)] = spark.sparkContext.makeRDD(List(
          (1, "aaa", 22),
          (2, "bbb", 33),
          (3, "ddd", 55)
        ))
        // 2. 将 RDD 转换为 DF
        val df: DataFrame = rdd.toDF("id", "name", "age")
        // 3. 创建临时表
        df.createOrReplaceTempView("user")
        // 3. 注册sql函数
        spark.udf.register("addName", (x: String) => "Name:" + x)
        spark.udf.register("addAge", (x: Int) => x + 1)

        // 4. 在sql中使用自定义函数
        spark.sql("""select id, addName(name), addAge(age) from user""")
          .show
        ```

## UDAF--自定义sql聚合函数
### 弱类型的自定义聚合函数
[top](#catalog)
- 参考
    - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/UDAFTest.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/UDAFTest.scala)

- 计算平均年龄
    ```scala
    // 年龄使用 Long 类型，防止计算时溢出
    val rdd: RDD[(Int, String, Long)] = spark.sparkContext.makeRDD(List(
      (1, "aaa", 20L),
      (2, "bbb", 30L),
      (3, "ddd", 50L)
    ))
    val df: DataFrame = rdd.toDF("id", "name", "age")
    df.createOrReplaceTempView("user")
    // 3. 创建 UDAFClassTest 函数
    val udaf = new MyAvgAgeUDAF
    // 4. 注册到sparkSQL
    spark.udf.register("avgage", udaf)

    // 5. 在sql中使用
    spark.sql("select avgage(age) from user")
        .show
    ```

- 自定义聚合函数
    ```scala
    // 自定义聚合函数
    // 1. 继承 UserDefinedAggregateFunction
    // 2. 重写方法
    // 计算逻辑中，需要有: total count
    class MyAvgAgeUDAF extends UserDefinedAggregateFunction {
      // -------------------- 1. 数据结构部分 --------------------
      // 输入数据的【数据结构信息】: 年龄信息
      override def inputSchema: StructType = {
        // 数据结构: case class StructType(fields: Array[StructField])
        // 需要在 StructField 中标识列名
        // 使用sql时，只能有这些标识过的列
        // 如只标识了 age，则只能使用 select age from ...
        // 不能使用 select name, age from...，spark无法识别 name
        StructType(Array(StructField("age", LongType)))
      }

      // 聚合计算的中间结果
      // 缓冲区的【数据结构信息】: 年龄总和，总人数
      override def bufferSchema: StructType = {
        StructType(Array(
          StructField("totalAge", LongType),
          StructField("count", LongType),
        ))
      }

      // 聚合函数计算结果的【数据结构信息】
      // 聚合函数的结果就是一条数据
      override def dataType: DataType = DoubleType

      // -------------------- 2. 函数的稳定性 --------------------
      // 函数的稳定性
      // 即相同的数据计算结果是否相同。如果数据中有随机数需要考虑设为 false
      override def deterministic: Boolean = true

      // -------------------- 3. 计算过程部分 --------------------

      // 函数的初始化
      // 初始化缓冲区字段: bufferSchema
      // abstract class MutableAggregationBuffer() extends Row
      // MutableAggregationBuffer 本身是一个 Row，相当于在计算时，添加了一个【辅助行】
      override def initialize(buffer: MutableAggregationBuffer): Unit = {
        buffer(0) = 0L  // totalAge = 0
        buffer(1) = 0L  // count = 0
      }

      // 更新缓冲区，即：编写聚合操作的求和处理
      // 参数
      //  - buffer，缓冲区
      //  - input，一行数据
      override def update(buffer: MutableAggregationBuffer, input: Row): Unit = {
        // getLong(0) 表示获取第 0 个Long型数据
        buffer(0) = buffer.getLong(0) + input.getLong(0)
        buffer(1) = buffer.getLong(1) + 1
      }

      // 合并各个 executor 上的数据
      override def merge(buffer1: MutableAggregationBuffer, buffer2: Row): Unit = {
        buffer1(0) = buffer1.getLong(0) + buffer2.getLong(0)
        buffer1(1) = buffer1.getLong(1) + buffer2.getLong(1)
      }

      // 计算聚合操作的结果
      override def evaluate(buffer: Row): Any = {
        buffer.getLong(0).toDouble / buffer.getLong(1)
      }
    }
    ```
- **自定义聚合函数的缺点**
    - sql中只能使用 `StructType(Array(StructField("age", LongType)))` 中声明的字段，其他字段无法使用

- 弱数据结构源码
    - `StructField` 源码
        ```scala
        case class StructField(
            name: String,               // 用于聚合计算的字段名
            dataType: DataType,         // 字段的类型
            nullable: Boolean = true,   // 是否可以为空
            metadata: Metadata = Metadata.empty) {  // 元数据 ?????
        ```
    - `StructType`
        ```scala
        @InterfaceStability.Stable
        case class StructType(fields: Array[StructField]) extends DataType with Seq[StructField] {

          /** No-arg constructor for kryo. */
          def this() = this(Array.empty[StructField])

          /** Returns all field names in an array. */
          def fieldNames: Array[String] = fields.map(_.name)

          /**
           * Returns all field names in an array. This is an alias of `fieldNames`.
           *
           * @since 2.4.0
           */
          def names: Array[String] = fieldNames
        ```

### 强类型的自定义聚合函数
[top](#catalog)
- 参考
    - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/UDAFClassTest.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/demo/UDAFClassTest.scala)
- 计算平均年龄
    ```scala
    // 1. 年龄使用 Long 类型，防止计算时溢出
    val rdd: RDD[(Int, String, Long)] = spark.sparkContext.makeRDD(List(
      (1, "aaa", 20L),
      (2, "bbb", 30L),
      (3, "ddd", 50L)
    ))
    // 2. 将rdd 转换为 df
    val df: DataFrame = rdd.toDF("id", "name", "age")
    // 3. 将 df 转换为 ds
    val ds: Dataset[User] = df.as[User]
    ds.createOrReplaceTempView("user")
    // 4. 创建 UDAFClassTest 对象
    val udaf = new MyAvgAgeUDAFClass

    // X. 注册到sparkSQL
    // spark.udf.register("avgage", udaf)

    // Aggregator是强类型，但是sql中没有类型的概念，所以无法注册

    // 5. 使用 dsl 语法方法进行访问
    // 将聚合函数转换为查询的列，让DataSet访问
    ds.select(udaf.toColumn).show()
    ```
- 自定义聚合函数
    ```scala
    // 定义数据结构
    // 表数据的数据结构
    case class User(id: Int, name: String, age: Long)
    // 聚合函数中间结果的数据结构
    case class AvgBuffer(var total:Long, var count:Long)

    // 强类型--自定义聚合函数
    // Aggregator[-IN, BUF,  OUT]
    //           输入   缓冲区 输出
    class MyAvgAgeUDAFClass extends Aggregator[User, AvgBuffer, Double] {
      // 设置缓存区的初始值，相当于 UserDefinedAggregateFunction 的 initialize
      override def zero: AvgBuffer = {
        AvgBuffer(0L,0L)
      }

      // 聚合数据，相当于 UserDefinedAggregateFunction 的 update
      override def reduce(b: AvgBuffer, a: User): AvgBuffer = {
        b.total += a.age
        b.count += 1
        b
      }

      // 合并各个 executor 上的数据，相当于 UserDefinedAggregateFunction 的 merge
      override def merge(b1: AvgBuffer, b2: AvgBuffer): AvgBuffer = {
        b1.total += b2.total
        b1.count += b2.count
        b1
      }

      // 计算聚合操作的结果，相当于 UserDefinedAggregateFunction 的 finish
      override def finish(reduction: AvgBuffer): Double = {
        reduction.total.toDouble / reduction.count
      }

      // 设置缓冲区的编码
      override def bufferEncoder: Encoder[AvgBuffer] = Encoders.product

      // 输出的编码
      override def outputEncoder: Encoder[Double] = Encoders.scalaDouble
    }
    ```
- 强类型与弱类型聚合函数的区别
    - 强类型的实现中，不需要定义中间结果的结构，需要提前通过样例类来定义
    - 强类型表现在 输入数据、中间结果需要有明确的类型
    - 因为 sql 没有类型，所以 强类型聚合函数只能通过 DSL 语法来使用
    - 强类型需要手动指定 缓冲区 和 输出结果的编码

## 数据读写
### 加载数据
[top](#catalog)
- 通用api: `spark.read.load()`
    - 默认读取格式: `parquet`
    - 可以通过配置项 `spark.sql.sources.default`，修改默认数据源格式
- 读取其他格式，需要转换
    - 读取 json 格式: `spark.read.format("json").load("xxx.json")`
- 读取其他格式的简便写法
    - `spark.read.xxx()`

- spark 对json文件的特殊要求
    - spark 读取JSON文件时，要求文件的每一行符合JSON的格式, 如
        ```json
        {"name":"Michael", "age":"20"}
        {"name":"Andy", "age":30}
        {"name":"Justin", "age":19}
        ```
    - 这<span style='color:red'>不完全符合json的格式</span>，只是符合spark的标准
    - 即: **每一行都必须是一个json字符串**
- 示例
    - 参考
        - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/loadsave/LoadTest.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/loadsave/LoadTest.scala)
    - 代码内容
        ```scala
        // 1. sparkSQL 通用的读取和保存
        val df: DataFrame = spark.read.load("./input/sql/user.parquet")
        df.show

        // 2. 无法直接读取 json 格式
        // user.json is not a Parquet file
        // val df: DataFrame = spark.read.load("./input/sql/user.json")

        // 3. 读取 json 格式文件:通用版本
        // spark 读取JSON文件时，要求文件的每一行符合JSON的格式, 如
        // {"name":"Michael", "age":"20"}
        // {"name":"Andy", "age":30}
        // {"name":"Justin", "age":19}
        val df2: DataFrame = spark.read.format("json").load("./input/sql/user.json")
        df2.show

        // 4. 读取 json 数据: 简化版本
        val df3: DataFrame = spark.read.json("./input/sql/user.json")
        df3.show
        ```

### 直接读取数据并执行sql
[top](#catalog)
- 读取默认的 `parquet`
    ```scala
    spark.sql("select * from `文件路径`").show
    ```
- 读取 `json` 格式数据
    ```scala
    spark.sql("select * from json.`文件路径`").show
    ```

- 示例
    - 参考
        - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/loadsave/ReadInSql.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/loadsave/ReadInSql.scala)
    - 代码内容
        ```scala
        spark.sql("select * from json.`./input/sql/user.json`").show()
        ```

### 保存数据
[top](#catalog)
- 通用 api: `df.write.save("...")`
    - 默认保存为 `parquet` 格式
- 保存为其他格式，需要转换
    - 保存为json格式: `df.write.format("json").save(...)`
- 写模式
    - 默认的文件**写模式**为: `append`，只能添加新文件
    - 可以修改为 `overwrite`，覆盖文件写
    - 修改写模式的方法: `df.write.mode("overwrite").format("json").save(...)`
- 示例
    - 参考
        - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/loadsave/WriteTest.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/loadsave/WriteTest.scala)
    - 代码内容
        ```scala
        val df: DataFrame = spark.read.json("input/sql/user.json")

        // 默认保存为 parquet 格式
        df.write.save("./output/sql/user01")

        // 保存为指定格式
        df.write.format("json").save("./output/sql/user02")

        // 默认使用 append 模式写无法覆盖，overwrite 可以覆盖文件写
        df.write.mode("overwrite").format("json").save("./output/sql/user02")
        ```

## 连接mysql
[top](#catalog)
docker run -d -p=3305:3306 --name sparkmysql -e MYSQL_ROOT_PASSWORD=1234 --network=hdcluster_hdxnet --ip=172.23.101.201 mysql

create database sparkdb;
create table myuser(id int,  name varchar(20), address varchar(30));

insert into myuser values
(1, 'aaa', 'aaaaaaaaa'),
(2, 'bbb', 'bbbbbbbbb'),
(3, 'ccc', 'ccccccccc'),
(4, 'ddd', 'ddddddddd'),
(5, 'eee', 'eeeeeeeee')
- 三种连接mysql的方式
- 写入数据

## 连接hive
[top](#catalog)
- 如果spark 部署了 hive，可以使用 Hive 表访问、UDF (用户自定义函数)以及 Hive 查询语言
- 如果没有部署好，默认会在当前目录下创建 spark 自己的元数据仓库
- spark-shell 默认支持hive，代码中默认不支持，需要手动指定
- 部署外置 hive 的流程
    1. 将 `hive-site.xml` 复制到 `$SPARK_HOME/conf` 下
    2. 将 `mysql-connector` 的 jar 包放在 `$SPARK_HOME/jar` 下

- 在代码中操作 hive
    - 必须在 jdk8 下操作，更高的版本可能无法启动
    - 需要添加 hive 的 maven 配置
        ```xml
        <!--  hive连接  -->
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-hive_2.12</artifactId>
            <version>2.4.5</version>
            <!--<scope>provided</scope>-->
        </dependency>
        <dependency>
            <groupId>org.apache.hive</groupId>
            <artifactId>hive-exec</artifactId>
            <version>3.1.2</version>
        </dependency>
        ```
    - 将 `hive-site.xml` 添加到 resources 目录下
        - 参考: [src/spark-learn/spark-sql/src/main/resources/hive-site.xml](src/spark-learn/spark-sql/src/main/resources/hive-site.xml)
    - 代码操作
        - 参考: [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/loadsave/hive/OutlayHive.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/loadsave/hive/OutlayHive.scala)
        - 代码内容
            ```scala
            def main(args: Array[String]): Unit = {
              val conf = new SparkConf().setMaster("local[*]").setAppName("sqltest")
              val spark = SparkSession.builder()
                .enableHiveSupport()    // 必须开启 Hive 的支持
                .config(conf)
                .getOrCreate()
              import spark.implicits._

              spark.sql("show tables").show()

              spark.sql("select * from testtb limit 2").show()

              spark.stop()
            }
            ```

# 练习--各区域热门商品Top3
## 需求分析
[top](#catalog)
- 需求：
    1. 按照: 地区、商品名称 的顺序分组，并统计点击次数
    2. 只保留每个**地区**点击量前 3 的数据
    3. 需要在**城市备注**中显示该地区、该商品在该地区内的**不同城市**中点击量的百分比
        - 只显示百分比最高的前两名，如果城市多于2个，表示为: **其他**
    4. 结果示例

        |地区|商品名称|点击次数|城市备注|
        |-|-|-|-|
        |华北|商品A|100000|北京21.2%，天津13.2%，其他65.6%|
        |华北|商品P|80200|北京63.0%，太原10%，其他27.0%|
        |华北|商品M|40000|北京63.0%，太原10%，其他27.0%|
        |东北|商品J|92000|大连28%，辽宁17.0%，其他 55.0%|

- 创建表
    - ????

## UDF实现
[top](#catalog)
- 实现方式
    1. `user_visit_action` 与 `city_info` 表连接，得到每个城市所在的**地区**
    2. `user_visit_action` 与 `Product_info` 表连接得到产品名称
    3. 按照地区名: area、商品名: product_name 分组，统计出每个商品在: **每个地区**的**总点击量**
        - 分组时，通过 `collect_list(c.city_name)` 收集分组内的所有城市名
    4. 通过开窗函数，在**每个地区内**，**按照点击量降序排列**
    5. 只取每个地区内的**前三名**
    6. 自定义 UDF 函数计算城市备注

- 实现内容
    - 参考
        - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/inaction/GetDataByUDFAndTempView02.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/inaction/GetDataByUDFAndTempView02.scala)
    - 代码内容
        1. 过滤并统计数据。直接将城市名、商品名取出
            ```scala
            spark.sql(
              """
                |select
                |    c.area,
                |    p.product_name,
                |    count(c.city_name) as click_count,
                |    collect_list(c.city_name) as cities
                |from user_visit_action as a
                |    join city_info as c
                |    on c.city_id = a.city_id
                |    join product_info as p
                |    on p.product_id = a.click_product_id
                |where a.click_product_id <> -1
                |group by c.area, p.product_name
                |""".stripMargin).createOrReplaceTempView("t1")
            ```
        2. 在每个地区分组内，按照点击量降序排序，并添加序号
            ```scala
            spark.sql(
              """
                |select
                |    t1.area,
                |    t1.product_name,
                |    t1.click_count,
                |    t1.cities,
                |    row_number() over(partition by t1.area order by t1.        click_count desc) as rk
                |from t1
                |""".stripMargin).createOrReplaceTempView("t2")
            ```
        3. 保留前每个地区的前 3 名
            ```scala
            spark.sql(
              """
                |select
                |    t2.area,
                |    t2.product_name,
                |    t2.click_count,
                |    t2.cities
                |from t2
                |where t2.rk <= 3
                |""".stripMargin).createOrReplaceTempView("t3")
            ```
        4. 注册 UDF 函数，来处理 `cities` 中的城市数据
            ```scala
            // 1. 注册 UDF 函数 cities_details，接受一个序列的数据，返回一个字符串
            spark.udf.register("cities_details", (arr: Seq[String]) => {
              // 2. 遍历整个序列的数据，并统计各个城市的出现次数，结果保存到 Map 中
              val map = mutable.Map[String, Int]()
              arr.foreach(e => {
                map(e) = map.getOrElse(e, 0) + 1
              })
              // 3. 用 Map 中的 value 做降序排序
              val groupByResult: List[(String, Int)] = map.toList.sortWith((left,right)=>left._2 > right._2)
              // 4. 取排序结果的【前两名】
              val List(top1,  top2) = groupByResult.take(2)
              // 5. 计算这两个城市的百分比
              val top1Percent = top1._2.toDouble / arr.size
              val top2Percent = top2._2.toDouble / arr.size

              // 6. 拼接结果字符串
              val result = new mutable.StringBuilder()
              result.append(f"${top1._1}:${(top1Percent * 100).formatted("%.2f")}%%, ${top2._1}:${(top2Percent * 100).formatted("%.2f")}%%")

              // 7. 如果大于两个城市，则计算【其他】
              if (groupByResult.size > 2) {
                result.append( f"$result, 其他:${((1 - top1Percent - top2Percent) * 100).formatted("%.2f")}%%")
              }

              // 8. 返回结果字符串
              result.toString()
            })
            ```
        5. 计算城市备注
            ```scala
            spark.sql(
              """
                |select
                |    t3.area, -- 地区
                |    t3.product_name,-- 商品名称
                |    t3.click_count,-- 点击次数
                |    cities_details(t3.cities)
                |from t3
                |""".stripMargin).show
            ```

## UDAF实现
[top](#catalog)
- 实现方式
    1. `user_visit_action` 与 `city_info` 表连接，得到每个城市所在的**地区**
    2. `user_visit_action` 与 `Product_info` 表连接得到产品名称
    3. 按照地区名: area、商品名: product_name 分组，统计出每个商品在: **每个地区**的**总点击量**
    4. 在 3 中分组的同时，用 UDAF 函数计算 **城市备注**
    5. 通过开窗函数，在**每个地区内**，**按照点击量降序排列**
    6. 只取每个地区内的**前三名**
- 实现内容
    - 参考
        - [src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/inaction/GetDataByUDAFAndTempView.scala](src/spark-learn/spark-sql/src/main/scala/com/ljs/learn/sparksql/inaction/GetDataByUDAFAndTempView.scala)
    - UDAF 的实现分析
        - 输入数据
            - 数据内容: 城市名称
            - 数据类型: String
        - 在**每个分组内**，用于计算的数据结构
            - `( 区域、商品点击的总和, Map(城市名称, count(出现的次数)) )`
            - 对出现次数求和就是求城市的点击量
        - 如何计算结果
            - `各城市点击量 / 区域、商品点击的总和`
        - 代码内容
            ```scala
            // 在UDAF中聚合，并计算结果
            class CityUDAF extends UserDefinedAggregateFunction {
              // 1. 输入数据的结构
              override def inputSchema: StructType = StructType(Array(StructField("city", StringType)))

              // 2. 中间结果的结构 (行数, Map(city, count))
              override def bufferSchema: StructType = StructType(Array(
                StructField("total", LongType),
                StructField("cityMap", MapType(StringType, LongType))
              ))

              // 3. 结果数据类型
              override def dataType: DataType = StringType

              // 4. 稳定型计算
              override def deterministic: Boolean = true

              // 5. 初始化 中间结果
              override def initialize(buffer: MutableAggregationBuffer): Unit = {
                buffer(0) = 0L
                buffer(1) = Map[String, Long]() // 创建不可变 Map，每次更新时，生成新的 Map 对象
              }

              // 5.1 每个分区的分组内聚合
              override def update(buffer: MutableAggregationBuffer, input: Row): Unit = {
                // 每个分组内，数量自动加1
                buffer(0) = buffer.getLong(0) + 1L
                // 获取 city
                val city: String = input.getString(0)
                // 合并数据
                val cityMap: Map[String, Long] = buffer.getAs[Map[String, Long]](1)
                buffer(1) = cityMap.updated(city, cityMap.getOrElse(city, 0L) + 1L)
              }

              // 6. 分区间的分组内聚合
              override def merge(buffer1: MutableAggregationBuffer, buffer2: Row): Unit = {
                buffer1(0) = buffer1.getLong(0) + buffer2.getLong(0)
                val cityMap1: Map[String, Long] = buffer1.getAs[Map[String, Long]](1)
                val cityMap2: Map[String, Long] = buffer2.getAs[Map[String, Long]](1)
                println(cityMap1)
                println(cityMap2)

                buffer1(1) = cityMap1.foldLeft(cityMap2) {
                  case (map, (k, v)) => map.updated(k, map.getOrElse(k, 0L) + v)
                }
              }

              // 7. 求最终结果
              override def evaluate(buffer: Row): Any = {
                val total = buffer.getLong(0)
                val cityMap = buffer.getAs[Map[String, Long]](1)
                val result = new mutable.StringBuilder()
                var others: Double = 100F

                // 求前 2 名
                cityMap.toList
                  .sortWith((left, right) => left._2 > right._2)
                  .take(2)
                  .foreach {
                    case (cname, ccount) => {
                      val percent = ccount.toDouble * 100 / total
                      // 计算时，同时统计 【其他】 的百分比
                      others -= percent
                      result.append(f"$cname:${percent.formatted("%.2f")}%%,")
                    }
                  }

                // 如果城市数量 > 2，则增加【其他】
                if (cityMap.size > 2) {
                  result.append(f"其他:${others.formatted("%.2f")}%%")
                }

                // 8. 返回结果字符串
                result.toString()
              }
            }
            ```
    - sql代码
        1. 注册 UDAF
            ```scala
            spark.udf.register("cityRemark", new CityUDAF())
            ```
        2. 过滤并统计数据。同时用 UDAF 计算城市备注
            ```scala
            spark.sql(
              """
                |select
                |    c.area,
                |    p.product_name,
                |    count(c.city_name) as click_count,
                |    cityRemark(c.city_name) as cities
                |from user_visit_action as a
                |    join city_info as c
                |    on c.city_id = a.city_id
                |    join product_info as p
                |    on p.product_id = a.click_product_id
                |where a.click_product_id <> -1
                |group by c.area, p.product_name
                |""".stripMargin).createOrReplaceTempView("t1")
            ```

        3. 添加序号
            ```scala
            spark.sql(
              """
                |select
                |    t1.area,
                |    t1.product_name,
                |    t1.click_count,
                |    t1.cities,
                |    row_number() over(partition by t1.area order by t1.click_count desc) as rk
                |from t1
                |""".stripMargin).createOrReplaceTempView("t2")
            ```

        4. 只保留前 3 名
            ```scala
            spark.sql(
              """
                |select
                |    t2.area,
                |    t2.product_name,
                |    t2.click_count,
                |    t2.cities
                |from t2
                |where t2.rk <= 3
                |""".stripMargin).show
            ```

[top](#catalog)
