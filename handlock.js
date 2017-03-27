(function(w){
  var handLock = function(option){
    this.el = option.el || w.document.body;
    this.n = option.n || 3;
    this.n = (this.n >= 2 && this.n <= 5) ? this.n : 3; // n 太大，你能记得住吗
    this.touchPoints = [];
  }
  handLock.prototype = {
    init: function(){
      this.createCanvas();
      this.createCircles();
      this.createListener();
    },

    createCanvas: function(){ // 创建 canvas
      var width, elRect;
      elRect = this.el.getBoundingClientRect();
      width = elRect.width < 300 ? 300 : elRect.width;
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = width;
      this.el.appendChild(canvas);

      this.ctx = canvas.getContext('2d');
      this.canvas = canvas;
      this.width = width;
    },

    createCircles: function(){
      var n = this.n;
      this.r = this.width / (2 + 4 * n) // 这里是参考的，感觉这种画圆的方式挺合理的，方方圆圆
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
      this.ctx.clearRect(0, 0, this.width, this.width); // 为了防止重复画
      for(var i = 0; i < this.circles.length; i++){
        this.drawCircle(this.circles[i].x, this.circles[i].y);
      }
    },

    createListener: function(){
      var self = this;
      this.canvas.addEventListener('touchstart', function(e){
        var p = self.getTouchPos(e);
        self.touchPoints.push(p);
      }, false)
      this.canvas.addEventListener('touchmove', function(e){
        var p = self.getTouchPos(e);
        self.lastPos = p;
        self.update(p);
      }, false)
      this.canvas.addEventListener('touchend', function(e){
        self.touchPoints = [];
      }, false)
    },

    update: function(p){
      this.ctx.clearRect(0, 0, this.width, this.width);
      for(var i = 0; i < this.circles.length; i++){
        this.drawCircle(this.circles[i].x, this.circles[i].y);
      }
      this.drawLine(this.lastPos);
    },

    drawCircle: function(x, y){ // 画圆
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
      this.ctx.closePath();
      this.ctx.stroke();
    },

    drawLine: function(p){
      this.ctx.beginPath();
      this.ctx.lineWidth = 3;
      this.ctx.moveTo(this.touchPoints[0].x, this.touchPoints[0].y);
      for (var i = 1 ; i < this.touchPoints.length ; i++) {
        this.ctx.lineTo(this.touchPoints[i].x, this.touchPoints[i].y);
      }
      this.ctx.lineTo(p.x, p.y);
      this.ctx.stroke();
      this.ctx.closePath();
    },

    getTouchPos: function(e){ // 获得触摸点的相对位置
      var rect = e.target.getBoundingClientRect();
      var p = { // 相对坐标
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
      return p;
    }
  }

  // 一些有用的函数

  w.handLock = handLock; // 赋给全局 window
})(window)