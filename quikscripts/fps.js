var Fps = pc.createScript('fps');

Fps.attributes.add('maxSpeed', {type : 'number', default : 30});
Fps.attributes.add('jumpForce', {type : 'number', default : 10});
Fps.attributes.add('Speed', {type : 'number', default : 100});
Fps.attributes.add('sensitivity', {type : 'number', default : 0.25});
Fps.attributes.add('slideForce', {type : 'number', default : 400});
Fps.attributes.add('slideCounterMovement', {type : 'number', default : 0.25});
Fps.attributes.add('counterMovement', {type : 'number', default : 0.25});
Fps.attributes.add('camera', {type : 'entity' });
Fps.attributes.add('orientation', {type : 'entity' });



// initialize code called once per entity
Fps.prototype.initialize = function() {
    //variables
    this.eulers = new pc.Vec3();
    this.x = false;
    this.y = false;
    this.crouching = false;
    
    
    
    this.app.mouse.on('mousemove', this.onMouseMove, this);
                      
                      
    this.app.mouse.on("mousedown", function (e) {
        if (e.event.isOverlayEvent === false)
            return;
        this.app.mouse.enablePointerLock();
    }, this);
    
    
    
    
    
};

// update code called every frame
Fps.prototype.update = function(dt) {
    var forward = this.camera.forward;
    var right = this.camera.right;
    var force = new pc.Vec3();
    var rb = this.entity.rigidbody;
  
    
    
    
        
    // movement
    var x = 0;
    var z = 0;

    // Use W-A-S-D keys to move player
    // Check for key presses
    if (this.app.keyboard.isPressed(pc.KEY_A)) {
        x -= right.x;
        z -= right.z;
    }

    if (this.app.keyboard.isPressed(pc.KEY_D)) {
        x += right.x;
        z += right.z;
    }

    if (this.app.keyboard.isPressed(pc.KEY_W)) {
        //this.entity.anim.setTrigger('walking');
        x += forward.x;
        z += forward.z;
    }

    if (this.app.keyboard.isPressed(pc.KEY_S)) {
        x -= forward.x;
        z -= forward.z;
    }
    
    
    
    var mag = this.FindVelRelativeToLook();
    
    

    // use direction from keypresses to apply a force to the character
    if (x !== 0 && z !== 0) {
        force.set(x, 0, z).normalize();
        force.scale(this.Speed);
        var speed = this.entity.rigidbody.linearVelocity.length();
        //viewer.anim_info.innerHTML = speed;
        if (speed < this.maxSpeed)
        {
            this.entity.rigidbody.applyForce(force);// = force.x;
           // this.entity.rigidbody.linearVelocity.z = force.z;

        }
            
        
    }
    
    this.CounterMovement(x, z, mag, dt);
    
    
    
    
    
    
    
    //Jumping
    var from = this.entity.getPosition();
    var to = new pc.Vec3(from.x, from.y - 1, from.z);
    var canJump = false;
    this.grounded = false;
    var result = this.app.systems.rigidbody.raycastFirst(from, to);
    
    
    if(result)
    {
        canJump = true;
        this.grounded = true;
    }
    else
    {
        canJump = false;
        this.grounded = false;
    }
        
    
    
    
    if(this.app.keyboard.wasPressed(pc.KEY_SPACE) && canJump)
    {
        this.entity.rigidbody.applyImpulse(0, this.jumpForce, 0);
    }
    
    
    
    this.camera.setLocalEulerAngles(this.eulers.y, 0, 0);
    this.orientation.setLocalEulerAngles(0, this.eulers.x, 0);
    
    ////slow down time
    if(this.app.mouse.isPressed(pc.MOUSEBUTTON_RIGHT))
    {
        this.app.timeScale = 0.2;
    }else
    {
        this.app.timeScale = 1;
    }
    
    
};








Fps.prototype.onMouseMove = function (e) {
    // If pointer is disabled
    // If the left mouse button is down update the camera from mouse movement
    if (pc.Mouse.isPointerLocked() || e.buttons[0]) {
        
        
       
        this.eulers.x -= this.sensitivity * e.dx;
        this.eulers.y -= this.sensitivity * e.dy;
        this.eulers.y = pc.math.clamp(this.eulers.y, -90, 90);
        
        
        
        
    }
};





Fps.prototype.CounterMovement = function(x, z, mag, dt) {
    var rb = this.entity.rigidbody;
    this.threshold = 0.01;
    
    if (!this.grounded || this.app.keyboard.wasPressed(pc.KEY_SPACE)) return;

    //Slow down sliding
    if (this.crouching) {
        rb.applyForce(this.Speed * dt * -rb.linearVelocity.normalize() * this.slideCounterMovement);
        return;
    }
    
    //Counter movement
    if (Math.abs(mag.x) > this.threshold && Math.abs(x) < 1 || mag.x < -this.threshold && x > 0 || mag.x > this.threshold && x < 0) {
        rb.applyForce(this.orientation.forward.scale(this.Speed * dt * this.counterMovement));
        this.x = true;
    }
    else
    {
        this.x = false;
    }
    
    if (Math.abs(mag.y) > this.threshold && Math.abs(z) < 1 || mag.y < -this.threshold && z > 0 || mag.y > this.threshold && z < 0) {
        rb.applyForce(this.orientation.right.scale(this.Speed * dt * this.counterMovement));
        this.y = true;
    }else
    {
        this.y = false;
    }
        
        
};





function deltaAngle(angle1, angle2)
{
    var diff = ( angle2 - angle1 + 180 ) % 360 - 180;
    return diff < -180 ? diff + 360 : diff;
}





Fps.prototype.FindVelRelativeToLook = function() {
    var rb = this.entity.rigidbody;
    var lookAngle = this.orientation.getEulerAngles().y;
    var moveAngle = Math.atan2(rb.linearVelocity.x, rb.linearVelocity.z) * pc.math.RAD_TO_DEG;

    var u = deltaAngle(lookAngle, moveAngle);
    var v = 90 - u;

    var magnitue = this.entity.rigidbody.linearVelocity.length();
    var yMag = magnitue * Math.cos(u * pc.math.RAD_TO_DEG);
    var xMag = magnitue * Math.cos(v * pc.math.RAD_TO_DEG );

    return new pc.Vec2(xMag, yMag);
};

// swap method called for script hot-reloading
// inherit your script state here
// Fps.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/