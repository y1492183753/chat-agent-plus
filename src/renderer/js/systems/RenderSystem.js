class RenderSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // 像素化渲染
        
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1
        };
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackground() {
        // 天空渐变
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制云朵
        this.drawClouds();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < 3; i++) {
            const x = (time * 10 + i * 250) % (this.canvas.width + 100) - 50;
            const y = 50 + i * 30;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawPlatforms(platforms) {
        for (let platform of platforms) {
            this.ctx.fillStyle = platform.color || '#4CAF50';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // 平台高光效果
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.fillRect(platform.x, platform.y, platform.width, 3);
        }
    }
    
    drawText(text, x, y, options = {}) {
        const fontSize = options.fontSize || 16;
        const color = options.color || '#fff';
        const strokeColor = options.strokeColor || '#000';
        const strokeWidth = options.strokeWidth || 2;
        
        this.ctx.font = `${fontSize}px "Courier New"`;
        this.ctx.fillStyle = color;
        
        if (strokeWidth > 0) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.strokeText(text, x, y);
        }
        
        this.ctx.fillText(text, x, y);
    }
    
    updateCamera(targetX, targetY) {
        this.camera.targetX = targetX - this.canvas.width / 2;
        this.camera.targetY = targetY - this.canvas.height / 2;
        
        this.camera.x = MathUtils.lerp(this.camera.x, this.camera.targetX, this.camera.smoothing);
        this.camera.y = MathUtils.lerp(this.camera.y, this.camera.targetY, this.camera.smoothing);
    }
    
    saveContext() {
        this.ctx.save();
    }
    
    restoreContext() {
        this.ctx.restore();
    }
}