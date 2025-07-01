class GameLoop {
    constructor(game) {
        this.game = game;
        this.isRunning = false;
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        
        // 性能监控
        this.fps = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        console.log('Game loop started');
        
        this.loop();
    }
    
    stop() {
        this.isRunning = false;
        console.log('Game loop stopped');
    }
    
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        // 更新游戏
        this.game.update();
        
        // 渲染游戏
        this.game.render();
        
        // 更新FPS计数
        this.updateFPS(currentTime);
        
        this.lastTime = currentTime;
        
        // 请求下一帧
        requestAnimationFrame(() => this.loop());
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
            
            // 可选：在控制台显示FPS（调试用）
            // console.log('FPS:', this.fps);
        }
    }
    
    getFPS() {
        return this.fps;
    }
}

// 启动游戏
window.addEventListener('load', () => {
    console.log('Initializing Pixel Adventure...');
    
    const game = new Game();
    if (game.canvas) {
        const gameLoop = new GameLoop(game);
        gameLoop.start();
        
        // 全局访问（调试用）
        window.game = game;
        window.gameLoop = gameLoop;
    }
});