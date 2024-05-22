export class Vector {
  constructor(public x: number, public y: number, public z: number) {}

  add(v: Vector) {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  subtract(v: Vector) {
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  multiplyScalar(s: number) {
    return new Vector(this.x * s, this.y * s, this.z * s);
  }

  normalize() {
    const length = this.length();
    if (length === 0) {
      return new Vector(0, 0, 0);
    }
    return new Vector(this.x / length, this.y / length, this.z / length);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  distanceTo(v: Vector) {
    return this.subtract(v).length();
  }

  rotateY(angle: number) {
    const x = this.x * Math.cos(angle) - this.z * Math.sin(angle);
    const z = this.x * Math.sin(angle) + this.z * Math.cos(angle);
    return new Vector(x, this.y, z);
  }

  floor() {
    return new Vector(
      Math.floor(this.x),
      Math.floor(this.y),
      Math.floor(this.z)
    );
  }
}
