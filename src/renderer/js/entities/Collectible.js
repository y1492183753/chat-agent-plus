class Collectible {
    constructor(x, y, type = 'coin') {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type;
        this.collected = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }
    
    update() {
        if (!this.collected) {
            this.animationTimer++;
            if (this.animationTimer % 15 === 0) {
                this.animationFrame = (this.animationFrame + 1) % 4;
            }
        }
    }
    
    draw(ctx) {
        if (!this.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 闪烁效果
            if (Math.floor(Date.now() / 200) % 2) {
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
            }
        }
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    collect() {
        this.collected = true;
        return 10; // 返回分数
    }
}