//表格对象
function Mine(tr, td, mineNum) {
    this.tr = tr;//行数
    this.td = td;//列数
    this.mineNum = mineNum;//地雷数目

    this.squares = [];//用于存储每个方块的二维数组
    this.tdDom = [];//用于存储每个方块的DOM操作
    this.gameFlag = false;//游戏结束的标示，当为true的时候游戏通关
    this.surplusNum = mineNum;//剩余地雷数目
    this.mineFlags = 0;//标记标对的地雷数

    this.parent = document.querySelector(".gameBox");
    this.good = document.querySelector('.none');
}

//初始化方法
Mine.prototype.init = function () {
    // console.log(this.randomNum());
    var arr = this.randomNum();//生成随机地雷数目
    var n = 0;//标记
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            if (arr.indexOf(n++) != -1) {
                this.squares[i][j] = {
                    type: 'mine',
                    x: j,
                    y: i
                }
            } else {
                this.squares[i][j] = {
                    type: 'number',
                    x: j,
                    y: i,
                    value: 0
                }
            }
        }
    }

    this.uploadNum();
    this.createDom();
    //取消表格鼠标右键点击事件
    this.parent.oncontextmenu = function () {
        return false;
    }

    this.surplusNumDom = document.querySelector(".mineNum");
    this.surplusNumDom.innerHTML = this.mineNum;
}

//初始化表格
Mine.prototype.createDom = function () {
    var that = this;
    var table = document.createElement('table');

    for (var i = 0; i < this.tr; i++) {
        var domTr = document.createElement('tr');
        this.tdDom[i] = [];

        for (var j = 0; j < this.td; j++) {
            var domTd = document.createElement('td');
            //添加表格DOM坐标
            domTd.pos = [i, j];
            //添加表格鼠标点击事件
            domTd.onmousedown = function (e) {
                that.play(e, this);
            }

            this.tdDom[i][j] = domTd;

            //添加雷跟数字
            // if(this.squares[i][j].type == 'mine'){
            //     domTd.className = 'mine';
            // }
            // if(this.squares[i][j].type == 'number'){
            //     domTd.innerHTML = this.squares[i][j].value;
            //     // domTd.className = 'flags';
            // }

            domTr.append(domTd);
        }

        table.append(domTr);
    }
    //切换难度清除原先table
    this.parent.innerHTML = '';
    this.parent.append(table);
}

//获取随机雷数组
Mine.prototype.randomNum = function () {
    var array = new Array(this.tr * this.td);
    for (var i = 0; i < array.length; i++) {
        array[i] = i;
    }
    array.sort(function () {
        return 0.5 - Math.random();
    });
    return array.slice(0, this.mineNum);
}

//获取方块周围坐标
Mine.prototype.getAround = function (square) {
    var x = square.x;
    var y = square.y;
    var result = [];

    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (
                i < 0 ||
                j < 0 ||
                i > this.td - 1 ||
                j > this.tr - 1 ||
                (i == x && j == y) ||
                this.squares[j][i].type == 'mine'
            ) {
                continue;
            }
            result.push([j, i]);
        }
    }
    return result;
}

//更新雷周围的数字
Mine.prototype.uploadNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            var num = this.getAround(this.squares[i][j]);
            for (var k = 0; k < num.length; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
}

//鼠标点击执行函数
Mine.prototype.play = function (ev, obj) {
    var that = this;
    //鼠标点击左键并且不是插有红旗标志的方格触发事件
    if (ev.which == 1 && obj.className != 'flags') {
        // console.log(obj.pos[0],obj.pos[1]);
        var tabSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var arr = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
        // console.log(tabSquare);
        if (tabSquare.type == 'number') {
            obj.innerHTML = tabSquare.value;
            obj.className = arr[tabSquare.value];

            if (tabSquare.value == 0) {
                obj.innerHTML = '';

                function getZero(square) {
                    var result = that.getAround(square);
                    for (var i = 0; i < result.length; i++) {
                        var x = result[i][0];
                        var y = result[i][1];
                        that.tdDom[x][y].className = arr[that.squares[x][y].value];

                        if (that.squares[x][y].value == 0) {
                            if (!that.squares[x][y].check) {
                                that.squares[x][y].check = true;
                                getZero(that.squares[x][y]);
                            }
                        } else {
                            that.tdDom[x][y].innerHTML = that.squares[x][y].value;
                        }
                    }
                }
                getZero(tabSquare);
            }
        } else {
            // obj.className = 'mine';
            this.gameOver(obj);
            obj.style.backgroundColor = 'red';
        }
    }
    //鼠标点击右键触发事件
    if (ev.which == 3) {
        if (obj.className && obj.className != 'flags') {
            return;
        }

        if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            if (obj.className == 'flags') {
                this.mineFlags -= 1;
            }else{
                this.mineFlags += 1;
            }
            // console.log(this.surplusNum);
            if (this.mineFlags == this.mineNum) {
                this.gameFlag = true;
            }
        } else {
            this.gameFlag = false;
        }


        if (obj.className == "flags") {
            obj.className = '';
            this.surplusNumDom.innerHTML = ++this.surplusNum;
        } else {
            obj.className = 'flags';
            if (this.surplusNum > 0) {
                this.surplusNumDom.innerHTML = --this.surplusNum;
            }
        }

        if (this.surplusNum == 0) {
            if (this.gameFlag) {
                alert("游戏成功");
                this.good.className = 'good';
            } else {
                this.gameOver(obj);
                // alert("游戏失败");
            }
        }
    }
}

//点击雷结束游戏
Mine.prototype.gameOver = function (obj) {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                if (this.tdDom[i][j].className == 'flags') {
                    this.tdDom[i][j].className = 'true';
                } else {
                    this.tdDom[i][j].className = 'mine';
                }
            }
            this.tdDom[i][j].onmousedown = null;
        }   
    }
}


//心跳效果执行函数
Mine.prototype.gameOk = function() {

}


var btns = document.querySelectorAll(".head button");
var array = [[9, 9, 10], [16, 16, 40], [16, 30, 88]];
var mine = null;
var ln = 0;//当前难度标识

for (let i = 0; i < btns.length; i++) {
    btns[i].onclick = function () {
        btns[ln].className = '';
        this.className = 'select';
        //消除心动效果
        mine = new Mine(...array[i]);
        mine.init();
        ln = i;
    }
}

btns[0].onclick();
btns[3].onclick = function() {
    //消除心动效果
    mine.good.className = 'none';
    mine.init();
    mine.surplusNum = mine.mineNum;
    mine.mineFlags = 0;
}

var close = document.querySelector('.close');
close.onclick = function() {
    mine.good.className = 'none';
}