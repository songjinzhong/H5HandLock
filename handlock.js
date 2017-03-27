(function(w){
  var handLock = function(option){
    this.el = option.el || w.document.body;
  }
  handLock.prototype = {
    init: function(){
      this.createCanvas();
    },

    createCanvas: function(){ // 常见 canvas
      var height, width, elRect;
      elRect = this.el.getBoundingClientRect();
      width = height = elRect.width < 300 ? 300 : elRect.width;
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = width;
      this.el.appendChild(canvas);
    }
  }

  // 一些有用的函数

  w.handLock = handLock; // 赋给全局 window
})(window)