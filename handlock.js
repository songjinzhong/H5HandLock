(function(w){
  var handLock = function(option){
    this.el = option.el || w.document.body;
  }
  handLock.prototype = {

  }
  w.handLock = handLock;
})(window)