class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 15;
        this.onGround = false;
        this.facing = 1; // 1: 右, -1: 左
        this.color = '#ff6b6b';
        
        // 动画
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        // 生命值
        this.health = 100;
        this.maxHealth = 100;
        
        // 跳跃控制（防止连续跳跃）
        this.jumpPressed = false;
    }
    
    update(inputSystem, physicsSystem) {
        // ✅ 先处理输入，再重置地面状态
        this.handleInput(inputSystem);
        
        // ✅ 在应用物理之前重置地面状态
        this.onGround = false;
        
        // 应用物理
        physicsSystem.applyGravity(this);
        physicsSystem.applyFriction(this);
        physicsSystem.updatePosition(this);
        
        // 更新动画
        this.updateAnimation();
    }
    
    handleInput(inputSystem) {
        // 水平移动
        if (inputSystem.isKeyPressed('arrowleft') || inputSystem.isKeyPressed('a')) {
            this.velocityX = -this.speed;
            this.facing = -1;
        } else if (inputSystem.isKeyPressed('arrowright') || inputSystem.isKeyPressed('d')) {
            this.velocityX = this.speed;
            this.facing = 1;
        }
        
        // ✅ 跳跃逻辑修复 - 添加所有跳跃键
        const jumpKeyPressed = inputSystem.isKeyPressed('w') || 
                              inputSystem.isKeyPressed('arrowup')
        
        if (jumpKeyPressed && this.onGround && !this.jumpPressed) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
            this.jumpPressed = true; // 防止连续跳跃
            console.log('Jumping! velocityY:', this.velocityY); // 调试信息
        }
        
        // ✅ 释放跳跃键时重置跳跃状态
        if (!jumpKeyPressed) {
            this.jumpPressed = false;
        }
    }
    
    updateAnimation() {
        this.animationTimer++;
        if (this.animationTimer % 10 === 0) {
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }
    
    draw(renderSystem) {
        const ctx = renderSystem.ctx;
        
        ctx.save();
        
        // 如果面向左边，翻转画布
        if (this.facing === -1) {
            ctx.scale(-1, 1);
            ctx.translate(-(this.x + this.width), 0);
        } else {
            ctx.translate(this.x, 0);
        }
        
        // 绘制玩家身体
        ctx.fillStyle = this.color;
        ctx.fillRect(0, this.y, this.width, this.height);
        
        // 绘制眼睛
        ctx.fillStyle = '#fff';
        ctx.fillRect(6, this.y + 8, 8, 8);
        ctx.fillRect(18, this.y + 8, 8, 8);
        
        // 绘制瞳孔
        ctx.fillStyle = '#000';
        ctx.fillRect(8, this.y + 10, 4, 4);
        ctx.fillRect(20, this.y + 10, 4, 4);
        
        // 根据状态绘制嘴巴
        if (this.velocityY < 0) {
            // 跳跃时开心的表情
            ctx.fillStyle = '#000';
            ctx.fillRect(10, this.y + 20, 12, 2);
            ctx.fillRect(8, this.y + 22, 4, 2);
            ctx.fillRect(20, this.y + 22, 4, 2);
        }
        
        ctx.restore();
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    respawn(x = 100, y = 400) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.jumpPressed = false; // ✅ 重置跳跃状态
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health <= 0;
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}