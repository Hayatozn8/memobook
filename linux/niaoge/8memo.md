* Linux 常见压缩指令
    * 常见压缩文件扩展名：
        * Z=compress程序压缩的文件
        * zip=zip程序压缩的文件
        * gz=gzip压缩的文件
        * bz2=bzip2压缩的文件
        * xz=xz程序压缩的文件
        * tar=tar程序打包的数据，没有压缩过
        * tar.gz=tar程序打包的数据，经过gzip压缩
        * tar.bz2=tar程序打包的文件，经过bzip2压缩
        * tar.xz=tar程序打包的文件，经过xz压缩
    * gzip
        * 可以解开compress，zip，gzip等软件压缩的文件
        * 文件扩展名=gz
        * gzip [#] [-cdtv] 文件/目录
            * option
                * c=将压缩数据显示到屏幕，可通过数据流重定向来处理，需要配合`>`来使用
                    * 压缩是保留源文件：gizp -c xxx > xxx.gz
                * d=解压文件
                * t=检验压缩文件的一致性（有无错误）
                * v=显示出源文件/压缩文件的压缩比等信息
                * #=数字，代表压缩等级；1=最快，压缩比差；9=最慢，压缩比最好；预设是6
            * 默认会将文件压缩成gz
            * 压缩后文件就不存在了
        * 读取压缩的内容
            * zcat xxx.gz
            * 如果原文件是文本文件，可以使用该指令来读取
            * zcat/zmore/zloss
        * 解压缩
            * gzip -d xx.gz
            * 使用后会将压缩文件删除
        * gzip取代compress，compress压缩的文件gzip也能解压，zcat可以读取compress和gzip压缩文件
        * egrep，不解压，从文字压缩问价中搜索
    * bzip2 取代gzip提供更好的压缩比
        * bzip2比gzip要花更多的时间
        * bzip2 [#][cdkzv] 文件/目录
            * option
                * c=将压缩数据显示到屏幕
                * d=解压文件
                * k=保留源文件
                * z=压缩参数（默认值，可以不加）
                * v=显示出源文件/压缩文件的压缩比等信息
                * #=数字，代表压缩等级；1=最快，压缩比差；9=最慢，压缩比最好
        * bzcat xx.bz2
            * 读取压缩文件内容
        * bzcat/bzmore/bzless/bzgrep
    * xz 提供更高的压缩比
        * xz [#] [dtlkc] 文件/目录
            * c=将压缩数据显示到屏幕
            * d=解压缩
            * t=测试文件的完整性
            * l=列出压缩文件的相关信息
            * k=保留文件不删除
            * v=显示出源文件/压缩文件的压缩比等信息
            * #=压缩比
* 打包指令
    * 打包：tar [z|j|J] [cv] [f 新包名] 被压缩的文件或目录(可以接多个)
        * c=打包文件
        * 只打包时不加zjJ
        * --newer-mtime='yyyy/MM/dd' 仅备份新的文件
    * 查看文件名：tar [z|j|J] [tv] [f 已有包名]
        * t=查看打包文件有那些文件名
    * 解压：tar [z|j|J] [xv] [f 已有包名] [C 目录]|[包内文件名]
        * x=解压
        * C=解压到特定目录
        * 再包名后，加包内文件名，可以进行单一文件的解压
    * v=在处理过程中，将正在处理的文件名显示出来
    * z=通过gzip进行压缩/解压缩，扩展名最好为：tar.gz
    * j=通过bzip进行压缩/解压缩，扩展名最好为：tar.bz2
    * J=通过xz进行压缩/解压缩，扩展名最好为：tar.xz
    * p=保留源文件的权限与属性，常用语备份重要的配置文件
    * P=压缩包中的文件默认没有根目录，通过P在压缩时加入根目录；加入根目录后，再解压时，会覆盖原目录下的文件
    * --exclude=FILE, 再压缩的过程中排除FILE

    
            