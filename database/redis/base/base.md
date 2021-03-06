
- 参考
    - https://www.bilibili.com/video/av20974126
    - https://www.bilibili.com/video/av90763746

<span id="catalog"></span>

- [NoSql入门](#NoSql入门)
    - [web结构的演进](#web结构的演进)
    - [nosql是什么](#nosql是什么)
    - [为什么用nosql](为什么用nosql)
    - [nosql的优点](#nosql的优点)
    - [RDBMS与NoSql的比较](#RDBMS与NoSql的比较)
    - [几种NoSql](#几种NoSql)
    - [NoSql的经典应用](#NoSql的经典应用)
    - [多数据源多数据类型的存储问题](#多数据源多数据类型的存储问题)
    - [大型互联网应用的难点和解决方案](#大型互联网应用的难点和解决方案)
    - [NoSql数据模型简介](#NoSql数据模型简介)
    - [NoSql数据库的四大分类](#NoSql数据库的四大分类)
    - [MongoDB简介](#MongoDB简介)
    - [分布式数据库中CAP原理](#分布式数据库中CAP原理)
    - [分布式数据库中BASE](#分布式数据库中BASE)
    - [分布式与集群简介](#分布式与集群简介)
- [Redis简介](#Redis简介)
- [Redis的安装](#Redis的安装)
- [Redis启动后的杂项基础知识](#Redis启动后的杂项基础知识)
    - [杂项基础知识](#杂项基础知识)
    - [数据库指令](#数据库指令)
- [Redis的数据类型](#Redis的数据类型)
    - [Redis的五大数据类型](#Redis的五大数据类型)
    - [获得redis常见数据库类型操作指令](#获得redis常见数据库类型操作指令)
    - [Redis键--key](#Redis键--key)
    - [Redis字符串--String](#Redis字符串--String)
    - [Redis列表--List](#Redis列表--List)
    - [Redis有序集合Zset--sortedSet](#Redis有序集合Zset--sortedSet)
- [redis配置文件](#redis配置文件)
    - [参考配置文件](#参考配置文件)
    - [Unit单位](#Unit单位)
    - [Includes包含](#Includes包含)
    - [General通用](#General通用)
    - [Network网络](#Network网络)
    - [Security安全](#Security安全)
    - [Limit限制](#Limit限制)
    - [Sanpshotting持久化](#Sanpshotting持久化)
    - [AppendOnlyMode](#AppendOnlyMode)
- [持久化](#持久化)
    - [RDB](#RDB)
    - [AOF](#AOF)
    - [AOF和RDB的对比](#AOF和RDB的对比)
- [redis事务](#redis事务)
    - [redis事务的介绍](#redis事务的介绍)
    - [redis事务的常用命令](#redis事务的常用命令)
    - [redis事务的使用分析](#redis事务的使用分析)
        - [正常使用](#正常使用)
        - [放弃事务](#放弃事务)
        - [全体连坐](#全体连坐)
        - [冤头债主](#冤头债主)
        - [watch监控](#watch监控)
- [消息发布与订阅](#消息发布与订阅)
- [主从复制](#主从复制)
    - [主从复制的基本概念](#主从复制的基本概念)
    - [主从复制的基本使用](#主从复制的基本使用)
    - [主从复制的原理](#主从复制的原理)
- [](#)
- [总结](#总结)

# NoSql入门
## web结构的演进
[top](#catalog)
- Cache缓存 + 垂直拆分(业务拆分) + MySql主从复制、读写分离 + 分表分库 + 水平拆分(数据量拆分) + mysql集群
- web应用结构的变化
    - 阶段1：单数据库实例
        - web应用的构成
            ```
            app --> dao --> MySql Instance
            ```
        - 数据存储的瓶颈
            - 访问量：访问量一个数据库实例无法接受
            - 索引量：数据的索引(B+Tree)一个机器的内存放不下
            - 数据量：数据量过多一台机器无法保存
    - 阶段2：`Memcached`(缓存) + MySql + 垂直拆分
        - **架构改进的原因：访问压力增大**
        - web应用的构成
            ```
                                  --> MySql Instance
            app --> dao --> Cache --> MySql Instance
                                  --> MySql Instance
            ```
        - 垂直拆分--优化数据库的结构和索引
            - 针对业务模块来拆分数据库
            - 如：原来买家和卖家的数据都在同一个`MySql Instance`中，现在分别放到两个`MySql Instance`中
        - 通过`Memcached`缓解数据库压力
            - 使用缓存技术来缓解数据库的压力
            - 通过文件缓存来缓解数据库压力，但有一些**缺点**
                - 当访问量继续增大的时候，多台web机器通过文件缓存无法共享
                - 大量的小文件缓存造成了比较高的IO压力
            - 但是`Memcached`只能缓解数据库的**读取压力**
    - 阶段3：MySql主从复制、读写分离
        - **架构改进的原因：写入压力增大**
        - web应用的构成
            ```
                                     读数据 -------------------> MySql Instance(从库 slave)
            app --> dao --> Cache ---写数据---> MySql Instance(主库 master)
                                     读数据 -------------------> MySql Instance(从库 slave)
            ```

        - 每个业务模块的数据库的读写集中在一个数据库， 但是`Memcached`只能缓解数据库的**读取压力**，数据库不堪重负
        - 使用主从复制技术（MySql master-slave），来达到读写分离，来提高读写性能和读库的扩展性

    - 阶段4：分表分库+水平拆分+mysql集群
        - **架构改进的原因**
            - 数据量仍然在增加，导致**主库的写压力开始出现瓶颈**
            - 因为`MyISAM`使用锁表(读写都锁)，在高并发下会出现严重的锁问题，改成使用`InnoDB`引擎
            - MySql推出了**高可靠性**的**MySql Cluster集群**，
        - web应用的构成
            ```
                                        MySql Cluster 1
                                            读数据 ------------> MySql Instance(从库 slave)
                                ------->    写数据 --> MySql Instance(主库 master)
                                            读数据 ------------> MySql Instance(从库 slave)

                                        MySql Cluster 2
                                            读数据 -----------> MySql Instance(从库 slave)
            app --> dao --> Cache ----->    写数据 --> MySql Instance(主库 master)
                                            读数据 -----------> MySql Instance(从库 slave)

                                        MySql Cluster 3
                                            读数据 ------------> MySql Instance(从库 slave)
                                ------->    写数据 --> MySql Instance(主库 master)
                                            读数据 ------------> MySql Instance(从库 slave)                         
            ```
        - 分区分库分表：
            - 拆分方式1：紧耦合数据之间的关系，将不常修改的数据放在一个库，将经常修改的数据放在另一个库
            - 拆分方式2：
                1. 海量数据都保存到一个表中(tableX)压力会非常大，所以设定数据量的阀值：a\b\c...
                2. 数据量达到阀值a时，数据进入库1的tableX
                3. 数据量达到阀值b时，数据进入库2的tableX，以此类推
                4. 将一个表的数据压力平分到各个数据库的表中
    - 阶段5：MySql的扩展性能瓶颈
        - 产生的问题在MySql层面无法很好的解决
        - MySql会存储一些大文本字段(blob)，导致数据库表非常大，做**数据库恢复时会非常的慢，不容易快速恢复数据库**
            - 如1000万4KB的文本=10_000_000 * 4KB / 1024 / 1024 = 38.147G
        - **如果能将这些数据省去，MySql将变得非常小**
        - MySql无法处理这种问题，导致MySql的扩展性差，海量数据下的IO压力大，表结构更改困难

- **alibaba的架构演进**
    |时间|关键内容|
    |-|-|
    |1999|Perl, CGI, Oracle|
    |2000|Java, Servlet|
    |2001-2004<br/>EJB时代|EJB(SLSB, CMP, MDB)<br/>Pattern(ServiceLocator, Delegate, Facade, DAO, DTO)|
    |2005-2007<br/>WithOut EJB重构|去EJB重构：Spring + iBatis + Webx, Antx<br/>底层架构:iSearch, MQ+ESB, 数据挖掘，CMS|
    |2009-2009<br/>海量数据|Memcached集群，MySql+数据切分= Cobar, 分布式存储， Hadoop, KV, CDN|
    |2010<br/>安全，镜像|安全、镜像、应用服务器升级、秒杀、NoSql、SSD|

## nosql是什么
[top](#catalog)
- **NoSql泛指非关系型数据库**
- nosql的产生就是为了解决大规模数据集合中数据种类多样化带来的挑战，尤其是海量数据应用难题，包括超大规模数据的存储
    - **这些类型的数据存储不需要固定的模式，无需多余操作就可以横向扩展**

## 为什么用nosql
- 传统的关系型数据库已经无法解决数据量增长的问题

- 解决web结构中的无法解决的数据量问题
    - 数据的3V
        - 海量Volume
        - 多样Variety
        - 实时Velocity
    - 互联网需求的3高
        - 高并发
        - 高可扩，主要是横向扩展
            - 横向扩展
                - 在机器数量上进行扩展
                - 可以进行**任务分配和负载均衡**
            - 纵向扩展
                - 在一台机器上进行扩展
                - 但是一台机器是有极限的，无法长期进行扩展
        - 高性能

    - 3v 更多的体现的是对**系统可能会出现的问题**的描述

- <label style="color:red">**重点解决：多数据源、多数据类型的存储问题**</label>


## nosql的优点
[top](#catalog)
- 易扩展
    - nosql种类繁多，它们的共同特点是去掉了关系数据库的关系型特性
    - 数据之间无关系，就可以很容易的扩展，同时也提升了架构的可扩展能力
- 大数据量高性能
    - NoSQL数据库都具有**非常高的读写性能**，尤其在大数据量下，同样表现优秀，这得益于它的无关系性，数据库结构简单
        - 每秒：读11万，写8万
    - 与MySql的Cache比较
        - MySql使用`Query Cache`，每次**表的更新**Cache就**失效**，是一种大粒度的Cache，在针对web2.0的交互频繁的应用，`Query Cache`性能不高
        - NoSQL的Cache是**记录级**的，是一种细粒度的Cache，所以性能更高
- 多样灵活的数据模型
    - NoSql**不需要事先**为需要存储的数据**建立字段**，随时可以存储自定义的数据格式
    - 在关系型数据库中，增删字段比较麻烦，如果是大数据量的表，比较困难

## RDBMS与NoSql的比较
[top](#catalog)
- RDBMS
    - 高度组织化、结构化的数据
    - 结构化查询语言：SQL
    - 数据和关系都存储在单独的表中
    - 数据操纵语言，数据定义语言
    - 严格的一致性
    - 基础事务
- NoSql
    - 没有声明性查询语言
    - 没有预定义的模式
    - 存储方式
        - **KV对**存储
        - 列存储
        - 文档存储
        - 图形数据库
    - `最终一致性`，不是ACID属性
    - 非结构化和不可预知的数据
    - CAP定理
    - 高性能、高可用、和可伸缩性

## 几种NoSql
[top](#catalog)
- 几种NoSql
    - Redis
    - Memcache
    - Mongdb
- 如果需要专注于高速缓存，应该使用：`Memcache`
- 如果需要数据类型丰富，应该使用`Redis`

## 多数据源多数据类型的存储问题
- 数据架构?????????图vedio3
- 由于数据架构的**复杂性**，需要在不同场景采用了多种类型的数据源
    - 关系数据库：基本的数据存储
    - 搜索引擎：提供商业搜索服务
    - Cache、KV：用于高性能场景
    - 外部数据接口：如淘宝/支付宝接口
    - 文档数据库: Schema free的结构化数据检索/管理 场景
    - 列数据库：用于后台的大规模计算场景

- 业务模型
    - 图???????????vedio3
    - 基本信息 ---> sql
    - 商品SPU属性 ---> Document DB
    - 图片 ---> 图片银行接口
    - 相关关键字 ---> Search Engine

## NoSql的经典应用
[top](#catalog)
- 以taobao首页为例,包含以下信息
    - 商品基本信息
    - 商品的描述、详情、评价信息(多文字类)
    - 商品的图片
    - 商品的关键字
    - 商品的波段性的热点高频信息
    - 商品的交易、价格计算、积分累计

- 各数据的分析
    - 商品基本信息
        - 包含的内容：名称、价格、出场日期、生产厂商等
            - 属于冷数据，不会经常变化
        - 存储方式：关系型数据库
            - mysql

    - 商品的描述、详情、评价信息(多文字类)
        - 全部都是大段的文字
        - 存储方式：文档数据库_Documnet DB ---> MongoDB

    - 商品的图片
        - 存储方式：分布式文件系统：
            - taobao：TFS
            - Google：GFS
            - Hadoop：HDFS

    - 商品的关键字
        - 搜索引擎、淘宝内用
        - ISearch

    - 商品的波段性的热点高频信息
        - 存储方式：内存数据库
            - Tair
            - Redis
            - Memcache

    - 商品的交易、价格计算、积分累计
        - 外部系统，外部第3方支付接口
        - 支付宝接口

## 大型互联网应用的难点和解决方案
[top](#catalog)
- 难点
    - 数据类型多样性
    - 数据源多样性和变化重构
    - 数据源改造而数据服务平台不需要大面积重构
        - 防止重构的过程中影响正常使用
- 解决方法
    - EAI和统一数据平台服务层
        - 通过统一接口来访问各种数据
    - 淘宝: `UDSL`

- UDSL : 统一数据服务层
    - UDSL做了什么
        - 在网站应用集群和底层数据源之间，构建一层代理，统一数据层
        - 统一数据层的特性
            - 模型数据映射
                - 实现业务模型 各属性 与 底层不同类型数据源的 模型数据映射
                - 目前支持关系数据库、iSearch、redis、mongodb
            - 统一的查询和更新API
                - 提供了基于业务模型的统一查询和更新的API，简化网站应用跨不同数据源的开发模式
            - 性能优化策略
                - 字段延迟加载，按需返回设置
                - 基于热点缓存平台的二级缓存
                - 异步并行的查询数据：异步并行加载模型中来自不同数据源的字段
                - 并发保护：拒绝访问频率过高的主机IP或IP段
                - 过滤高危的查询：如可能会导致数据库崩溃的全表扫描

    - UDSL是如何做的
        - 映射
            - 解决的问题
                - 传统ORM框架的问题
                    - 不能实现非关系数据库和不同类型数据库的对象数据映射
                    - 早期ORM框架，简化了对关系数据库的查询方式，采用面向对象的方式查询、管理数据库
                    - 对非关系数据类型，不能实现对象数据映射，更不能跨不同数据源
                - USDL提供出关系数据库以外的数据源的对象关系映射
                - UDSL支持同一业务模型的个字段映射到不同的数据
            - 解决方法
                - 设计1
                    - 模型数据映射`DSL`，定义模型字段和底层数据库的映射关系
                        - 描述模型对应哪些类型的数据源，各个数据源的访问方式是什么
                        - 模型有哪些字段，每个字段对于哪个数据源的哪个数据接口方法
                        - 模型字段是否支持延迟加载
                        - 模型字段的值如果需要对原始数据进行逻辑处理，用何种方式
                    - UDSL阅读DSL定义的数据路由，访问不同数据源，组装模型
                        - 通过DSL可以定义模型各个字段和各数据源的数据路由，UDSL在查询数据时通过阅读DSL路由规则来**聚合**各数据源的数据，组装模型

        - 统一查询更新API
            - UDSL采用统一的查询/更新API，统一了不同数据源的查询方式
                - 查询API （Criteria API）：提供类似JPA
                    - 基于模型表达式的查询方式：
                    - 支持按模型属性的结果排序
                    - 支持限定结果返回函数和返回哪些字段
                    - 和JPA不同的是
                        - 支持按需加载：可以指定只返回哪些字段，或者过滤哪些字段
                - 持久化API（Persist API）：提供简单的接口
                    - Dml.insert(product), Dml.update(product), Dml.delete(product)
                    - Dml.insertOrUpdate(product)
            - UDSL自动分析查询/更新参数，并根据模型字段映射配置，转换成底层过数据源的native语句进行数据操作
                

        - 热点缓存

## NoSql数据模型简介
[top](#catalog)
- 示例说明
    - 示例：以一个电商客户、订单、订购、地址模型来对比关系型数据库和非关系型数据库
        - 关系型数据库
            - ER图：关系(1:1,1:n,n:n)，基本范式
        - 非关系型数据库
            - BSON， MongoDB中常用的格式
                - BSON是一种类json的二进制存储格式：Binary Json
                - 与JSON相同，支持内嵌的文档对象和数据对象
                ```json
                // 各部分可以全部聚合
                {
                    "custom":{
                        "adderss":[{"city":"Beijing"}],
                        "order":{...}
                    }
                }

                // 各部分可以全部拆分
                {
                    "adderss":[{"city":"Beijing"}]，
                    
                    "custom":{
                        "adderss":adderss,
                        "order":{"..."}
                    },

                    
                }
                ```

    - 两种方式的问题和难点
        - 为什么示例中的情况可以用聚合模型来处理
            - <label style="color:red">高并发的操作时不太建议有关联查询的，互联网公司用冗余数据来避免关联查询(即减少 Join操作)</label>
                - 分布式跨库连接会浪费资源
                - RDBMS中通过外键主键来完成表间的强连接，不易修改
                - NoSql可以对关系进行快速修改，同时可以从json中提取结果
            - <label style="color:red">分布式事务是支持不了太多的并发的</label>

- 传统数据库中的数据模型
    - number
    - char
    - date
    - blob
    - 

- NoSql的聚合模型
    - KV键值
    - Bson
    - 列族
        - 是按列存储数据的，最大的特点是**方便存储结构化和半结构化数据，方便做数据压缩**
        - 对针对某一列或某几列的查询有非常大的IO优势
        - 图 ??????????? vedio4
    - 图

## NoSql数据库的四大分类
[top](#catalog)
- KV键值
    - Memcache, redis
- 文档型数据库(bson格式比较多)
    - CouchDB
    - MongoDB
    
- 列存储数据库
    - Cassandra, HBase
    - 分布式文件系统
- 图关系数据库
    - Neo4J, InfoGrid
- 四类数据库的对比

    |分类|Example|典型应用场景|数据模型|优点|缺点|
    |-|-|-|-|-|-|
    |KV键值|redis|内容缓存，主要用于处理大量数据的高访问负载，也用于一些日志系统|KV对，通常用hashTable实现（对Value使用来获取key）|查询速度快|数据无结构化，通常值被当作字符串或者二进制数据|
    |列存储数据库|Cassandra, HBase|分布式文件系统|以列簇形式存储，将同一列数据存储在一起|查找速度快，可扩展性强，更容易进行分布式扩展|功能相对局限|
    |文档型数据库|CouchDB，MongoDB|Web应用( 与KV类似，Value是结构化的，不同的是数据库能够了解Value的内容???)|KV对应的键值，Value为结构化数据|数据结构要求不严格，表结构可变，**不需要像关系型数据库一样需要预先定义表结构**|查询性能不高，而且缺乏统一的查询语法|
    |图关系数据库|Neo4J, InfoGrid|社交网络，推荐系统|图结构|利用图结构相关算法|很多时候需要对整个图做计算才能得出需要的信息，并且这种结构不太好做分布式的集群方案|


## 分布式数据库中CAP原理
[top](#catalog)
- 原理：CAP+BASE
- CAP的概念
    - C: Consistency ，强一致性
    - A: Availability，可用性
    - P: Partition tolerance 分区容错性

- **CAP理论的核心是**：<label style="color:red">CAP的3进2</label>
    - 在分布式存储系统中，CAP理论最多只能实现两点
        - 一个分布式系统不可能同时很好的满足一致性，可用性和分区容错性这三个需求，<label style="color:red">最多同时只能满足两个</label>
        - **没有NoSql系统能同时保证这3点**
    
    - 由于网络硬件一定会出现延迟、丢包的问题，**分区容忍性**是**必须要实现的**，所以只能在一致性和可用性之间权衡
    
    - 根据CAP原理将NoSql数据库分成三大类
        |原则组合|使用原则|特点|用途|
        |-|-|-|-|
        |CA原则|强一致性<br/>可用性|用于**单点集群**，通常在可扩展性上不好|传统的Oracle数据库
        |CP原则|强一致性<br/>分区容错性|通常性能不是特别高|Redis、MongoDB|
        |AP原则|可用性<br/>分区容错性|通常对一致性要求比较低|**大多数网站架构的选择**|
    
    - 经典CAP图 ?????vedio 6 6:06

- 一致性和可用性的抉择：<label style="color:red">AP原则 + 弱一致性</label>
    - 多数网站架构的选择
    - 示例：高并发和大数据量情况下的**购物网站的点赞数和浏览次数**
        - 在高并发和大数据量的情况下，用户不会太关心点赞数和浏览次数，所以此时数据不一定要保证强一致性，可以暂时不正确
        - 通过保证高可用、和分区容错，并舍去强一致性，来增加服务器性能
        - 在高并发和大数据量的状况缓解之后，再汇总数据来达到最终一致性，即**完成CA**
    
- 对于web2.0网站来说，关系数据库的很多主要特性却往往无用武之地

    - 数据库事务一致性需求
        - 很多web实时系统并不要求严格的数据库事务，对读一致性的要求很多，有些场合对**写一致性**要求并不高，允许实现最终一致性

    - 数据库的写实时性和读实时性需求
        - 对关系数据库来说，插入一条数据之后立刻查询，是肯定可以读出这条数据的，**但是对于很多web应用来说，并不要这么高的实时性**，如发一条信息之后，过几秒乃至十几秒之后，订阅者才看到这条动态是完全可以接受的
    - 对复杂的SQL查询，特别是多表关联查询的需求
        - <label style="color:red">任何大数据量的web系统，都非常忌讳多个大表的关联查询</label>

## 分布式数据库中BASE
[top](#catalog)
- BASE是一种解决方案，是为了解决**关系数据库强一致性导致的问题而引起的可用性降低问题**
- BASE是三个术语的缩写
    - 基本可用：Basically Available
    - 软状态：Soft state
    - 最终一致性：Eventually consistent
- BASE的思想
    - **在某一时刻，通过让系统放松对数据一致性的要求，来换取系统整体伸缩性和性能**
- 为什么需要BASE
    - 大型系统往往由于地域分布和对极高性能的追求，不可能采用分布式事务来完成这些指标。如果想获得这些指标，必须采用另一种方式来完成，所以使用BASE

## 分布式与集群简介
[top](#catalog)
- 分布式系统 （distributed system） 的概念
    - <label style="color:red">由多台计算机和通信软件组件通过计算机网络连接(本地网/广域网)组成</label>
    - 分布式系统是建立在网络之上的软件系统。
        - 因为软件的特性，所以分布式系统具有**高度的内聚性和透明性**
        - 网络和分布式系统之间的**区别**更多的在于**高层软件(特别是操作系统)，而不是硬件**
    - 分布式系统可以应用在不同的平台上，如：PC、工作站、局域网、广域网等

- **分布式** 的概念
    - 不同的多台服务器上面部署<label style="color:red">不同</label>的服务模块(即工程)，他们之间**通过Rpc/Rmi通信和调用**，<label style="color:red">对外提供服务和组内协作</label>
- **集群** 的概念
    - 不同的多台服务器上面部署<label style="color:red">相同</label>的服务模块(即工程)，通过分布式调度软件进行统一的调度，<label style="color:red">对外提供服务和访问</label>

- 负载均衡：平衡服务器压力

## MongoDB简介
[top](#catalog)
- MongoDB是一个**基于分布式文件存储的数据库**，由C++编写，是为了给WEB应用提供可扩展的改性数据存储解决方案
- MongoDB是一个介于关系数据库和非关系数据库之间的产品，是非关系数据库中功能最丰富，最想关系数据库的


# Redis简介
[top](#catalog)
- 是什么
    - <label style="color:red">KV + Cache + Persistent</label>
    - Redis： REmote DIcationary Server， 远程字典服务器
    - **分布式数据库**
    - Redis是完全开源免费的，用C语言编写的，遵守BSD协议，是一个高性能的（key/value）分布式内存数据库，基于内存运行，并支持持久化的NoSQL数据库，是当前最热门的NoSql数据库之一，也被人们称为**数据结构服务器**
    - Redis与其他key-value缓存产品(如memcache)相比有以下三个特点
        - 持久化：Redis支持数据的持久化，可以将内存中的数据保持在磁盘中，重启的时候可以再次加载进行使用
        - 更多的数据类型：Redis不仅仅支持简单的key-value类型的数据，同时还提供list，set，zset，hash等数据结构的存储
        - 备份：Redis支持数据的备份，即master-slave模式的数据备份
- 能做什么
    - 内存存储和持久化：redis支持**异步**将内存中的数据写到硬盘上，**同时不影响继续服务**
    - 取最新N个数据的操作，如：可以将最新的10条评论的ID放在Redis的List集合里面
    - 模拟类似于HttpSession这种需要设定过期时间的功能
    - 发布、订阅消息系统
    - 定时器、计数器
- 下载
    - redis.io
    - www.redis.cn
- 怎么使用
    - 数据类型、基本操作和配置
    - 持久化和复制，RDB/AOF
    - 事务的控制
    - 复制

# Redis的安装
[top](#catalog)
- 下载redis-3.0.4.tar.gz，放入linux的`/opt`目录
- /opt目录，解压：`tar -zxvf redis-3.0.4.tar.gz`
- 解压完后出现文件夹：`redis-3.0.4`
- 进入目录：`cd redis-3.0.4`
- **编译**：在`redis-3.0.4`目录下执行`make`命令
    - 肯能会有的问题
        - 如果缺少gcc
            - 安装gcc
                - 能上网：安装 yum install gcc-c++
                - 不能上网：使用光盘镜像 ??????vedio7
            - 测试：gcc -v
        - 2次make时，缺少某些目录
            - 运行：`make distclean`，然后再执行：`make`
    - 执行测试程序
        - Redis Test，指令：`make test`
        
- **安装**：如果`make`完成后继续执行`make install`
    - `redis-3.0.4`目录下会生成配置文件：`redis.conf`
    - 备份`redis.conf`到其他目录，如：`/myredis`
        - 通用配置部分：GENERAL
            - daemonize no/yes：
                - redis默认不会在后台按照守护进程来执行
                - 如果需要以守护进程执行，则redis将会在文件：`/var/run.redis.pid`中添加进程ID
        - **启动redis时，可以通过指定配置文件来启动**
- 查看默认安装目录：`usr/local/bin`
    - 该目录下的文件
        -  redis-benchmark
            - 性能测试
        -  redis-check-aof
        -  redis-check-dump
        -  redis-cli
        -  redis-sentinel -> redis-server
        -  redis-server
- 启动
    - 启动redis，指令：`redis-server /myredis/redis.conf`
    - 进入reids，指令：`redis-cli -p 6379`
    - 控制台会切换为：`127.0.0.1:6379`
    - 测试Redis是否启动成功，指令:`ping`
        - 输出`PONG`则表示启动成功
    
    - 可以在外部检查redis是否启动的指令
        - `ps -ef | grep redis`
        - `lsof -i:6379`
- 测试程序：helloworld
    - 在redis控制台中输入：`set k1 hello`
    - 获取输入值：`get k1 `

- 关闭
    - `shutdown`

# Redis启动后的杂项基础知识
## 杂项基础知识
[top](#catalog)
- <label style="color:red">单进程</label>
    - 单进程模型来处理客户端的请求，对读写等事件的**响应是通过对epoll函数的包装来做到的**
    - Redis的实际处理速度**完全依靠主进程的执行效率**
    - Epoll
        - 是Linux内核为处理大批量文件描述符而做了改进的epoll，是Linux下多路复用IO接口select/poll的增强版本
        - 它能显著**提高**程序**在大量并发连接中只有少量活跃**的情况下的系统CPU利用率

- 默认16个数据库，类似数组下标，从0开始，**初始默认使用0号库**
    - 数据库的下标从0开始
    - 在`redis.conf`中，通过`databases`来设定DB的数量


- 统一密码管理，16个库都是同一的密码，要么都OK要么都无法连接
    - 在`redis.conf`中，通过`requirepass`来设定密码
    - 如果设定了密码，启动后，需要输入指令：`auth 密码`来进入数据库

- Redis的索引是从 0 开始的
    - 包括数据库名和数据

- 为什么默认端口6379
    - `redis.conf`中，属性`port`的默认值是6379

- redis的指令如果生效了会返回1、值的长度、OK，如果没生效会返回0、-1、error

## 数据库指令
[top](#catalog)
- 数据库指令

    |命令|作用|示例|
    |-|-|-|
    |select 数据库编号|切换数据库|`select 7`，切换到7号库|
    |dbsize|查看当前数据库**key的数量**||
    |flushdb|清空当前数据库||
    |flushall|清空所有数据库||
    |clear|清屏||

# Redis的数据类型
## Redis的五大数据类型
[top](#catalog)
- Sring-----字符串
    - String类型是redis中最基本的类型，可以理解为与Memcached一模一样的类型，即**一个key一个value**
    - String类型是**二进制安全的**，即redis的string可以包含任何数据，如jpg图片或者序列化的对象
    - 一个字符串**最多可以是512M**

- Hash-----哈希
    - hash是一个键值对**集合**
    - hash是一个string类型的field和value的映射表, 类似java的`Map<String, Object>`
    - hash特别适合**用于存储对象**

- List-----列表
    - 列表的底层是 : <label style="color:red">链表</label>
    - **列表是简单的字符串列表**，按照插入顺序排序，可以添加一个元素到列表的头部或尾部

- Set-----集合
    - set是string类型的**无序无重复集合**，它是通过HashTable实现的

- Zset-----有序集合 `sorted set`
    - Zset和Set一样也是string类型元素的集合，且成员不允许重复
    - 与Set不同的是 : <label style="color:red">每个元素都会关联一个double类型的分数(score)</label>
        - redis通过分数来为集合中的成员进行从大到小的排序
        - **zset的成员是唯一的，但是分数(score)可以重复**

## 获得Redis常见数据库类型操作指令
[top](#catalog)
- http://redisdoc.com/

## Redis键--key
[top](#catalog)
- 命令

    |命令|命令内容|
    |-|-|
    |**exists key**|检查key是否存在|
    |**expire key seconds**|为指定key设置过期时间，**过期之后自动从内存中删除**|
    |**keys pattern**|查询所有符合给定模式(pattern)的key，可以使用通配符：`*`,`?`|
    |**move key 数据库索引**|将当前数据库的key移动到指定的数据库中|
    |**type key**|返回key所存储的value的类型|
    |**ttl key**|以**秒为单位**返回key的剩余生存时间(TTL, time to live), -1表示永不过期，-2表示已过期|
    |del key|如果key存在，则删除key|
    |dump key|序列化key，并返回被序列化的值|
    |expireat key milliseconds|EXPIREAT的作用和EXPIRE类似，都用于为key设置过期时间，不同在于 expireat 命令接受的时间参数是 UNIX 时间戳(unix timestamp)。|
    |pexpire key milliseconds|设置key的过期，以毫秒计|
    |pexpire key milliseconds-timestamp|设置key的过期时间戳(unix timestamp)，以毫秒计|
    |persist key|移除key的过期时间，key将持久保持|
    |pttl key|以**毫秒为单位**返回key的剩余的过期时间|
    |randomkey|从当期数据库随机返回一个key|
    |rename key newkey|修改key的名称|
    |renamenx key newkey|**仅当newkey不存在时**，将key重命名为newkey|

- 注意事项
    - <label style="color:red">如果设定了某个key的过期时间，在过期时，key和value将会从内存中被清除</label>
    - 一般情况下，应该为key设置过期时间，而不是手动删除。当key过期时，自动从内存中删除

## Redis字符串--String
[top](#catalog)
- 命令
    |操作类型|命令|命令内容|
    |-|-|-|
    |单取值|get key|获取指定 key 的值|
    |多取值|mget key1 [key2..]|获取所有(一个或多个)给定 key 的值|
    |单取值|getrange key start end|返回 key 中字符串值的子字符，范围:`[start, end]`。 如果end是`-1`,会返回后边的所有值|
    |单取值|getbit key offset|对 key 所储存的字符串值，获取指定偏移量上的位(bit)|
    |单设值|set key value|设置指定 key 的值|
    |单设值|setnx key value|**只有在 key 不存在时设置** key 的值|
    |单设值|setex key seconds value|将值 value 关联到 key ，并将 key 的过期时间设为 seconds (以秒为单位)|
    |多设值|mset key value [key value ...]|同时设置一个或多个 key-value 对。没有的新建，有的覆盖|
    |多设值|msetnx key value [key value ...]|同时设置一个或多个 key-value 对，当且仅当所有给定 key 都不存在|
    |单设值|setrange key 偏移量 value|用 value 参数覆盖给定 key 所储存的字符串值，从偏移量开始覆盖，如果长度不足，会自动扩容|
    |单设值|getset key value|将给定 key 的值设为 value ，并返回 key 的旧值(old value)|
    |单设值|setbit key offset value|对 key 所储存的字符串值，设置或清除指定偏移量上的位(bit)|
    |单设值|psetex key milliseconds value|这个命令和 SETEX 命令相似，但它以毫秒为单位设置 key 的生存时间，而不是像 SETEX 命令那样，以秒为单位|
    |字符串|strlen key|返回 key 所储存的字符串值的长度|
    |字符串|append key value|如果 key 已经存在并且是一个字符串， APPEND 命令将指定的 value 追加到该 key 原来值（value）的末尾|
    |数值运算|incr key|数字 + 1|
    |数值运算|incrby key increment|数字 + increment|
    |数值运算|decr key|数字 - 1|
    |数值运算|decrby key decrement|数字 - decrement|
    |数值运算|incrbyfloat key increment|数字 + 浮点数increment|

- 特点：单值单value

- 实际应用
    - 如果业务中有不停修改数值的逻辑，如点击量数据，可以放到redis中进行处理，避免对数据库进行频繁操作
    - 通过`setex key seconds value`，来设定过期时间

- 注意事项
    - incr/decr/incrby/decrby，必须是数字才能进行加减，否则会产生异常
        
## Redis列表--List
[top](#catalog)
- 命令

    |操作类型|命令|命令内容|
    |-|-|-|
    |添加元素/新建list|lpush key value1 [value2]|left push，将一个或多个值插入到队头，可以对一个list变量进行多次插入<br/>如果输入`lpush k1 1 2 3 4 5`<br/>`lrange k1 0 -1`的输出顺序是54321，<br/>即插入每个元素时都从队头插入|
    |添加元素/新建list|rpush key value1 [value2]|rigth push，将一个或多个值插入到队尾，可以对一个list变量进行多次插入<br/>如果输入`rpush k2 1 2 3 4 5`<br/>`lrange k2 0 -1`的输出顺序是12345，<br/>即插入每个元素时都从队尾插入|
    |list重置|ltrim key start stop|key = key[start:end], 包含end；<br/>如果`start >= length`，则list将**因为没有元素而被删除**<br/>如果`end >= length`, 则只截取到length-1，不会异常，不会扩容|
    |修改元素|lset key index value|通过索引设置列表元素的值|
    |list切片|lrange key start stop|从对头方向，获取列表指定范围内的元素， `0 -1`表示全部元素|
    |弹出元素|lpop key|移出并返回队头元素|
    |弹出元素|rpop key|移出并返回队尾元素|
    |获取元素|lindex key index|通过索引获取列表中的元素|
    |获取列表长度|llen key|获取列表长度|
    |删除|lrem key count value|**从队头开始，至多删除count个value**，指定值的数量不足时，不会报错|
    |list间元素移动|rpoplpush list01 list02|v = rpop list01; lpush list02 v|
    |插入元素|linsert key BEFORE/AFTER pivot value|在pivot前/后插入value<br/>如果pivot有重复的值，则使用从队头开始找到的第一个pivot<br/>如果pivot不存在，则会返回`-1`|
    |阻塞式弹出元素|blpop key1 [key2 ] timeout|移出并获取列表的第一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止|
    |阻塞式弹出元素|brpop key1 [key2 ] timeout|移出并获取列表的最后一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止|
    |阻塞式list间元素移动|brpoplpush source destination timeout|从列表中弹出一个值，将弹出的元素插入到另外一个列表中并返回它； 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止|
    |检查式添加元素|lpushx key value|将一个值添加到已存在的list的队头|
    |检查式添加元素|rpushx key value|将一个值添加到已存在的list的队尾|

- 特点：单值多value

- list的使用规则
    - list是一个字符串链表，队头/left和队尾/right都可以添加
    - 如果键不存在，则创建新的链表
    - 如果键已存在，则在指定方向添加内容

- list的性能
    - 链表的操作无论是在对头还是在队尾，效率都极高
    - 操作list中间的元素时，效率不是很好

- 注意事项
    - 如果list中的元素被全部移除，则这个list的key将会被删除
        - 使用ltrim时如果list没有元素了，这个key就会被删除
        - 使用lrange来查看不存在的key时，不会产生异常，只会提示：`(empty list or set)`

## Redis集合--Set
[top](#catalog)
- 基本命令

|操作类型|命令|命令内容|
|-|-|-|
|添加元素/新建|sadd key member1 [member2]|向集合中插入一个或多个元素<br/>插入时会对多个元素进行自动去重，不会报错<br/>`sadd set01 1 1 2 2 3 3`，最后只会添加： 1、2、3|
|获取元素的个数|scard key|获取集合的成员数<br/>获取一个不存在的set的元素数量时，不会引发异常，**会返回0**|
|删除元素|srem key value1 [vlaue2...]|删除集合中一个或多个元素<br/>从不存在的set中删除元素时，不会引发一场，**会返回0**|
|随机获取元素|srandmember key [count]|返回集合中一个或多个随机数，默认返回1个<br/>如果count >= length,则返回全部元素，不会引发异常，并且这种情况下，每次的输出元素顺序都是相同的|
|获取所有元素|smembers key|返回集合中的所有成员|
|随机出栈|spop key|**移除**并返回集合中的一个随机元素|
|元素移动|smove set1 set2 set1中的一个值|将set1中的某个值**移动到**set2中|
|存在判断|sismember key member|判断 member 元素是否是集合 key 的成员|
|??????|sscan key cursor [MATCH pattern] [COUNT count]|迭代集合中的元素|

- 数学集合操作

|操作类型|命令|命令内容|
|-|-|-|
|求差集|sdiff key1 [key2...]|返回给定所有集合的差集，**在key1中，不再key2中**|
|求交集|sinter key1 [key2]|返回给定所有集合的交集|
|求并集|sunion key1 [key2]|返回所有给定集合的并集|
|求差集并保存|sdiffstore destination key1 [key2]|返回给定所有集合的差集并存储在 destination 中|
|求交集并保存|sinterstore destination key1 [key2]|返回给定所有集合的交集并存储在 destination 中|
|求并集并保存|sunionstore destination key1 [key2]|所有给定集合的并集存储在 destination 集合中|

- 特点：单值多value

- 应用场景
    - 高并发下的，随机用户抽奖，将用户ID或用户名写到一个set中，作为另一个随机数池，然后通过`srandmember key count`来返回count个中奖用户

- 注意事项
    - 如果set中的元素被全部删除，则这个set的key将会被删除

## Redis哈希--Hash
[top](#catalog)
- 命令

|操作类型|命令|命令内容|
|-|-|-|
|设定单个字段|<label style="color:red">hset key field value</label>|将哈希表 key 中的字段 field 的值设为 value|
|设定多个字段|<label style="color:red">hmset key field1 value1 [field2 value2 ]</label>|同时将多个 field-value (域-值)对设置到哈希表 key 中|
|获取一个字段|<label style="color:red">hget key field</label>|获取存储在哈希表中指定字段的值|
|获取多个字段|<label style="color:red">hmget key field1 [field2]</label>|获取所有给定字段的值|
|获取指定key下的所有字段和值|<label style="color:red">hgetall key</label>|获取在哈希表中指定 key 的所有字段和值|
|删除一个字段|<label style="color:red">hdel key field1 [field2]</label>|删除一个或多个哈希表字段|
|获取字段的数量|hlen key|获取哈希表中字段的数量|
|字段存在检查|hexists key field|查看哈希表 key 中，指定的字段是否存在|
|获取全部字段名|<label style="color:red">hkeys key</label>|获取所有哈希表中的字段|
|获取全部字段值|<label style="color:red">hvals key</label>|获取哈希表中所有值|
|整数计算|hincrby key field increment|key[field] += increment|
|浮点计算|hincrbyfloat key field increment|key[field] += increment， **字段对应的值和增加的值，只要有一个是小数就需要使用hincrbyfloat**|
|不存在设置|hsetnx key field value|只有在字段 field **不存在时**，设置哈希表字段的值|
|???????|hscan key cursor [MATCH pattern] [COUNT count]|迭代哈希表中的键值对|

- 存储方式
    - KV模式不变：仍然是一个key对应一个value
    - value在这里是一个键值对

- 使用场景
    - 对象的存储
        - value中的多个键值对构成一个对象，并通过key来标识这个对象；在java中对象通过class来创建，在redis中通过Hash来创建



## Redis有序集合Zset--sortedSet
[top](#catalog)
- zset就是在set的基础上，加上一个score值
    - set是：k1 v1 v2 v3
    - zset是：k1 score1 v1 score2 v2 score3 v3

- 命令

|操作类型|命令|命令内容|
|-|-|-|
|添加|zadd key score1 member1 [score2 member2]|向有序集合添加一个或多个成员，或者更新已存在成员的分数|
|查询|zcard key|获取有序集合中的member数|
||zcount key min max|计算在有序集合中指定区间分数的成员数|
||zincrby key increment member|有序集合中对指定成员的分数加上增量 increment|
||zinterstore destination numkeys key [key ...]|计算给定的一个或多个有序集的交集并将结果集存储在新的有序集合 key 中|
||zlexcount key min max|在有序集合中计算指定字典区间内成员数量|
|查询|zrange key start stop [WITHSCORES]|通过索引区间返回有序集合指定区间内的member，如果后面添加了`WITHSCORES`则返回socre和member|
| |zrangebylex key min max [LIMIT offset count]|通过字典区间返回有序集合的成员|
|查询|zrangebyscore key min max [WITHSCORES] [LIMIT 开始下标，返回数量]|通过分数返回有序集合指定区间内的成员<br>在最大最小值之前添加`(`，表是不包含该值|
|查询|zrank key member|返回有序集合中指定成员的索引|
|删除|zrem key member [member ...]|移除有序集合中的一个或多个成员|
||zremrangebylex key min max|移除有序集合中给定的字典区间的所有成员|
||zremrangebyrank key start stop|移除有序集合中给定的排名区间的所有成员|
||zremrangebyscore key min max|移除有序集合中给定的分数区间的所有成员|
||zrevrange key start stop [WITHSCORES]|返回有序集中指定区间内的成员，通过索引，分数从高到低|
||zrevrangebyscore key max min [WITHSCORES]|返回有序集中指定分数区间内的成员，分数从高到低排序|
|查询|zrevrank key member|返回有序集合中指定成员的排名，有序集成员按分数值递减(从大到小)排序|
|查询|zscore key member|返回有序集中，成员的分数值|
||zunionstore destination numkeys key [key ...]|计算给定的一个或多个有序集的并集，并存储在新的 key 中|
||zscan key cursor [MATCH pattern] [COUNT count]|迭代有序集合中的元素（包括元素成员和元素分值）|


# redis配置文件
## 参考配置文件
[top](#catalog)
- 参考地址：https://raw.githubusercontent.com/antirez/redis/5.0/redis.conf
- 参考配置：[/nosql/redis/conf/redis.conf](/nosql/redis/conf/redis.conf)

## Unit单位
[top](#catalog)
- 配置说明
    - 配置存储单位，定义了一些基本度量单位
    - 只支持bytes，不支持bit 
    - 设置时对大小不敏感，`gb`、`GB`都可以
- 配置内容
    ```xml
    # Note on units: when memory size is needed, it is possible to specify
    # it in the usual form of 1k 5GB 4M and so forth:
    #
    # 1k => 1000 bytes
    # 1kb => 1024 bytes
    # 1m => 1000000 bytes
    # 1mb => 1024*1024 bytes
    # 1g => 1000000000 bytes
    # 1gb => 1024*1024*1024 bytes
    #
    # units are case insensitive so 1GB 1Gb 1gB are all the same.
    ```

## Includes包含
[top](#catalog)
- 配置说明 
    - 通过includes包含，可以将redis.conf作为管理者，来包含其他配置

- ?????

## General通用
[top](#catalog)
- `daemonize yes/no`
    - redis默认不是以守护进程的方式运行，可通过设置为`yes`来启动守护进程
    - 默认值是`no`
- `pidfile /var/run/redis_6379.pid`
    - 当redis以守护进程方式运行时，redis默认会把pid写入指定文件中
- `loglevel 级别`
    - 4种日志级别
        1. debug
        2. verbose
        3. notice，默认级别
        4. warning 

- `logfile 文件名`
    - 设置日志文件
    - `""`、`stdout`表示输出到标准输出
    - 如果`daemonize yes`，redis以守护进程的方式运行，并通过`logfile stdout`将日志记录方式设为标准输出，则日志将会发送给`/dev/null`

- `syslog-enabled yes/no`
    - 是否把日志输出到syslog中

- `syslog-ident redis`
    - `syslog-enabled yes`时，指定个syslog里的日志

- `syslog-facility local0`
    - 指定syslog设备，值可以是USER或LOCAL0-LOCAL7

- `databases`
    - 设置redis中可用库的数量

## Network网络
[top](#catalog)
- `tcp-backlog 511`
    - 设置tcp的backlog，backlog是一个连接队列，backlog队列总和=未完成三次握手队列+已完成三次握手队列
    - 在高并发环境下需要一个高backlog值来避免慢客户端的连接问题
    - Linux内核会将这个值减小到`/proc/sys/net/core/somaxconn`的值，所以需要确认增大`somaxconn`和`tcp_max_syn_backlog`两个值来达到目标结果
- `timeout`
    - 当客户端空闲了`timeout`的时间，则关闭客户端
    - `timeout 0`，表示不关闭

- `tcp-keepalive 300`
    - 相当于心跳测试，单位为秒
    - 建议设成60
    - `tcp-keepalive 0`，表示不会进行Keepalive检测

## Security安全
[top](#catalog)
- `requirepass`，登陆密码
    - 默认是:`""`，即没有密码
    - 可以通过指令在客户端查询、修改密码
        - 获取当前密码的指令：`config get requirepass`
        - 设置当前密码的指令：`config set requirepass "xxx"`
    - 设置了密码之后，登录客户端之后，第一次执行指令前需要输入密码
        - `auth 密码`

## Limit限制
[top](#catalog)
- `maxclients`
    - 最大连接数
    - 默认值`10000`
- `maxmemory <bytes>`
    - 设置最大缓存，需要配合`maxmemory-policy`来使用
- `maxmemory-policy noeviction`
    - 设置缓存的过期策略
    - 5种缓存过期策略
        1. volatile-lru，使用LRU算法移除key，只针对设置了过期时间的key
        2. allkeys-lru，使用LRU算法移除key
        3. volatile-lfu，
        4. allkeys-lfu，
        5. volatile-random，在过期集合中随机移除key，只针对设置了过期时间的key
        6. allkeys-random，随机删除key
        7. volatile-ttl，移除tll值最小的key，即那些最近要过期的key
        8. noeviction 永不过期，默认值
    - LRU算法：最近最少使用

- `maxmemory-samples`
    - 设置需要检查的样本数量
    - 因为LRU算法和最小TLL算法都不是精确的算法，只是估算值，所以可以设置样本的大小，reids默认会检查`maxmemory-samples`个key并选择其中LRU的那个值

## Sanpshotting持久化
[top](#catalog)
- Sanpshotting主要用来配置redis的持久化策略
    - 即以何种策略将内存中的数据保存到磁盘的指定位置
- `dir`
    - 指定本地数据库的存储位置
    - 默认是`./`，会跟随启动的目录而变化

- `dbfilename dump.rdb`
    - 设置RDB备份文件的名字，默认是`dump.rdb`

- `save <seconds> <changes>`
    - RDB的自动备份策略，表示:在`seconds`秒内,至少有`changes`个key被修改了,则进行备份
    - 三种默认的策略
        1. `save 900 1`，900s(15min)内如果有至少有1个key被修改
        2. `save 300 10`，300s(5min)内如果有至少10个key被修改
        3. `save 60 10000`，60s内至少有10000个key被修改了
    - `save ""`表示不做rdb备份

- `stop-writes-on-bgsave-error yes/no`
    - 表示当自动备份发生异常时，是否禁止redis进行数据写入
    - 默认值是`yes`
        - 如果设置了`yes`，并且发生了异常，则需要重起redis才能再次写入
    - 如果不关心数据一致性或者有其他发现和控制异常的手段，则可以设置为`no`

- `rdbcompression yes/no`
    - 表示备份时，是否需要使用LZF算法进行压缩
        - 使用算法进行压缩时，会增加CPU的工作量
    - 默认值是`yes`

- `rdbchecksum yes`
    - 表示在数据备份之后，可以让redis使用CRC64算法来进行数据校验
    - 默认值是：`yes`
    - 使用校验之后，**会增加大约10%的性能消耗**，如果希望获取到最大的性能提升，可以关闭此功能

## AppendOnlyMode
[top](#catalog)
- `appendonly no/yes`
    - 是否启动AOF模式
    - 默认是`no`

- `appendfilename "appendonly.aof"`
    - 指定个AOF模式的日志文件名

- `appendfsync always/everysec/no`
    - `always`
        - 同步持久化，每次更改数据时都会被立刻记录到磁盘文件，性能比较差，但是数据完整性比较好
    - `everysec`
        - 默认设置
        - 异步操作，每秒记录。如果一秒内宕机，则会有数据丢失
    - `no`

- `auto-aof-rewrite-percentage 100`
    - rewrite的触发条件：aof文件大小是上次rewrite后大小的一倍
- `auto-aof-rewrite-min-size 64mb`
    - rewrite的触发条件：aof文件大于64M

- `no-appendfsync-on-rewrite no/yes`
    - 表示重写是是否可以运用`appendfsync`的配置  ?????
    - 默认值是`no`
    - 使用默认值`no`即可，**保证数据的安全性**

# 持久化
## RDB
[top](#catalog)
- Redis DataBase
- RDB的相关配置：[Sanpshotting持久化](#Sanpshotting持久化)
- RDB是什么
    - 在指定的时间间隔内将内存中的数据集**进行压缩**制作Snapshot并写入磁盘。使用Snapshot恢复时会将Snapshot文件直接读到内存中
    - 可以组合多种策略来触发持久化
- RDB持久化的操作
    - 基本过程
        1. Redis单独创建（fork，可以理解为拷贝）一个子进程来进行持久化。
        2. 子进程将数据写入一个**临时文件**(持久化)
        3. 当数据写入结束后，再用这个临时文件**替换**上次持久化的文件

    - **在持久化的过程中，主进程不进行任何IO操作，保证了极高的性能**
        - 保证持久化时数据源是静态的，降低数据异常、操作异常的几率
    - Fork操作
        - `Fork`的作用是**复制**一个与当前进程一样的新进程，新进程的所有数据(变量、环境变量、程序计数器等)都和当前进程一致，**并将这个新进程作为当前进程的子进程**
        - `Fork`时，内存中父进程的数据量翻倍，并占用相同的内存，**可能会导致系统变慢**

- Rdb保存的是`dump.rdb`文件

- RDB的优缺点
    - RDB的优点
        - RDB是一个**非常紧凑的文件**
        - 如果需要进行大规模数据的恢复，且**对于数据**恢复的**完整性不是非常敏感**，则RDB方式比AOF方式更加的高效
        - 备份时，由子进程执行，主进程可以做其他的IO操作，所以RDB持久化方式**可以最大化redis的性能**
    - RDB的缺点
        - 最后一次持久化后的数据可能丢失
            - 如每隔`X`分钟备份一次，在第`nX`次需要备份时出现了异常，将会导致`(n-1)X ~nX`之间的数据无法备份
        - 备份是需要复制父进程的全部数据，占用等量的内存，可能会导致系统变慢

- 触发备份的几种方式
    1. 等待备份策略被触发
        - RDB的三种默认策略，参考：[Sanpshotting持久化](#Sanpshotting持久化)
            1. `save 900 1`，900s(15min)内如果有至少有1个key被修改
            2. `save 300 10`，300s(5min)内如果有至少10个key被修改
            3. `save 60 10000`，60s(1min)内至少有10000个key被修改了
        - 当已配置的策略被触发后，redis将自动进行备份   
            - 备份时最后将备份文件拷贝到其他机器上，防止误操作
    2. 强制备份
        - 当添加一些数据之后，需要立刻备份而不是等待触发备份策略时，可以通过这种方式立即备份
        - 指令：
            - `save`
                - 该指令是**阻塞的**。在完成备份之前，无法想内存中写入数据
            - `bgsave`
                - 该指令是**异步的**。子进程进行备份时，仍然可以向内存中写入数据
    3. `flushall`指令
        - 使用`flushall`后会立刻清空内存，并写入到`dump.rdb`文件中，所以执行`flushall`指令前需要提前备份
    4. `shutdown`指令
        - 使用shutdown后，也会将内存的数据写入备份文件

- 可以通过`lastsave`命令获取最后一次成功执行备份的时间

- 如何利用`dump.rdb`文件来恢复
    - 冷还原
        1. 将`dump.rdb`文件放到`dir`属性指定的路径下
        2. 启动redis时，会读取`dump.rdb`到内存来还原数据库
    - 热还原
        - ??????

## AOF
[top](#catalog)
- Append Only File
- AOF的相关配置：[AppendOnlyMode](#AppendOnlyMode)
- AOF是什么
    - <label style="color:red">以日志的形式来记录每个写操作</label>
    - 通过记录Redis执行过的所有**写指令（读操作忽略）**。日志文件只能添加，不能修改。
    - Redis启动时会读取日志文件，然后重新构建数据，即**重新执行所有写指令来进行数据恢复**

- AOF的启动/修复/恢复
    - 正常aof文件的恢复：
        1. 启动：`appendonly yes`
        2. 将aof文件保存到`dir`属性中指定的目录下
        3. 恢复：重启redis，redis会自动加载aof文件并恢复数据
    - 异常aof文件的恢复
        1. 启动：`appendonly yes`
        2. 备份被脏写的aof文件
        3. 修复：`redis-check-aof --fix aof文件路径`
        4. 恢复：重启redis，redis会自动加载aof文件并恢复数据

- Rewrite重写
    - Rewrite是什么
        - AOF采用文件追加的方式，文件会越来越大，为了避免这种情况，增加了重写机制
        - 当AOF文件的大小超过设定的阀值时，Redis就会启动AOF文件的内容压缩，**只保留可恢复数据的最小指令集**，可以使用命令：`bgrewriteaof`
    - 重写的原理
        - 基本过程
            1. aof文件大小超过阀值
            2. fork一个新的进程
            3. **遍历新进程的内存中的数据，为每条数据生成一条Set语句**
            4. 生成的内存先写入临时文件，全部写完后在rename
        - 重写的原理与RDB类似
    - 如何触发Rewrite
        - Redis会记录上次重写时的aof文件大小，默认配置时当aof文件大小是上次rewrite后大小的一倍且文件大于64M时触发
            - 默认配置
                - `auto-aof-rewrite-percentage 100`
                - `auto-aof-rewrite-min-size 64mb`

## AOF和RDB的对比
[top](#catalog)
- AOF的优势
    - 可以配置同步方式：`appendfsync`
- AOF的劣势
    - 对于相同数据集的数据，aof文件要远大于rdb文件，且恢复速度aof也比rdb慢
    - aof的运行效率比rdb慢，每秒同步策略的效率较好，不同步时效率和rdb相同

## 使用建议
[top](#catalog)
- 如果redis只做缓存：如果数据只是在服务器运行的时候存在，可以不使用任何持久化方式
- 建议同时开启两种持久化方式
    - 同时开启时，redis重启后会优先载入aof文件来恢复原始数据。因为通常情况下aof文件保存的数据集要比rdb文件保存的数据集更加完整
    - rdb数据不实时，即使同时使用两者，服务器重启是也只会使用aof文件，那可不可以只使用aof？
        - **建议不要**
            1. rdb更适合用于备份数据库、快速重启，而且不会有aof可能潜在得到bug
            2. aof在不断变化不好备份

- 性能建议
    - 因为RDB文件只用做备份，建议只在Slave上持久化RDB文件，而且只要15分钟备份一次就够了，只保留`save 900 1`这一个备份策略即可
    - 如果使用AOF
        - 好处是**在最恶劣的情况下也只会丢失不超过2s的数据**。启动脚本简单，只load自己的AOF文件即可恢复。
        - 代价是：
            - 带来了持续的IO（`appendfsync always/everysec/no`）
            - rewrite的最后，将rewrite过程中产生的新数据写到新文件时会造成阻塞
        - 如果硬盘容量许可，应该尽量减少rewrite的频率
            - aof重写的触发条件太小了，可以把64M提升到5G、默认超过原大小100%可以适当调整
    - 如果不使用AOF，也可以靠主从复制来实现高可用
        - 可以节省IO和减少rewrite操作带来的系统波动
        - 代价是：
            1. 如果主从节点同时宕机，**会丢失十几分钟**的数据
            2. 启动脚本需要比较主从节点的RDB文件，载入较新的那个文件(新浪微博使用了这种架构)

# redis事务
## redis事务的介绍
[top](#catalog)
- redis事务是什么
    - 就是**批处理命令**。可以一次执行多个命令,本质是一组命令的集合
    - 一个事务中的所有命令都会序列化，按顺序的串行化执行，而**不会被其他命令插入**
- redis事务能做什么
    - 一个队列中，一次性、顺序性、排他性的执行一系列命令
- redis事务的3阶段
    1. 开启：以指令`multi`启动一个事务
    2. 入队：将多个命令添加到事务队列中，这些命令不会被立即执行
    3. 执行：通过`exec`命令触发事务

- redis事务的3大特性
    1. 单独隔离
        - 事务中的所有命令都会序列化、按顺序的执行。事务在执行的过程中，不会被其他命令打断
    2. 没有隔离级别
        - 事务队列中的命令在没有提交之前，都不会执行
        - 因为事务提交前任何命令都不会被执行，所以不存在**事务内的查询要看到事务里的更新，而事务外的查询无法看到事务内部的更新**
    3. 不保证原子性
        - 事务中的某个指令如果失败了，不会影响其他指令的执行，并且**没有回滚**

## redis事务的常用命令
[top](#catalog)

|命令|说明|
|-|-|
|`multi`|<ul><li>标记一个事物块的开始</li><li>指令执行后会返回ok，但只是代表redis接收到了指令，不表示执行成功</li><li>启动后，多个redis指令会全部入队，并顺序执行</li></ul>|
|`exec`|执行事务块中的所有指令|
|`discard`|取消事务，放弃执行事务块内的所有命令（**放弃当前批处理的所有操作**）|
|`watch key [key ...]`|<ul><li>监视一个或多个key</li><li>如果在事务执行之前，key被其他命令改动，则事务将被打断</li><li><label style="color:red">如果执行了`exec`，`multi`之前添加的监控锁都会被取消</label></li></ul>|
|`unwatch`|取消`WATCH`指令对**所有**key的监视|

## redis事务的使用分析
### 正常使用
[top](#catalog)
```
127.0.0.1:6379[5]> multi            启动事务
OK                                  redis接收指令，并返回OK
127.0.0.1:6379[5]> set k1 123       添加指令
QUEUED                              添加指令后，现实QUEUED，表示指令已经进入队列
127.0.0.1:6379[5]> set k2 234
QUEUED
127.0.0.1:6379[5]> get k2           除了写指令，也可以有读指令
QUEUED
127.0.0.1:6379[5]> exec             执行事务中的所有指令
1) OK
2) OK
3) "234"
127.0.0.1:6379[5]> mget k1 k2
1) "123"
2) "234"
127.0.0.1:6379[5]> 
```

### 放弃事务
[top](#catalog)
```
127.0.0.1:6379[5]> multi            启动事务
OK
127.0.0.1:6379[5]> set k1 qwer      添加指令
QUEUED                              指令入队
127.0.0.1:6379[5]> set k2 zxcv
QUEUED
127.0.0.1:6379[5]> discard          放弃事务
OK
127.0.0.1:6379[5]> mget k1 k2       key对应的value没有被修改
1) "123"
2) "234"
127.0.0.1:6379[5]> 
```

### 全体连坐
[top](#catalog)
- 添加指令的过程中如果出现了异常，则执行`exec`时，**全部指令失效**
    ```
    127.0.0.1:6379[5]> multi            启动事务
    OK
    127.0.0.1:6379[5]> set k1 11111     添加指令
    QUEUED
    127.0.0.1:6379[5]> set k2 22222
    QUEUED
    127.0.0.1:6379[5]> set k3 33333
    QUEUED
    127.0.0.1:6379[5]> set k4 44444
    QUEUED
    127.0.0.1:6379[5]> setget k4        添加一个错误的指令，并显示异常
    (error) ERR unknown command `setget`, with args beginning with: `k4`, 
    127.0.0.1:6379[5]> set k5 55555     继续添加指令
    QUEUED
    127.0.0.1:6379[5]> exec             执行事务中的所有指令。
    (error) EXECABORT Transaction discarded because of previous errors.                     因为添加指令时发生了异常，所以事务被
    127.0.0.1:6379[5]> get k1
    "123"
    127.0.0.1:6379[5]> 
    ```

### 冤头债主
[top](#catalog)
- 有些指令在输入到事务队列时，不会产生异常，但是执行时会产生异常。这种情况下有异常的指令影响数据，其他指令会正常执行
    ```
    127.0.0.1:6379[5]> get k1
    "aaa"
    127.0.0.1:6379[5]> multi                启动事务
    OK
    127.0.0.1:6379[5]> incr k1              做k1+1，但是k1的值是字符串，但是添加到事务时不会报错
    QUEUED
    127.0.0.1:6379[5]> set k2 zzzzz         继续添加指令
    QUEUED
    127.0.0.1:6379[5]> set k3 vvvvv
    QUEUED
    127.0.0.1:6379[5]> set k6 bbbbb
    QUEUED
    127.0.0.1:6379[5]> exec                 执行指令，incr k1会产生异常，无法执行，但是其他指令会正常执行
    1) (error) ERR value is not an integer or out of range
    2) OK
    3) OK
    4) OK
    127.0.0.1:6379[5]> get k2
    "zzzzz"
    127.0.0.1:6379[5]> get k3
    "vvvvv"
    127.0.0.1:6379[5]> get k1
    "aaa"
    127.0.0.1:6379[5]> 
    ```
### watch监控
[top](#catalog)
- 悲观锁/乐观锁/CAS(Check And Set)
    - 悲观锁，Pessimistic Lock
        - 默认每次拿数据时别人都会修改，所以**每次拿数据时都会上锁**。其他人在使用时会被阻塞知道拿到锁
        - 传统的关系型数据库中就用到了很多这种锁机制，如：
            - 行锁
            - 表锁
            - 读锁
            - 写锁

    - 乐观锁，Optimistic Lock
        - 默认每次拿数据时别人不会修改，**所以不会上锁**。但是在更新时会判断一下在此期间有没有人更新过当前数据
        - 可以使用版本号策略
            - 核心策略：<label style="color:red">提交版本必须大于当前版本才能执行更新</label>
            - 该策略在每一条数据后面添加一个字段`Version`，每次修改时都会在该字段的基础上`+1`
            - 当两个人同时操作，但不同时提交时，第一个人提交后会将`Version+1`，第二个人再提交时，由于`Version`值和当前数据库中的值不同，自会导致异常，需要重新从数据库中获取数据并重新修改
        - 乐观锁适用于多读的应用类型，这样可以提高吞吐量

- `watch`指令类似**乐观锁**。当事务提交了，如果Key的值已经被其他的客户端修改，则整个事务队列都不会被执行
- 当`watch`命令在`nulti`执行之前监控了多个key时，如果`watch`的key有任何变化，`exec`命令执行的事务都将被放弃，同时返回`nil`表示事务执行失败

- watch监控示例
    1. 初始化信用卡可用余额
        ```
        127.0.0.1:6379[5]> set balance 100      设置金额
        OK
        127.0.0.1:6379[5]> set debt 0           设置欠款
        OK
        ```
    2. 无加塞篡改，先用`watch`监控再开启`multi`，保证两笔金额变动在同一个事务内
        ```
        127.0.0.1:6379[5]> watch balance
        OK
        127.0.0.1:6379[5]> multi
        OK
        127.0.0.1:6379[5]> DECRBY balance 20
        QUEUED
        127.0.0.1:6379[5]> INCRBY debt 20
        QUEUED
        127.0.0.1:6379[5]> exec
        1) (integer) 80
        2) (integer) 20
        127.0.0.1:6379[5]>  
        ``
    3. `watch`防止有加塞篡改数据
        - 第一个用户进行`watch` key
            ```
            127.0.0.1:6379[5]> get balance
            "80"
            127.0.0.1:6379[5]> watch balance
            OK
            127.0.0.1:6379[5]> 
            ```
        - 第二个用户对key进行修改
            ```
            127.0.0.1:6379[5]> set balance 500
            OK
            127.0.0.1:6379[5]> get balance
            "500"
            127.0.0.1:6379[5]> 
            ```
        - 第一个用户继续启动事务，操作金额
            ```
            127.0.0.1:6379[5]> get balance          已经可以观察到数据的修改
            "500"
            127.0.0.1:6379[5]> multi                启动事务
            OK
            127.0.0.1:6379[5]> DECRBY balance 30    修改金额
            QUEUED
            127.0.0.1:6379[5]> INCRBY debt 30
            QUEUED
            127.0.0.1:6379[5]> exec                 执行事务
            (nil)                                   执行失败
            127.0.0.1:6379[5]> get balance
            "500"
            127.0.0.1:6379[5]> get debt
            "20"
            127.0.0.1:6379[5]> 
            ```
        - `unwatch`解除对所有key的监控
            ```
            127.0.0.1:6379[5]> unwatch              放弃对key的监视，重新获取数据
            OK
            127.0.0.1:6379[5]> multi                启动事务
            OK
            127.0.0.1:6379[5]> set balance 80       添加指令
            QUEUED
            127.0.0.1:6379[5]> set debt 20
            QUEUED
            127.0.0.1:6379[5]> exec                 执行事务
            1) OK                                   事务执行成功
            2) OK
            127.0.0.1:6379[5]> get balance          数据被还原
            "80"
            127.0.0.1:6379[5]> get debt
            "20"
            127.0.0.1:6379[5]> 
            ```

# 消息发布与订阅
[top](#catalog)
- redis的消息发布与订阅 是什么
    - 进程间的一种消息通信模式：发送者(pub)发送消息，订阅者(sub)接收消息
    - 原理图
        - channel1以及订阅这个channel的三个客户端：client1、client2、client5之间的关系
            - [](?????)

        - 当有新的消息通过PUBLISH命令发送给频道channel1时，这个消息就会发送给订阅该channel的三个客户端

- **实际开发中很少使用redis来做消息中间件**

- 相关命令

    |命令|序号|
    |-|-|
    |`psubscribe pattern [pattern..]`|订阅一个或多个符合给定模式的channel|
    |`pubsub subcommand [arg...]`|查看订阅与发布系统状态|
    |`publish channel message`|将消息发送到指定的channel|
    |`punsubscribe [pattern...]`|退订所有给定模式的channel|
    |`subscribe channel [channel...]`|订阅给定的一个或多个channel|
    |`unsubscribe channel [channel...]`|退订指定的channel|

- 使用示例
    - 先订阅后发布，才能收到消息
    - 订阅多个
        - 可以一次性订阅多个channel：`subscribe c1 c2 c3`
            ```
            127.0.0.1:6379[5]> SUBSCRIBE c1 c2 c3
            Reading messages... (press Ctrl-C to quit)
            1) "subscribe"
            2) "c1"
            3) (integer) 1
            1) "subscribe"
            2) "c2"
            3) (integer) 2
            1) "subscribe"
            2) "c3"
            3) (integer) 3
            ```

        - 消息发布：`publish c2 testmsg`
            ```
            127.0.0.1:6379[5]> PUBLISH c2 testmsg
            (integer) 1
            ```
            ```
            1) "message"
            2) "c2"
            3) "testmsg"
            ```
    - 通过通配符来订阅
        - 订阅多个，通配符`*`，`psubscribe new*`
            ```
            127.0.0.1:6379> psubscribe new*
            Reading messages... (press Ctrl-C to quit)
            1) "psubscribe"
            2) "new*"
            3) (integer) 1
            ```
        - 接收消息，`publish new1 helloWorld`
            ```
            127.0.0.1:6379[5]> PUBLISH new1 helloWorld
            (integer) 1
            127.0.0.1:6379[5]> PUBLISH new12 helloWorld
            (integer) 1
            127.0.0.1:6379[5]> 
            ```
            ```
            1) "pmessage"
            2) "new*"
            3) "new1"
            4) "helloWorld"
            1) "pmessage"
            2) "new*"
            3) "new12"
            4) "helloWorld"
            ```

# 主从复制
## 主从复制的基本概念
[top](#catalog)
- 主从复制是什么
    - `master/slaver机制`:主机数据更新后根据配置和策略，自动同步到备机
    - **Master以写为主，Slave以读为主**

- 主从复制的主要功能
    - 读写分离  
        - 只能减少读写压力，无法减少内存压力
    - 容灾备份，快速恢复

## 主从复制的基本使用
[top](#catalog)
- 配置方式
    1. 配从不配主
        - 查看个库的状态：`info replication`
        - 如果没有配置，每个库启动时默认就是主库，通过指令挂载其他库来创建主从关系
    2. 从库配置：
        - 绑定主库指令：`slaveof 主库IP 主库端口`
        - 如果没有配置redis.conf文件，每次与master断开之后，都需要重新连接
    3. 修改主库和从库的配置文件
        - 拷贝多个`redis.conf`文件
        - 启动守护线程：`daemonize yes`
            - 如果是通过docker启动需要设置：`daemonize no`
        - 指定端口：`port XXXX`
        - 配置Pid文件: `pidfile /var/run/redis_6379.pid`
        - 配置redis的日志文件: `logfile /.../log_6379.log`
        - 配置RDB备份文件: `dbfilename dump6379.rdb`
        - 如果启动了aof，配置aof的日志文件：`appendfilename "appendonly6379.aof"`
- 相关的配置内容示例
    ```
    daemonize no
    port 6379
    logfile /var/run/log_6379.log
    dbfilename dump6379.rdb
    dir /data/
    appendonly no
    ```
- 常用3种主从复制的形式
    1. 1主2仆
        - 主库可以读写(set/get)，从库只能读(get)
        - 如果主库挂了，从库会原地待命
        - 如果主库挂了，并重新启动了主库，在主库上新增记录时，可以继续同步到从库
        - 如果从库挂了，重新连接master后，会重新执行一次全量复制，仍然与master同步
    2. 薪火相传
        - 目的是：**减轻master的写压力，去中心化降低风险**
        - 上一个slave可以是下一个slave的Master，slave同样可以接收其他slave的连接和同步请求，那么该salve作为链条中下一个master可以有效减轻master的写压力
        - 如果中途变更主从关系：从库会清除之前的数据，重新拷贝最新的数据
        - `slaveof 新主库IP 新主库端口`
        - 缺点：**如果中间的某个slave挂了，则后面的其他slave都无法备份**
    3. 反客为主
        - `slaveof no one`，使当前数据库停止与其他数据库的同步，转成主数据库
        - 如果是薪火相传的形式，则主库挂了，通过该指令可以使下一级从库成为主库

- 示例：
    - 在docker中启动三个容器
        - ![masterSlaveCopy01](imgs/masterSlave/masterSlaveCopy01.png)
    - 1主2仆
        - 6379是主库，6380、6381是从库
        - 在主库中输入数据，从库也会进行同步，但是无法写入，只能读取
            - ![masterSlaveCopy02](imgs/masterSlave/masterSlaveCopy02.png)
        - 关闭主库，从库会原地待命，并且详细信息中显示主库的状态是`down`
            - ![masterSlaveCopy03](imgs/masterSlave/masterSlaveCopy03.png)
        - 重新在主库中添加数据，将继续同步到从库中
            - ![masterSlaveCopy04](imgs/masterSlave/masterSlaveCopy04.png)
    - 薪火相传
        - 三个redis库的关系：`6379<--6380<--6381`
            - ![masterSlaveCopy05](imgs/masterSlave/masterSlaveCopy05.png)
        - 两个从库不能写只能读，主库写入数据后，会依次同步
            - ![masterSlaveCopy06](imgs/masterSlave/masterSlaveCopy06.png)
        
## 主从复制的原理
[top](#catalog)
- 复制流程
    - 建立主从关系
    - slave成功连接到master后，slave给master发送一个sync命令
    - master接到命令后立刻进行备份操作，并将RDB文件发送给slave ????
    - 同步之后，每次master的写操作都会立刻发送给slave，slave执行相同的命令

- 复制的方式
    - 全量复制：slave服务在接收到数据库文件后，将其存盘并加载到内存
    - 增量复制：Master继续将新的收集到的修改命令依次传给slave，完成同步

- 只要重新连接master，会自动执行一次全量复制

- 复制的缺点
    - 由于所有的写操作都是现在master上操作，然后同步更新到slave上，所以master同步到slave机器有一定的延迟，当系统很繁忙的时候，延迟问题会更加严重，slave机器数量的增加也会是这个问题更加严重

## 哨兵模式
[top](#catalog)
- 哨兵模式是什么
    - 是反客为主的自动版，能够后台监控主机是否故障，如果故障了根据投票数自动将从库转换为主库
    - 哨兵模式是建立在主从复制的基础上的
- 使用方法
    - 调整结构：6379+80、81
    - 目录下新建`sentinel.conf`文件（名字不能错）
    - 配置哨兵
        - sentinel monitor 被监控数据库的名字 127.0.0.1 6379 1
        - 最后的数字`1`表示：主机挂掉后slave投票选主机时，得票数多少后成为主机
        - 1表示至少有多少个哨兵同意迁移的数量
    - 启动哨兵
        - redis-sentinel /.../sentinel.conf
    - 正常主从演示
    - 原有的master改了
    - 投票选新
    - 重新主从继续开工，`info replication`查看
    - 问题：如果之前的master重启，会不会导致两个master冲突
        - 之前的master会变成slave
- 一组sentimel能同时监控多个Master

# 总结
[top](#catalog)
- 登录 : `auth 密码`
- 切换DB : `select DB索引`

|命令|作用|示例|
|-|-|-|
|select 数据库编号|切换数据库|`select 7`，切换到7号库|
|dbsize|查看当前数据库**key的数量**||
|flushdb|清空当前数据库||
|flushall|清空所有数据库||


* redis安装后，默认有16个数据库0~15
* Redis的五大数据类型：
    * String 字符串
        * 一个key对应一个value
        * 二进制安全的
        * 除了字符串，还可以存放图片数据
        * 字符串value最大是512M
    * Hash 哈希
        * 一个hash对应一个键值对集合，字段不可以重复
        * 一个string类型的field和value的映射表
        * 适合存储对象
    * List 列表
        * 列表是简单的字符串列表
        * 按照插入顺序排序
        * 可以在头部或尾部添加元素
        * 本质是链表
        * 列表有序、可以重复
        * <label style="color:red">如果所有元素都被移除了，对应都键会消失</label>
    * Set 集合
        * Set是string类型的无序集合
        * 底层是HashTable数据结构，set可以存放很多字符串元素，且元素无序不重复
    * zset (sorted set) 有序集合
* 基本操作
    * 添加key：`set key value`
    * 查看当前redis的所有key: `keys *`
    * 获取key对应的值：`get key`
    * 查看当前数据库的key-val数量：`dbsize`
    * 清空当前数据库：`flushdb`
    * 清空所有数据库：`flushall`
* string-CRUD操作
    * set：key存在=修改，key不存在=添加
    * get：取得
    * del：删除
    * setex(set with expire)：`setex key time value`超时删除key
    * mset key value [key value ...] 一次性设置多个key value
    * mget key [key...] 一次性获取多个value
* hash-CRUD操作
    * `hset key field value`，添加，可以重复对一个key添加多个字段
    * `hget key field` 查询
    * `hgetall key` 查询所有字段
    * `hdel key` 删除
    * `hmset key field value [field value ...]` 对一个key一次性添加多个字段
    * `hmget key filed [field ...]`查询一个key的多个字段
    * `hlen key` 查询有多少个字段
    * `hexists key fidle` 检查是否存在指定字段
* list-CRUD操作
    * `lpush key node....` 从左边添加
        * `lpush key a b c` 链表的内存结构 c-->b-->a，即从左边添加
    * `rpush key node....` 从右边添加
    * `lrange key start end` end=-1/-2... 表示取到最后一个/取到倒数第二个
    * `lpop key` 从左侧弹出一个数据
    * `rpop key` 从右侧弹出一个数据
    * `del key` 删除key-value
    * `lindex key index` 使用索引获取元素，如果index越界，则返回nil
    * `llen key` 返回list的长度，如果key不存在，key被解释为空列表，返回0
* set-CRUD操作
    * `sadd key value [value...]` 添加元素
    * `smembers emails` 从集合中取出所有元素
    * `sismember key value` 判断是否是集合成员
    * `srem key value` 删除某个元素

- 可以通过`lastsave`命令获取最后一次成功执行备份的时间

[top](#catalog)
