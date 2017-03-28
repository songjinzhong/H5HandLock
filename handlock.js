(function(w){
  var handLock = function(option){
    this.el = option.el || w.document.body;
    this.n = option.n || 3;
    this.n = (this.n >= 2 && this.n <= 5) ? this.n : 3; // n 太大，你能记得住吗
    this.circles = []; // 用来存储 n*n 个 circle 的位置
    this.touchCircles = [];// 用来存储已经触摸到的所有 circle
    this.restCircles = [];// 还未触到的 circle
    this.touchFlag = false; // 用于判断是否 touch 到 circle
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

    createCircles: function(){ // 画圆
      var n = this.n;
      this.r = Math.floor(this.width / (2 + 4 * n)); // 这里是参考的，感觉这种画圆的方式挺合理的，方方圆圆
      r = this.r;
      for(var i = 0; i < n; i++){
        for(var j = 0; j < n; j++){
          var p = {
            x: j * 4 * r + 3 * r,
            y: i * 4 * r + 3 * r,
            id: i * 3 + j
          }
          this.circles.push(p);
          this.restCircles.push(p);
        }
      }
      this.drawCircles();
    },

    createListener: function(){ // 创建监听事件
      var self = this, temp, r = this.r;
      this.canvas.addEventListener('touchstart', function(e){
        var p = self.getTouchPos(e);
        self.judgePos(p);
      }, false)
      this.canvas.addEventListener('touchmove', function(e){
        var p = self.getTouchPos(e);
        if(self.touchFlag){
          self.update(p);
        }else{
          self.judgePos(p);
        }
      }, false)
      this.canvas.addEventListener('touchend', function(e){
        if(self.touchFlag){
          self.touchFlag = false;
          self.touchCircles.forEach(function(v){
            self.restCircles.push(v);
          })
          self.touchCircles = [];
          setTimeout(function(){
            self.reset();
          }, 400)
        }
      }, false)
    },

    update: function(p){ // 更新 touchmove
      this.drawCircles();
      this.judgePos(p);
      this.drawLine(p);
      this.drawPoints();
    },

    drawCircle: function(x, y){ // 画圆
      this.ctx.strokeStyle = '#ffa726';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
      this.ctx.closePath();
      this.ctx.stroke();
    },

    drawCircles: function(){ // 画所有圆
      this.ctx.clearRect(0, 0, this.width, this.width); // 为了防止重复画
      for(var i = 0; i < this.circles.length; i++){
        this.drawCircle(this.circles[i].x, this.circles[i].y);
      }
    },

    drawLine: function(p){
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

    drawPoints: function(){
      for (var i = 0 ; i < this.touchCircles.length ; i++) {
        this.ctx.fillStyle = '#ffa726';
        this.ctx.beginPath();
        this.ctx.arc(this.touchCircles[i].x, this.touchCircles[i].y, this.r / 2, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
      }
    },

    getTouchPos: function(e){ // 获得触摸点的相对位置
      var rect = e.target.getBoundingClientRect();
      var p = { // 相对坐标
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
      return p;
    },

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
    },

    reset: function(){
      this.drawCircles();
    }
  }

  // 一些有用的函数

  w.handLock = handLock; // 赋给全局 window
})(window)