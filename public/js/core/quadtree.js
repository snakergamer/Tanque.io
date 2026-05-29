// js/core/quadtree.js
class Vector { 
    constructor(x, y) { this.x = x; this.y = y; } 
    add(v) { this.x += v.x; this.y += v.y; return this; } 
    sub(v) { return new Vector(this.x - v.x, this.y - v.y); } 
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); } 
    normalize() { let m = this.mag(); return m === 0 ? new Vector(0, 0) : new Vector(this.x / m, this.y / m); } 
    mult(n) { this.x *= n; this.y *= n; return this; } 
    clone() { return new Vector(this.x, this.y); } 
}

class Rect { 
    constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; } 
    intersects(o) { return !(o.x > this.x + this.w || o.x + o.w < this.x || o.y > this.y + this.h || o.y + o.h < this.y); } 
}

class QTNode { 
    constructor(b, c) { this.bounds = b; this.capacity = c; this.items = []; this.divided = false; } 
    insert(i) { 
        if (!this.bounds.intersects(i.bounds)) return false; 
        if (this.items.length < this.capacity) { this.items.push(i); return true; } 
        if (!this.divided) { 
            let x = this.bounds.x, y = this.bounds.y, w = this.bounds.w / 2, h = this.bounds.h / 2; 
            this.nw = new QTNode(new Rect(x, y, w, h), this.capacity); 
            this.ne = new QTNode(new Rect(x + w, y, w, h), this.capacity); 
            this.sw = new QTNode(new Rect(x, y + h, w, h), this.capacity); 
            this.se = new QTNode(new Rect(x + w, y + h, w, h), this.capacity); 
            this.divided = true; 
        } 
        return this.nw.insert(i) || this.ne.insert(i) || this.sw.insert(i) || this.se.insert(i); 
    } 
    query(r, f = []) { 
        if (!this.bounds.intersects(r)) return f; 
        for (let i of this.items) if (r.intersects(i.bounds)) f.push(i.obj); 
        if (this.divided) { this.nw.query(r, f); this.ne.query(r, f); this.sw.query(r, f); this.se.query(r, f); } 
        return f; 
    } 
}
