class Test {
  constructor(public name: string, public age: number) {}

  getName() {
    return new Test('jiege', 28);
  }
}

let t1 = new Test('stevekeol', 30);
console.log(t1.getName())