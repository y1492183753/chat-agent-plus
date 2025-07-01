class InputSystem {
    constructor() {
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.mouseButtons = {};
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 键盘事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
            e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
            e.preventDefault();
        });
        
        // 鼠标事件
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });
        
        window.addEventListener('mousedown', (e) => {
            this.mouseButtons[e.button] = true;
        });
        
        window.addEventListener('mouseup', (e) => {
            this.mouseButtons[e.button] = false;
        });
        
        // 防止右键菜单
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    isKeyPressed(key) {
        return !!this.keys[key.toLowerCase()];
    }
    
    isMouseButtonPressed(button) {
        return !!this.mouseButtons[button];
    }
    
    getMousePosition() {
        return { ...this.mousePos };
    }
}