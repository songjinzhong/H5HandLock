## H5 手势解锁

首先，我要说明一下，对于这个项目，我是参考别人的，[H5lock](https://github.com/lvming6816077/H5lock)。

我觉得一个比较合理的解法应该是利用 canvas 来实现，不知道有没有大神用 css 来实现。如果纯用 css 的话，可以将连线先设置 `display: none`，当手指划过的时候，显示出来。光设置这些应该就非常麻烦吧。

之前了解过 canvas，但没有真正的写过，下面就来介绍我这几学习 canvas 并实现 H5 手势解锁的过程。

## 0. 准备及布局设置

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

## 1. 先学习 canvas

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