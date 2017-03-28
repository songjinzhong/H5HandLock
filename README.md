## H5 手势解锁

首先，我要说明一下，对于这个项目，我是参考别人的，[H5lock](https://github.com/lvming6816077/H5lock)。

我觉得一个比较合理的解法应该是利用 canvas 来实现，不知道有没有大神用 css 来实现。如果纯用 css 的话，可以将连线先设置 `display: none`，当手指划过的时候，显示出来。光设置这些应该就非常麻烦吧。

之前了解过 canvas，但没有真正的写过，下面就来介绍我这几学习 canvas 并实现 H5 手势解锁的过程。

## 准备及布局设置

我这里用了一个比较常规的做法：

```javascript
(function(w){
  var handLock = function(option){}

  handLock.prototype = {
    init : function(){},
    ...
  }

  w.handLock = handLock;
})(window)

new handLock({
  el: document.getElementById('id'),
  ...
}).init();
```

传入的参数中要包含一个 dom 对象，会在这个 dom 对象內创建一个 canvas。

关于 css 的话，懒得去新建文件了，就直接內联了。

## canvas

### 1. 学习 canvas 并搞定画圆

MDN 上面有个简易的教程，大致浏览了一下，感觉还行。[Canvas教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)。

先创建一个 `canvas`，然后设置其大小，并通过 `getContext` 方法获得绘画的上下文：

```javascript
var canvas = document.createElement('canvas');
canvas.width = canvas.height = width;
this.el.appendChild(canvas);

this.ctx = canvas.getContext('2d');
```

然后呢，先画 `n*n` 个圆出来：

```javascript
createCircles: function(){
  var ctx = this.ctx,
    drawCircle = this.drawCircle,
    n = this.n;
  this.r = ctx.canvas.width / (2 + 4 * n) // 这里是参考的，感觉这种画圆的方式挺合理的，方方圆圆
  r = this.r;
  this.circles = []; // 用来存储圆心的位置
  for(var i = 0; i < n; i++){
    for(var j = 0; j < n; j++){
      var p = {
        x: j * 4 * r + 3 * r,
        y: i * 4 * r + 3 * r,
        id: i * 3 + j
      }
      this.circles.push(p);
    }
  }
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 为了防止重复画
  this.circles.forEach(function(v){
    drawCircle(ctx, v.x, v.y); // 画每个圆
  })
},

drawCircle: function(ctx, x, y){ // 画圆函数
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.stroke();
}
```

画圆函数，需要注意：如何确定圆的半径和每个圆的圆心坐标（这个我是参考的），如果以圆心为中点，每个圆上下左右各扩展一个半径的距离，同时为了防止四边太挤，四周在填充一个半径的距离。那么得到的半径就是 `width / ( 4 * n + 2)`，对应也可以算出每个圆所在的圆心坐标，**GET**。

### 2. 画线

画线需要借助 touch event 来完成，也就是，当我们 `touchstart` 的时候，传入开始时的相对坐标，作为线的一端，当我们 `touchmove` 的时候，获得坐标，作为线的另一端，当我们 `touchend` 的时候，开始画线。

这只是一个测试画线功能，具体的后面再进行修改。

有两个函数，获得当前 touch 的相对坐标：

```javascript
getTouchPos: function(e){ // 获得触摸点的相对位置
  var rect = e.target.getBoundingClientRect();
  var p = { // 相对坐标
    x: e.touches[0].clientX - rect.left,
    y: e.touches[0].clientY - rect.top
  };
  return p;
}
```

画线：

```javascript
drawLine: function(p1, p2){ // 画线
  this.ctx.beginPath();
  this.ctx.lineWidth = 3;
  this.ctx.moveTo(p1.x, p2.y);
  this.ctx.lineTo(p.x, p.y);
  this.ctx.stroke();
  this.ctx.closePath();
},
```

然后就是监听 canvas 的 `touchstart`、`touchmove`、和 `touchend` 事件了。

### 3. 画折线

所谓的画折线，就是，将已经触摸到的点连起来，可以把它看作是画折线。

首先，要用两个数组，一个数组用于已经 touch 过的点，另一个数组用于存储未 touch 的点，然后在 move 监听时候，对 touch 的相对位置进行判断，如果触到点，就把该点从未 touch 移到 touch 中，然后，画折线，思路也很简单。

```javascript
drawLine: function(p){ // 画折线
  this.ctx.beginPath();
  this.ctx.lineWidth = 3;
  this.ctx.moveTo(this.touchCircles[0].x, this.touchCircles[0].y);
  for (var i = 1 ; i < this.touchCircles.length ; i++) {
    this.ctx.lineTo(this.touchCircles[i].x, this.touchCircles[i].y);
  }
  this.ctx.lineTo(p.x, p.y);
  this.ctx.stroke();
  this.ctx.closePath();
},
```

```javascript
judgePos: function(p){ // 判断 触点 是否在 circle 內
  for(var i = 0; i < this.restCircles.length; i++){
    temp = this.restCircles[i];
    if(Math.abs(p.x - temp.x) < r && Math.abs(p.y - temp.y) < r){
      this.touchCircles.push(temp);
      this.restCircles.splice(i, 1);
      this.touchFlag = true;
      break;
    }
  }
}
```

### 4. 标记已画

前面已经说了，我们把已经 touch 的点（圆）放到数组中，这个时候需要将这些已经 touch 的点给标记一下，在圆心处画一个小实心圆：

```javascript
drawPoints: function(){
  for (var i = 0 ; i < this.touchCircles.length ; i++) {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(this.touchCircles[i].x, this.touchCircles[i].y, this.r / 2, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fill();
  }
}
```

同时添加一个 reset 函数，当 touchend 的时候调用，400ms 调用 reset 重置 canvas。

到现在为止，一个 H5 手势解锁的简易版已经基本完成。

## password

为了要实现记住和重置密码的功能，把 password 保存在 localStorage 中，但首先要添加必要的 html 和样式。

### 1. 添加 message 和 单选框

为了尽可能的使界面简洁（越丑越好），直接在 body 后面添加了：

```html
<div id="select">
  <div class="message">请输入手势密码</div>
  <div class="radio">
    <label><input type="radio" name="pass">设置手势密码</label>
    <label><input type="radio" name="pass">验证手势密码</label>
  </div>
</div>
```

将添加到 dom 已 option 的形式传给 handLock：

```javascript
var select = document.getElementById('select'),
  message = select.getElementsByClassName('message')[0],
  radio = select.getElementsByClassName('radio')[0],
  setPass = radio.children[0].children[0],
  checkPass = radio.children[1].children[0];
var h = new handLock({
  el: document.getElementById('handlock'),
  message: message,
  setPass: setPass,
  checkPass: checkPass,
  n: 3
});
h.init();
```

## 参考

>[H5lock](https://github.com/lvming6816077/H5lock)

>[Canvas教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial)