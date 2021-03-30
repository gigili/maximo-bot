import {Database} from "sqlite3";

const sqlite3 = require("sqlite3").verbose();


export class DB {
	private db: Database | undefined;
	private static instance: DB | null;

	constructor() {
	}

	async initDB() {
		const self = this;
		return new Promise(function (resolve, reject) {
			self.db = new sqlite3.Database("./db/maximo.db", (err: Error | null) => {
				if (err) {
					reject("Open error: " + err.message);
				} else {
					self.run("SELECT * FROM commands LIMIT 1")
						.catch(() => {
							console.log("CREATING TABLE commands");
							self.run(`CREATE TABLE IF NOT EXISTS commands
									  (
										  channel    TEXT,
										  command    TEXT,
										  output     TEXT,
										  level      INTEGER,
										  created_at TEXT DEFAULT CURRENT_TIMESTAMP
									  )`)
								.then(() => {
									console.log("CREATING TABLE aliases");
									self.run(`CREATE TABLE IF NOT EXISTS alias
											  (
												  channel    TEXT,
												  command    TEXT,
												  alias      TEXT,
												  created_at TEXT DEFAULT CURRENT_TIMESTAMP
											  )`)
										.then(() => resolve("DB connection opened"));
								});
						})
						.then(() => {
							console.log("OPENING CONNECTION");
							resolve("DB connection opened");
						});
				}
			});
		});
	}

	static async getInstance(): Promise<DB> {
		if (this.instance == null) {
			this.instance = new DB();
		}

		if (!this.instance.db) {
			await this.instance.initDB();
		}

		return this.instance;
	}

	async run(query: string, params: any[] = []): Promise<string | boolean> {
		const db = (await DB.getInstance()).db;
		return new Promise(function (resolve, reject) {
			db?.run(query, params, (err: Error | null) => {
				if (err) {
					reject(err.message);
				} else {
					resolve(true);
				}
			});
		});
	}

	async get(query: string, params: any[] = []): Promise<any> {
		const db = (await DB.getInstance()).db;
		return new Promise(function (resolve, reject) {
			db?.get(query, params, function (err: Error | null, row) {
				if (err) {
					reject("Read error: " + err.message);
				} else {
					resolve(row);
				}
			})
		})
	}
}
