(function(w){
  var handLock = function(option){
    this.el = option.el || w.document.body;
    this.n = option.n || 3;
    this.n = (this.n >= 2 && this.n <= 5) ? this.n : 3; // 你能记得住吗
  }
  handLock.prototype = {
    init: function(){
      this.createCanvas();
      this.createCircles();
    },

    createCanvas: function(){ // 创建 canvas
      var width, elRect;
      elRect = this.el.getBoundingClientRect();
      width = elRect.width < 300 ? 300 : elRect.width;
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = width;
      this.el.appendChild(canvas);

      this.ctx = canvas.getContext('2d');
    },

    createCircles: function(){
      var ctx = this.ctx,
        drawCircle = this.drawCircle,
        n = this.n;
      this.r = ctx.canvas.width / (2 + 4 * n) // 这里是参考的，感觉这种画圆的方式挺合理的，方方圆圆
      r = this.r;
      this.circles = []; // 用来存储 n 个点的位置
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
        drawCircle(ctx, v.x, v.y);
      })
    },

    drawCircle: function(ctx, x, y){ // 画圆
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // 一些有用的函数

  w.handLock = handLock; // 赋给全局 window
})(window)