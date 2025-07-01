class CollisionUtils {
    static isRectColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    static isPointInRect(pointX, pointY, rect) {
        return pointX >= rect.x && 
               pointX <= rect.x + rect.width &&
               pointY >= rect.y && 
               pointY <= rect.y + rect.height;
    }
    
    static getCollisionSide(moving, stationary) {
        const dx = (moving.x + moving.width / 2) - (stationary.x + stationary.width / 2);
        const dy = (moving.y + moving.height / 2) - (stationary.y + stationary.height / 2);
        const width = (moving.width + stationary.width) / 2;
        const height = (moving.height + stationary.height) / 2;
        const crossWidth = width * dy;
        const crossHeight = height * dx;
        
        if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
            if (crossWidth > crossHeight) {
                return (crossWidth > -crossHeight) ? 'bottom' : 'left';
            } else {
                return (crossWidth > -crossHeight) ? 'right' : 'top';
            }
        }
        return null;
    }
}