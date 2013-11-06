World = window.World || { };

/*------------------------------------------
The current scene.  contains all the actors, and handles the update process.
------------------------------------------*/
World.Scene = function (canvas, width, height) {
	this.actors = [];
	this.renderer = new World.Renderer(canvas.getContext('2d'));
	this.bounds = new World.Bounds(0, 0, width, height);
	this.detector = new Collision.Detector();
};

World.Scene.TIMESTEP = 1/60;
World.Scene.GRAVITY = new Math2d.Vector(0, 8);

World.Scene.prototype.checkBounds = function () {
	var self = this;
	
	this.actors.each(function(a) { 
		a.prepare();
		
		var boundOffenders = a.body.particles.where(function(p) { return self.bounds.check(p.newPosition); });
		boundOffenders.each(function(p) { 
			p.updatePositionDueToBounds(self.bounds.getPassiveCoord(p.newPosition));
			self.bounds.clamp(p.newPosition);
		});
	});
};

World.Scene.prototype.updatePositions = function () {
	this.actors.each(function(a) { a.act(); });
};

World.Scene.prototype.renderScene = function () {
	var self = this;
	this.renderer.clear();
	this.actors.each(function (a) { a.render(self.renderer); });
};

World.Scene.prototype.getParticlesInRange = function(v, r) {
	//a quick and dirty way of finding the particles within a certain radius at a certain position.
	var particles = this.actors.selectMany(function(a) { return a.body.particles; });
	return particles.where(function(p) {
		return p.position.subtract(v).magnitude() <= r;
	});
};

World.Scene.prototype.tick = function () {
	this.checkBounds();

	//TODO: change this implementation when broad phase collision detection is created.
	if(this.actors.length == 2)
		this.detector.narrowPhaseDetection(this.actors[0].body, this.actors[1].body);

	this.updatePositions();
	this.renderScene();
};

