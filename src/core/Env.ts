import {DevEnv, Err, hash} from "ic10";
import Line from "ic10/dist/core/Line";
import {reactive} from "vue";
import {settingStore} from "../store";

class HCF extends Err {
	constructor(
		message: string,
		public level: "error" | "warn" | "info" | "debug" = "error",
		public lineStart?: number,
		public lineEnd?: number,
		public charStart?: number,
		public charEnd?: number,
	) {
		super(message, level, lineStart, lineEnd, charStart, charEnd)
		this.name = "HCF"
	}
}

class Env extends DevEnv<{ update: () => void }> {
	constructor() {
		super();
		this.data = reactive({})
		this.stack = reactive([])
		this.devices = reactive(new Map())
		const id = this.appendDevice(-128473777, hash('Circuit Housing'))
		this.attachDevice(id, 'db')
		this.deviceNames.set(id, 'Circuit Housing')
		this.deviceNames.set('Circuit Housing', id)
		this.reset()
	}

	public deviceNames: Map<string, string> = new Map<string, string>();


	reset() {
		this.aliases = new Map<string, string | number>()
		this.setDefault()
		this.errors = []
		this.lines = []
		for (const dataKey in this.data) {
			delete this.data[dataKey]
		}
		for (const key of ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15', 'r16', 'r17']) {
			this.data[key] = 0
		}
		for (let i = 0; i < 512; i++) {
			this.stack[i] = 0
		}
	}

	reverseAlias(alias: string): string[] {
		const out: string[] = []
		this.aliases.forEach((value, key,) => {
			if (value == alias) {
				out.push(key)
			}
		})
		return out;
	}

	async beforeLineRun(_line: Line): Promise<void> {

	}

	async afterLineRun(_line?: Line): Promise<void> {

		this.emit('update')


		return await new Promise<void>((resolve) => {
			let delay = 300;
			switch (settingStore.delay) {
				case "fast":
					delay = 20;
					break;
				case "normal":
					delay = 300;
					break;
				case "slow":
					delay = 1000;
					break;
			}
			setTimeout(() => {
				resolve()
			}, delay)
		})
	}

	hcf(): this {
		this.throw(new HCF("HCF", "info", this.getPosition()))
		return super.hcf();
	}

	appendDevice(hash: number, name?: number, id?: number): string {
		const out = super.appendDevice(hash, name, id);

		this.emit('update')
		return out;
	}

	removeDevice(id: string): this {
		super.removeDevice(id);

		this.emit('update')
		return this;
	}

	attachDevice(id: string, port: string): this {
		super.attachDevice(id, port);

		this.emit('update')
		return this;
	}

	detachDevice(id: string): this {
		super.detachDevice(id);

		this.emit('update')
		return this;
	}

	getErrorCount(): number {
		return this.errors.length
	}

	throw(err: Err): this {
		err.lineStart = err.lineStart ?? this.getPosition()
		this.errors.push(err)
		this.emit(err.level, err)
		this.emit('update')
		return this
	}
}

export default Env;
