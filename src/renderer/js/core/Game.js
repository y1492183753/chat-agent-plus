class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        // 初始化系统
        this.inputSystem = new InputSystem();
        this.physicsSystem = new PhysicsSystem();
        this.renderSystem = new RenderSystem(this.canvas);
        
        // 游戏状态
        this.gameState = 'playing'; // playing, paused, gameOver
        this.score = 0;
        
        // 游戏对象
        this.player = new Player(100, 400);
        this.collectibles = [
            new Collectible(250, 420),
            new Collectible(550, 320),
            new Collectible(380, 220)
        ];
        
        // 游戏世界
        this.platforms = [
            { x: 0, y: 550, width: 800, height: 50, color: '#4CAF50' },
            { x: 200, y: 450, width: 150, height: 20, color: '#8BC34A' },
            { x: 500, y: 350, width: 150, height: 20, color: '#8BC34A' },
            { x: 300, y: 250, width: 200, height: 20, color: '#8BC34A' }
        ];
        
        this.bounds = {
            left: 0,
            right: this.canvas.width,
            top: 0,
            bottom: this.canvas.height
        };
        
        console.log('Game initialized successfully!');
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // 更新玩家
        this.player.update(this.inputSystem, this.physicsSystem);
        
        // 检查边界碰撞
        if (this.physicsSystem.checkBounds(this.player, this.bounds)) {
            this.player.respawn();
            console.log('Player respawned!');
        }
        
        // 检查平台碰撞
        for (let platform of this.platforms) {
            this.physicsSystem.handlePlatformCollision(this.player, platform);
        }
        
        // 检查收集品碰撞
        for (let collectible of this.collectibles) {
            if (!collectible.collected && CollisionUtils.isRectColliding(this.player.getBounds(), collectible.getBounds())) {
                this.score += collectible.collect();
                console.log('Score:', this.score);
            }
            collectible.update();
        }
        
        // 检查游戏完成
        if (this.collectibles.every(c => c.collected)) {
            console.log('Level Complete!');
        }
    }
    
    render() {
        // 清除画布
        this.renderSystem.clear();
        
        // 绘制背景
        this.renderSystem.drawBackground();
        
        // 绘制平台
        this.renderSystem.drawPlatforms(this.platforms);
        
        // 绘制收集品
        for (let collectible of this.collectibles) {
            collectible.draw(this.renderSystem.ctx);
        }
        
        // 绘制玩家
        this.player.draw(this.renderSystem);
        
        // 绘制UI
        this.drawUI();
    }
    
    drawUI() {
        // 分数
        this.renderSystem.drawText(`Score: ${this.score}`, 20, 40, {
            fontSize: 20,
            color: '#fff',
            strokeColor: '#000',
            strokeWidth: 2
        });
        
        // 收集品计数
        const collected = this.collectibles.filter(c => c.collected).length;
        const total = this.collectibles.length;
        this.renderSystem.drawText(`Coins: ${collected}/${total}`, 20, 70, {
            fontSize: 20,
            color: '#fff',
            strokeColor: '#000',
            strokeWidth: 2
        });
        
        // 游戏完成提示
        if (collected === total) {
            this.renderSystem.drawText('Level Complete!', this.canvas.width / 2 - 150, this.canvas.height / 2, {
                fontSize: 32,
                color: '#FFD700',
                strokeColor: '#000',
                strokeWidth: 3
            });
        }
    }
    
    getScore() {
        return this.score;
    }
    
    pause() {
        this.gameState = 'paused';
    }
    
    resume() {
        this.gameState = 'playing';
    }
    
    reset() {
        this.score = 0;
        this.player.respawn();
        this.collectibles.forEach(collectible => {
            collectible.collected = false;
        });
        this.gameState = 'playing';
    }
}