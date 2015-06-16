// Filename: app.js
define("bigdraw",[
  'jquery',
  'libs/d3/d3',
  // 'libs/socket/lib/socket',
], function($,d3){

  return {
  	svg:null,
  	newStroke:[],
    uname:null,
    color:null,
    id:null,
    prevPoint:null,
    debug:true,

  	init:function(){
  		this.log("BigDraw Started");
  		//this.createSVG();
  		this.setEvents();
  	},

    log:function(msg){
      if(this.debug === true){
        console.log("DEBUG: "+msg);
      }
    },

  	setEvents:function(){
      this.log("setEvents");
      $('#clientNameInput').keypress($.proxy(function (e) {
        if (e.which == 13) {
          $('#mainMessage').fadeOut();
          this.uname = $('#clientNameInput').val();
          this.createSVG();
        }
      },this));
  	},
  	createSVG:function(){
      this.log("createSVG");
  		if(!this.svg){
			this.svg = d3.select("#mainWrapper")
  				.append("svg")
  				.attr("width","100%")
        		.attr("height","100%")
  				.attr("id", "mainSVG");
  		}
  		this.setDrawingEvents();
  		this.listenSocketEvents();
  	},
  	setDrawingEvents:function(){
      this.log("setDrawingEvents");
  		$('#clearBtn').click($.proxy(function(){
  			this.onClearClick();
  		},this));

  		this.svg.on("mousedown", $.proxy(function(){
        this.svg.on("mousemove", $.proxy(function(event){
          this.newStroke.push({x:d3.event.pageX,y:d3.event.pageY,color:this.color});
          this.draw(d3.event.pageX,d3.event.pageY,this.color);
        },this));
      },this));

  		this.svg.on("mouseup", $.proxy(function(){
        	this.svg.on("mousemove", null);
          this.prevPoint = null;
        	this.sendNewStroke();
      	},this));

      	this.svg.on("mouseout", $.proxy(function(){
          this.prevPoint = null;
          //this.onClearClick();
      	},this));
  	},
  	listenSocketEvents:function(){
      this.log("listenSocketEvents");
      this.socket = io();
      //this.socket = io.connect(window.location.origin,{query:"loggeduser="+this.uname+""});
      var self = this;
      this.socket.on('drawNewPoint', function(point){
          self.log("drawNewPoint");
  		    self.draw(point.x,point.y, point.color);
  		});

  		this.socket.on('clearAll', function(){
          self.log("clearAll");
  		    self.clear();
  		});

  		this.socket.on('allstrokes', function(points){
  		    self.log("Draw All Current Points:" );
  		    self.drawStrokes(points);
  		});

  		this.socket.on('drawNewStroke', function(newStroke){
  		    self.log("drawNewStroke");
          self.drawStroke(newStroke);
  		});

      this.socket.on('clientInfo', function(client){
          self.log("clientInfo");
          self.color = client.color;
          self.id = client.id;
          self.socket.emit("clientName",self.uname);
      });

      this.socket.on('clientsUpdate', function(clients){
          self.log("clientsUpdate: ");
          self.updateClients(clients);
      });

  		this.socket.on('clearAllstrokes', function(){
  		    self.log("clearAllstrokes: ");
  		    self.clearAll();

  		});
  	},

    drawStrokes:function(strokes){
      this.log("drawStrokes");
      for (var s = 0; s< strokes.length;s++){
        var stroke = strokes[s];
        this.drawStroke(stroke);
      }
      this.prevPoint = null;
    },

    drawStroke:function(stroke){
      this.log("drawStroke");
      for (var p = 0; p< stroke.length;p ++){
        var point = stroke[p];
        this.draw(point.x,point.y,point.color);
      }
      this.prevPoint = null;
    },

  	onClearClick:function(){
      this.log("onClearClick");
  		d3.selectAll(".client-point").remove();
  		this.socket.emit('clearstrokes', null);
  	},

    updateClients:function(clients){
      this.log("updateClients");
      $("#clients").empty();
      for(var c=0; c<clients.length; c++){
        var client = clients[c];
        $("#clients").append("<span style='background-color:"+client.color+"' class='label label-default'>"+client.name+"</span>");
      }
    },

  	clearAll:function(){
      this.log("clearAll");
  		d3.selectAll(".client-point").remove();
      this.newStroke = [];
  	},

  	sendNewStroke:function(){
      this.log("sendNewStroke");
  		this.socket.emit('newStroke', this.newStroke);
  		this.newStroke = [];
  	},

  	draw:function(xPos,yPos,color){
      this.log("draw");
  		//this.socket.emit('newPoint', {x:xPos,y:yPos});
      //this.newStroke.push({x:xPos,y:yPos,color:color});
      
      if(this.prevPoint){
        var line = this.svg.append("line")
        .attr("x1", this.prevPoint.x)
        .attr("y1", this.prevPoint.y-76)
        .attr("x2", xPos)
        .attr("y2", yPos-76)
        .attr("class","client-point")
        .style("stroke", color);
      }

  		this.svg.append("circle")
      .attr("class","client-point")
			.style("stroke", color)
      .style("fill", color)
			.attr("cx", xPos)
			.attr("cy", yPos-76)
			.attr("r", 0);

      this.prevPoint = {x:xPos,y:yPos,color:color};
  	}
  };
});