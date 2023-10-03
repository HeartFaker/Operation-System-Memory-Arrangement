
// 定义程序所需的变量如下
const memory_blocks = 4 //内存块数
const sumIns = 320 //总指令数
const insPerPage = 10 //每页存放指令数
const sumPages = 32  //总页数
var insCount = 0 // 记录执行的指令个数
var sequentialIns = []; // 辅助生成指令序列
var randomIns = []; // 辅助生成指令序列
var pageSequence = [] //指令序列
var memory = [] // 表示内存
var memIns = [] // 每个内存中当前的指令
var missingPageFIFO = 0 // FIFO算法执行下的缺页个数
var missingPageLRU= 0 // LRU算法执行下的缺页个数
var Record = []

//指令执行方式
//执行下一条指令，且上一步是向下跳转，循环起始点
const downward = 1
//执行下一条指令，且上一步是向上跳转
const upward = 2
//跳转到0——m-1中随机一条
const ran1 = 3
//跳转到m+2——319中随机一条
const ran2 = 4

//寻找空内存块
function IsLeisure() {
    for(let i = 0; i < memory.length; ++i){
        //返回第一个空内存块
        if(memory[i] === undefined){
            return i; 
        }
    }
    //全部已满
    return -1; 
}

//判断指令是否已经在内存中
function IsInside(ins) {
    for (let i = 0; i < memory.length; ++i) {
        var pageNum = Math.floor(ins / insPerPage)
        // 指令已经在内存中
        if (pageNum === memory[i]) {
            return -1 
        }
    }
    //不在内存中则返回页号
    return pageNum 
}

//生成指令序列
function MakeSequence(){
    //50%顺序执行
    var sequentialInsCount = Math.round(sumIns * 0.5);
    var randomInsCount = Math.round(sumIns * 0.25);
    // 生成顺序执行的指令序列
    for (var i = 0; i < sequentialInsCount; i++) {
        sequentialIns.push(i);
    }
    // 生成前地址均匀分布的指令序列
    for (var i = 0; i < randomInsCount; i++) {
    var randomIndex = Math.round(Math.random() * (sumIns - 1));
    randomIns.push(randomIndex);
    }
    // 合并顺序执行和随机执行的指令序列
    var midSequence = sequentialIns.concat(randomIns);
    randomIns = []
    // 生成后地址均匀分布的指令序列
    for (var i = 0; i < randomInsCount; i++) {
    var randomIndex = Math.round(Math.random() * (sumIns - 1)) + (sumIns - randomInsCount);
    randomIns.push(randomIndex);
    }
    // 合并顺序执行和随机执行的指令序列
    pageSequence = randomIns.concat(midSequence);
    console.log(pageSequence)
}

//寻找最久未访问的内存块号
function FindPos(){
    var block0 = Record[memory[0]]
    var block1 = Record[memory[1]]
    var block2 = Record[memory[2]]
    var block3 = Record[memory[3]]
    var min = Math.min(block0,block1,block2,block3)
    for(let i = 0; i < memory_blocks; i++){
        if(Record[memory[i]] === min){
            return i
        }
    }
}

async function FIFO(mode){
     //选择FIFO缺页数量控件
    var FIFO_missPageSpan = document.getElementById("FIFOMissPage")
    //FIFO缺页率控件
    var FIFO_missPageRateSpan = document.getElementById("FIFOMissingRate") 
    //指向内存中最先进入内存的页面
    var old = 0 
    //指令执行方向
    var direction = downward 
     //当前指令
    var ins = -1 
    //发生缺页置1
    var pageFault = 0 
    //空内存
    var leisure = -1
    //第一条执行的指令
    ins = Math.round( Math.random() * (sumIns  - 1) )
    while( insCount < pageSequence.length ){
        var currentIns = ins  //记录本次循环执行的指令
        pageFault = 0 
        leisure = -1
        //按要求实现指令跳转
        if(direction === downward){
             ins++ 
             direction = ran1
        }
        else if(direction === ran1){
            if (ins < 2) {
                continue
            }
            ins = Math.floor(Math.random() * (ins - 1))
            direction = upward
        }
        else if(direction === upward){
            ins++
            direction=ran2
        }
        else if(direction === ran2){
            if (ins > sumIns - 2) {
                continue
            }
            ins = Math.floor(Math.random() * (sumIns - (ins + 2)) + (ins + 2))
            direction = downward
        }
        //因为执行是随机选取指令，因此需要设置错误处理来纠正
        if (ins < 0) {
            ins = -1
            direction = ran2
            continue
        } else if (ins >= sumIns) {
            ins = sumIns + 1
            direction = ran1
            continue
        }

        if(IsInside(currentIns) !== -1){
            //当前指令不在内存中，发生缺页
            pageFault = 1
            if(IsLeisure() !== -1){
                //还有空的内存块
                leisure = IsLeisure()
                memory[IsLeisure()] = Math.floor(currentIns / insPerPage)
                memIns[IsLeisure()] = currentIns
            }
            else{
                //内存块已经占满
                memory[old] = Math.floor(currentIns / insPerPage)
                memIns[old] = currentIns
                old = ( ++old ) % 4
                FIFO_missPageSpan.textContent = missingPageFIFO
                FIFO_missPageRateSpan.textContent = missingPageFIFO / sumIns
            }
            missingPageFIFO++ 
        }
        insCount++

        // 每一个内存块显示
        var pageNumber1 = document.getElementById('page-number1');
        pageNumber1.textContent =  memory[0] == undefined ? "Empty" : memory[0]
        var insNumber1 = document.getElementById('instruction-number1');
        insNumber1.textContent =  memIns[0]

        var pageNumber2 = document.getElementById('page-number2');
        pageNumber2.textContent =  memory[1] == undefined ? "Empty" : memory[1]
        var insNumber2 = document.getElementById('instruction-number2');
        insNumber2.textContent =  memIns[1]

        var pageNumber3 = document.getElementById('page-number3');
        pageNumber3.textContent =  memory[2] == undefined ? "Empty" : memory[2]
        var insNumber3 = document.getElementById('instruction-number3');
        insNumber3.textContent =  memIns[2]

        var pageNumber4 = document.getElementById('page-number4');
        pageNumber4.textContent =  memory[3] == undefined ? "Empty" : memory[3]
        var insNumber4 = document.getElementById('instruction-number4');
        insNumber4.textContent =  memIns[3]

        //界面显示
        var row = document.getElementById("memory_table").insertRow()
        row.insertCell(0).innerHTML ="No." + insCount
        row.insertCell(1).innerHTML ="Ins." + currentIns
        row.insertCell(2).innerHTML = 
            memory[0] == undefined ? "空闲" : memory[0]
        row.insertCell(3).innerHTML =
            memory[1] == undefined ? "空闲" : memory[1]
        row.insertCell(4).innerHTML =
            memory[2] == undefined ? "空闲" : memory[2]
        row.insertCell(5).innerHTML =
            memory[3] == undefined ? "空闲" : memory[3]
        if(pageFault === 1){
            if(leisure !== -1){
                row.insertCell(6).innerHTML = "发生缺页，调入第" + ((leisure)+1) + "个内存块"
            }else{
                row.insertCell(6).innerHTML = "发生缺页，调入第" + ((old-1 >= 0 ? old -1 :3)+1) + "个内存块"
            }
            
        }else{
            row.insertCell(6).innerHTML = currentIns + "号指令已在内存中" 
        }
        if(mode==0){
            await new Promise(resolve => setTimeout(resolve, 1500)); // 停顿1.5秒
        }
    }
}

async function LRU(mode){
    //选择LRU缺页数量控件
    var LRU_missPageSpan = document.getElementById("LRUMissPage") 
    //选择LRU缺页率控件
    var LRU_missPageRateSpan = document.getElementById("LRUMissingRate")
    Record = new Array(sumPages) 
    //指令执行方向
    var direction = downward 
    //当前指令
    var ins = -1  
    //标注缺页
    var pageFault = 0 
    var pos
    //确定第一条执行的指令
    ins = Math.round( Math.random() * (sumIns  - 1) )
    while( insCount < sumIns ){
        var currentIns = ins  //记录本次循环执行的指令
        pageFault = 0
        pos = -1
        //按要求实现指令跳转
        if(direction === downward){
            ins++ 
            direction = ran1
       }
       else if(direction === ran1){
           if (ins < 2) {
               continue
           }
           ins = Math.floor(Math.random() * (ins - 1))
           direction = upward
       }
       else if(direction === upward){
           ins++
           direction=ran2
       }
       else if(direction === ran2){
           if (ins > sumIns - 2) {
               continue
           }
           ins = Math.floor(Math.random() * (sumIns - (ins + 2)) + (ins + 2))
           direction = downward
       }
       //因为执行是随机选取指令，因此需要设置错误处理来纠正
       if (ins < 0) {
           ins = -1
           direction = ran2
           continue
       } else if (ins >= sumIns) {
           ins = sumIns + 1
           direction = ran1
           continue
       }

        if(IsInside(currentIns) !== -1){
            //当前指令不在内存中，发生缺页
            pageFault = 1
            if(IsLeisure() !== -1){
                //还有空的内存块
                pos = IsLeisure()
                memory[IsLeisure()] = Math.floor(currentIns / insPerPage)
                memIns[IsLeisure()] = currentIns
            }
            else{
                //内存块已经占满
                pos = FindPos()
                memory[pos] = Math.floor(currentIns / insPerPage)
                memIns[pos] = currentIns
                LRU_missPageSpan.textContent = missingPageLRU
                LRU_missPageRateSpan.textContent = missingPageLRU / sumIns
            }
            missingPageLRU++ 
        }
        insCount++
        Record[Math.floor(currentIns / insPerPage)] = insCount

        // 每一个内存块显示
        var pageNumber1 = document.getElementById('page-number1');
        pageNumber1.textContent =  memory[0] == undefined ? "Empty" : memory[0]
        var insNumber1 = document.getElementById('instruction-number1');
        insNumber1.textContent =  memIns[0]

        var pageNumber2 = document.getElementById('page-number2');
        pageNumber2.textContent =  memory[1] == undefined ? "Empty" : memory[1]
        var insNumber2 = document.getElementById('instruction-number2');
        insNumber2.textContent =  memIns[1]

        var pageNumber3 = document.getElementById('page-number3');
        pageNumber3.textContent =  memory[2] == undefined ? "Empty" : memory[2]
        var insNumber3 = document.getElementById('instruction-number3');
        insNumber3.textContent =  memIns[2]

        var pageNumber4 = document.getElementById('page-number4');
        pageNumber4.textContent =  memory[3] == undefined ? "Empty" : memory[3]
        var insNumber4 = document.getElementById('instruction-number4');
        insNumber4.textContent =  memIns[3]
        
        //界面显示
        var row = document.getElementById("memory_table").insertRow()
        row.insertCell(0).innerHTML ="No." + insCount
        row.insertCell(1).innerHTML ="Ins." + currentIns
        row.insertCell(2).innerHTML = 
            memory[0] == undefined ? "空闲" : memory[0]
        row.insertCell(3).innerHTML =
            memory[1] == undefined ? "空闲" : memory[1]
        row.insertCell(4).innerHTML =
            memory[2] == undefined ? "空闲" : memory[2]
        row.insertCell(5).innerHTML =
            memory[3] == undefined ? "空闲" : memory[3]
        if(pageFault === 1){
            row.insertCell(6).innerHTML = "发生缺页，调入第" + (pos+1) + "个内存块"
        }else{
            row.insertCell(6).innerHTML = currentIns + "号指令已在内存中" 
        }
        if(mode==0){
            await new Promise(resolve => setTimeout(resolve, 1500)); // 停顿1.5秒
        }
    }
}

//点击按钮模拟过程函数
function start(mode) {
    //初始化
    memory = new Array(memory_blocks) //内存块
    PageTable = new Array(sumPages) //页表
    pageSequence = new Array(sumIns) //指令序列
    insCount = 0 // 记录执行的指令个数
    MakeSequence() //随机生成指令序列
    // 每次都重置table
    $("#memory_table  tr:not(:first)").hide()
    // 选择算法
    //alert(0)
    var select = document.getElementById("alg-select");
    var selectedOption = select.options[select.selectedIndex].value;
    if(selectedOption == "FIFO"){
        //alert(1)
        FIFO(mode)
    }
    else if(selectedOption == "LRU"){
        //alert(2)
        LRU(mode)
    }
}