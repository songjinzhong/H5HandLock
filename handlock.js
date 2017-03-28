(function(w){
  var handLock = function(option){
    this.el = option.el || w.document.body;
    this.n = option.n || 3;
    this.n = (this.n >= 2 && this.n <= 5) ? this.n : 3; // n 太大，你能记得住吗
    this.circles = []; // 用来存储 n*n 个 circle 的位置
    this.touchCircles = [];// 用来存储已经触摸到的所有 circle
    this.restCircles = [];// 还未触到的 circle
    this.touchFlag = false; // 用于判断是否 touch 到 circle
    this.dom = {
      info: option.info,
      message: option.message,
      setPass: option.setPass,
      checkPass: option.checkPass
    }
  }
  handLock.prototype = {
    init: function(){
      this.createCanvas();
      this.createCircles();
      this.initPass();
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

    initPass: function(){ // 将密码初始化
      this.lsPass = w.localStorage.getItem('HandLockPass') ? {
        model: 1,
        pass: w.localStorage.getItem('HandLockPass').split('-') // 由于密码是字符串，要先转数组
      } : { model: 2 };
      this.updateMessage();
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
          self.checkPass();
          self.touchCircles.forEach(function(v){
            self.restCircles.push(v);
          })
          self.touchCircles = [];
          setTimeout(function(){
            self.reset();
          }, 400)
        }
      }, false)
      this.dom.setPass.addEventListener('click', function(e){
        self.lsPass.model = 2;
        self.updateMessage();
        self.showInfo('请设置密码', 1000);
      })
      this.dom.checkPass.addEventListener('click', function(e){
        if(self.lsPass.pass){
          self.lsPass.model = 1;
          self.updateMessage();
          self.showInfo('请验证密码', 1000)
        }else{
          self.showInfo('请先设置密码', 1000);
          self.updateMessage();
        }
      })
    },

    update: function(p){ // 更新 touchmove
      this.drawCircles();
      this.judgePos(p);
      this.drawLine(p);
      this.drawPoints();
    },

    checkPass: function(){
      var succ, model = this.lsPass.model;
      if(model == 2){// 设置密码
        if(this.touchCircles.length < 5){ // 验证密码长度
          succ = false;
          this.showInfo('密码长度至少为 5！', 1000);
        }else{
          succ = true;
          this.lsPass.temp = []; // 将密码放到临时区存储
          for(var i = 0; i < this.touchCircles.length; i++){
            this.lsPass.temp.push(this.touchCircles[i].id);
          }
          this.lsPass.model = 3;
          this.showInfo('请再次输入密码', 1000);
          this.updateMessage();
        }
      }else if(model == 3){ // 确认密码
        var flag = true;
        // 先要验证密码是否正确
        if(this.touchCircles.length == this.lsPass.temp.length){
          var tc = this.touchCircles, lt = this.lsPass.temp;
          for(var i = 0; i < tc.length; i++){
            if(tc[i].id != lt[i]){
              flag = false;
            }
          }
        }else{
          flag = false;
        }
        if(!flag){
          succ = false;
          this.showInfo('两次密码不一致，请重新输入', 1000);
          this.lsPass.model = 2; // 由于密码不正确，重新回到 model 2
          this.updateMessage();
        }else{
          succ = true; // 密码正确，localStorage 存储，并设置状态为 model 1
          w.localStorage.setItem('HandLockPass', this.lsPass.temp.join('-')); // 存储字符串
          this.showInfo('密码设置成功', 1000);
          this.lsPass.model = 1; 
          this.lsPass.pass = this.lsPass.temp;
          this.updateMessage();
        }
        delete this.lsPass.temp; // 很重要，一定要删掉，bug
      }else if(model == 1){ // 验证密码
        var tc = this.touchCircles, lp = this.lsPass.pass, flag = true;
        if(tc.length == lp.length){
          for(var i = 0; i < tc.length; i++){
            if(tc[i].id != lp[i]){
              flag = false;
            }
          }
        }else{
          flag = false;
        }
        if(!flag){
          succ = false;
          this.showInfo('很遗憾，密码错误', 1000);
        }else{
          succ = true;
          this.showInfo('恭喜你，验证通过', 1000);
        }
      }
      if(succ){
        this.drawEndCircles('#2CFF26');
      }else{
        this.drawEndCircles('red');
      }
    },

    drawCircle: function(x, y, color){ // 画圆
      this.ctx.strokeStyle = color || '#ffa726';
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

    drawEndCircles: function(color){ // end 时重绘已经 touch 的圆
      for(var i = 0; i < this.touchCircles.length; i++){
        this.drawCircle(this.touchCircles[i].x, this.touchCircles[i].y, color);
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
    },

    updateMessage: function(){ // 根据当前模式，更新 dom
      if(this.lsPass.model == 2){ // 2 表示设置密码
        this.dom.setPass.checked = true;
        this.dom.message.innerHTML = '请设置手势密码';
      }else if(this.lsPass.model == 1){ // 1 表示验证密码
        this.dom.checkPass.checked = true;
        this.dom.message.innerHTML = '请验证手势密码';
      }else if(this.lsPass.model = 3){ // 3 表示确认密码
        this.dom.setPass.checked = true;
        this.dom.message.innerHTML = '请再次输入密码';
      }
    },

    showInfo: function(message, timer){ // 专门用来显示 info
      var info = this.dom.info;
      info.innerHTML = message;
      info.style.display = 'block';
      setTimeout(function(){
        info.style.display = '';
      }, timer || 1000)
    }
  }

  // 一些有用的函数

  w.handLock = handLock; // 赋给全局 window
})(window)