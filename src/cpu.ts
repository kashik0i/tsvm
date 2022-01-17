import {createMemory} from './create-memory';
import {Instruction} from './instructions';
export class CPU {
  memory: DataView;
  registerNames: Array<string>;
  registers: DataView;
  registerMap: {[key: string]: number};
  constructor(memory: DataView) {
    this.memory = memory;

    this.registerNames = [
      'ip',
      'acc',
      'r1',
      'r2',
      'r3',
      'r4',
      'r5',
      'r6',
      'r7',
      'r8',
    ];

    this.registers = createMemory(this.registerNames.length * 2);
    //[key: string]
    this.registerMap = this.registerNames.reduce<{[key: string]: number}>(
      (map, name: string, i) => {
        map[name] = i * 2;
        return map;
      },
      <{[key: string]: number}>{}
    );
  }

  getRegister(name: string) {
    if (!(name in this.registerMap)) {
      throw new Error(`getRegister: No such register '${name}'`);
    }
    return this.registers.getInt16(this.registerMap[name]);
  }

  setRegister(name: string, value: number) {
    if (!(name in this.registerMap)) {
      throw new Error(`getRegister: No such register '${name}'`);
    }
    return this.registers.setInt16(this.registerMap[name], value);
  }

  fetch() {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint8(nextInstructionAddress);
    this.setRegister('ip', nextInstructionAddress + 1);
    return instruction;
  }

  fetch16() {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint16(nextInstructionAddress);
    this.setRegister('ip', nextInstructionAddress + 2);
    return instruction;
  }

  debug() {
    this,
      this.registerNames.forEach(name => {
        console.log(
          `${name}: ${this.getRegister(name).toString(16).padStart(4, '0')}`
        );
      });
    console.log();
  }

  execute(instruction: Instruction) {
    switch (instruction) {
      //Move literal into the r1 register
      case Instruction.MOV_LIT_R1: {
        const literal = this.fetch16();
        this.setRegister('r1', literal);
        return;
      }
      //Move literal into the r2 register
      case Instruction.MOV_LIT_R2: {
        const literal = this.fetch16();
        this.setRegister('r2', literal);
        return;
      }
      //Add register to register
      case Instruction.ADD_REG_REG: {
        const r1 = this.fetch();
        const r2 = this.fetch();
        const registerValue1 = this.registers.getUint16(r1 * 2);
        const registerValue2 = this.registers.getUint16(r2 * 2);
        this.setRegister('acc', registerValue1 + registerValue2);
        return;
      }
    }
  }
  step() {
    const instruction = this.fetch();
    return this.execute(instruction);
  }
}
