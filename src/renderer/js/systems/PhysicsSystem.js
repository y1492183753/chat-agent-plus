class PhysicsSystem {
    constructor() {
        this.gravity = 0.8;
        this.friction = 0.85;
        this.airResistance = 0.98;
    }
    
    applyGravity(entity) {
        if (entity.velocityY !== undefined) {
            entity.velocityY += this.gravity;
        }
    }
    
    applyFriction(entity) {
        if (entity.velocityX !== undefined) {
            if (entity.onGround) {
                entity.velocityX *= this.friction;
            } else {
                entity.velocityX *= this.airResistance;
            }
        }
    }
    
    updatePosition(entity) {
        if (entity.velocityX !== undefined) {
            entity.x += entity.velocityX;
        }
        if (entity.velocityY !== undefined) {
            entity.y += entity.velocityY;
        }
    }
    
    checkBounds(entity, bounds) {
        // 水平边界
        if (entity.x < bounds.left) {
            entity.x = bounds.left;
            entity.velocityX = 0;
        } else if (entity.x + entity.width > bounds.right) {
            entity.x = bounds.right - entity.width;
            entity.velocityX = 0;
        }
        
        // 垂直边界
        if (entity.y < bounds.top) {
            entity.y = bounds.top;
            entity.velocityY = 0;
        } else if (entity.y + entity.height > bounds.bottom) {
            return true; // 表示实体掉出了底部边界
        }
        
        return false;
    }
    
    handlePlatformCollision(entity, platform) {
        if (CollisionUtils.isRectColliding(entity, platform)) {
            const collisionSide = CollisionUtils.getCollisionSide(entity, platform);
            
            switch (collisionSide) {
                case 'top':
                    entity.y = platform.y - entity.height;
                    entity.velocityY = 0;
                    entity.onGround = true;
                    break;
                case 'bottom':
                    entity.y = platform.y + platform.height;
                    entity.velocityY = 0;
                    break;
                case 'left':
                    entity.x = platform.x - entity.width;
                    entity.velocityX = 0;
                    break;
                case 'right':
                    entity.x = platform.x + platform.width;
                    entity.velocityX = 0;
                    break;
            }
            return true;
        }
        return false;
    }
}