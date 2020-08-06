var w = 20,     //方块宽
    h = 20,     //方块高
    tr = 25,    //行数
    td = 25;    //列数

var food = null, //苹果的实例
    snake = null,//蛇的实例
    game = null; //游戏的实例

//创建方块
function Square(x, y, classname) {
    this.x = x * w;
    this.y = y * h;
    this.class = classname;
    this.snakeSquare = document.createElement('div');
    this.snakeSquare.className = this.class;
    this.parent = document.querySelector('.snake');
}

Square.prototype.create = function () {
    this.snakeSquare.style.position = 'absolute';
    this.snakeSquare.style.width = w + 'px';
    this.snakeSquare.style.height = h + 'px';
    this.snakeSquare.style.left = this.x + 'px';
    this.snakeSquare.style.top = this.y + 'px';

    this.parent.append(this.snakeSquare);
}

Square.prototype.remove = function () {
    this.parent.removeChild(this.snakeSquare);
}


//创建蛇
function Snake() {
    this.head = null; //蛇头信息
    this.tail = null; //蛇尾信息
    this.pos = [];    //蛇的每个方块坐标
    //蛇走的方向
    this.directionNum = {
        left: {
            x: -1,
            y: 0,
            rotate: -270
        },
        right: {
            x: 1,
            y: 0,
            rotate: -90
        },
        up: {
            x: 0,
            y: -1,
            rotate: -180
        },
        down: {
            x: 0,
            y: 1,
            rotate: 0
        }
    }

}

//初始化
Snake.prototype.init = function () {
    //创建蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2, 0]);

    //创建蛇身
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]);

    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0, 0]);

    //把蛇身链成链表
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //默认方向为右
    this.direction = this.directionNum.right;
}

//获取蛇下一步的位置
Snake.prototype.nextPos = function () {
    var nextpos = [
        this.head.x/w + this.direction.x,
        this.head.y/h + this.direction.y
    ];

    //撞到墙，游戏结束
    if (nextpos[0] > tr-1 || nextpos[0] < 0 || nextpos[1] < 0 || nextpos[1] > td-1) {
        this.Next.gameover.call(this);
        return ;
    }

    //撞到自己，游戏结束
    var colliedSelf = false;
    this.pos.forEach(function (value) {
        if (nextpos[0] == value[0] && nextpos[1] == value[1]) {
            colliedSelf = true;
        }
    });
    if (colliedSelf) {
        this.Next.gameover.call(this);
        return ;
    }

    //撞到苹果，吃，身体增长
    if(food && nextpos[0] == food.pos[0] && nextpos[1] == food.pos[1]){
        this.Next.eat.call(this);
        return ;
    }

    //空白，继续走
    this.Next.move.call(this);
}

//碰撞后执行的方法
Snake.prototype.Next = {
    move: function (eating) {
        //删掉蛇头，在原来蛇头位置增加身体，在新身体前面增加蛇头
        var newBody = new Square(this.head.x/w, this.head.y/h, 'snakeBody');
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;
        this.head.remove();
        newBody.create();

        //增加蛇头
        var newHead = new Square(this.head.x / w + this.direction.x, this.head.y / h + this.direction.y, 'snakeHead');
        newHead.last = null;
        newHead.next = newBody;
        newBody.last = newHead;
        newHead.snakeSquare.style.transform = 'rotate('+this.direction.rotate+'deg)';
        newHead.create();

        //如果没有吃到苹果，删掉蛇尾
        if (!eating) {
            this.tail.remove();
            this.tail = this.tail.last;
            //更新pos坐标
            this.pos.pop();
        }

        //更新pos坐标
        this.head = newHead;
        this.pos.splice(0, 0, [this.head.x/w, this.head.y/h]);
    },

    eat: function () {
        game.score++;
        this.Next.move.call(this, true);
        createFood();
    },

    gameover: function () {
        clearInterval(game.timer);
        gameOver(gg, sc);
    }
}

//创建苹果
function createFood() {
    var x = null;
    var y = null;
    var include = true;

    while (include) {
        x = Math.floor(Math.random() * (td - 1));
        y = Math.floor(Math.random() * (tr - 1));

        snake.pos.forEach(function (value) {
            if (x != value[0] && y != value[1]) {
                include = false;
            }
        });
    }

    food = new Square(x, y, 'apple');
    food.pos = [x, y];

    var foodDom = document.querySelector('.apple');
    if(foodDom){
        foodDom.style.left = x*w + 'px';
        foodDom.style.top = y*h + 'px';
    }else{
        food.create();
    }
}

//游戏类
function Game() {
    this.timer = null;
    this.score = 0;
}

Game.prototype.start = function(){
    this.timer = setInterval(function() {
        snake.nextPos();
    },200)
}

Game.prototype.init = function () {
    snake.init();
    createFood();

    document.onkeydown = function(ev){
        var firstTime = new Date().getTime();
        if(ev.which == 37 && snake.direction != snake.directionNum.right){
            snake.direction = snake.directionNum.left;
        }
        if(ev.which == 38 && snake.direction != snake.directionNum.down){
            snake.direction = snake.directionNum.up;
        }
        if(ev.which == 39 && snake.direction != snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }
        if(ev.which == 40 && snake.direction != snake.directionNum.up){
            snake.direction = snake.directionNum.down;
        }
    }

    this.start();
}


var gg = document.querySelector(".gameover");
var sc = document.querySelector('.gameover .score');
var le = document.querySelector('.gameover .left');
var ri = document.querySelector('.right');


snake = new Snake();
game = new Game();

//点击开始游戏
var btnStart = document.querySelector(".start button");
btnStart.onclick = function(){
    btnStart.parentNode.style.display = 'none';
    game.init();
}

//暂停游戏
var btnSuspend = document.querySelector('.suspend button');
var btnSnake = document.querySelector('.snake');
btnSnake.onclick = function() {
    btnSuspend.parentNode.style.display = 'block';
    clearInterval(game.timer);
}

btnSuspend.onclick = function() {
    btnSuspend.parentNode.style.display = 'none';
    game.start();
}

//结束游戏界面
function gameOver(gg, sc){
    gg.style.display = 'block';
    sc.innerHTML = "你的得分为：" + game.score;
}

le.onclick = function() {
    var snakeDom = document.querySelector('.snake');
    snakeDom.innerHTML = '';
    game = new Game();
    snake = new Snake();
    game.init();
    console.log(12);
    gg.style.display = 'none';
}

ri.onclick = function() {
    console.log(2);
    gg.style.display = 'none';
}
