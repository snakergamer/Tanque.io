// server/gameLogic/Vector.js
class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let m = this.mag();
        if (m === 0) return new Vector(0, 0);
        return new Vector(this.x / m, this.y / m);
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    distSq(v) {
        return (this.x - v.x) ** 2 + (this.y - v.y) ** 2;
    }
}

module.exports = Vector;
