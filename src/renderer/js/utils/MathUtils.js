class MathUtils {
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    
    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}