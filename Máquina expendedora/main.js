import {readJsonFile, writeJsonFile, readCsvFile, writeCsvFile} from "./fileUtils.js"
import * as readline from "node:readline"
const rl = readline.createInterface({input: process.stdin, output: process.stdout})
function input(query) {
	return new Promise(resolve => {
		rl.question(query, answer => {resolve(answer)})
	})
}
const TODAY = new Date()
const TODAY_SHORT = `${date.getMonth()+1}-${date.getFullYear()}`
class handler {
	constructor(file) {
		this.file = file
		this.fileSettings = './settings.json'
		this.data = {};
		this.constants = {}
		this.initialized = this.loadDataOnInit();
	}
	async loadDataOnInit() {
        try {
            this.data = await readJsonFile(this.file);
            console.log(`Datos de ${this.file} cargados con éxito.`);
        } catch (error) {
            console.error(`Inicialización fallida para ${this.file}:`, error.message);
            this.data = {}; // Asegura un estado inicial si hay error
        }
        try {
            this.constants = await readJsonFile(this.fileSettings);
            console.log(`Datos de ${this.fileSettings} cargados con éxito.`);
        } catch (error) {
            console.error(`Inicialización fallida para ${this.fileSettings}:`, error.message);
            this.constants = {}; // Asegura un estado inicial si hay error
        }
    }
    async saveData() {
        await writeJsonFile(this.file, this.data);
        console.log('Datos guardados con éxito.')
    }
}
class changeHandler extends handler {
    async read(coin) {
    	await this.initialized
		return this.data[coin]
	}
	async saveChange(coin) {
		await this.initialized
		this.data[coin]++
		await this.saveData()
	}
	async removeChange(coin) {
		await this.initialized
		this.data[coin]--
		await this.saveData()
	}
}
class productsHandler extends handler {
	listIds() {
		return Object.keys(this.data)
	}
    read(id, prop) {
    	return this.data[id][prop]
    }
    async removeStock(id) {
    	this.data[id].stock--;
    	await this.saveData()
    }
    async showProducts() {
    	await this.initialized;
    	const productsInfo = Object.entries(this.data)
    	console.log('Lista de productos')
    	productsInfo.forEach((value) => {
    		console.log(`${value[0]} - ${value[1]['name']} Precio: ${value[1]['price']}`)
    	})
    }
}

class warningsHandler extends handler {
	//{id : {fecha, category, id, cantidad, mensaje}}
    async addWarnings(category, id, quantity) {
    	await this.initialized
    	let key = this.constants.lastIdWarnings +1
    	await saveIdWarning(key)
    	let message = `Solo hay ${quantity} ${category==='change' ? 'monedas' : 'productos'} de ${id}`
    	let line = {TODAY, category, id, quantity, message}
    	this.data[key] = line
    	await writeJsonFile(this.file, this.data)
    }
    async saveIdWarning(id) {
    	this.constants.lastIdWarnings = id
        await writeJsonFile(this.file, this.constants);
        console.log('ID guardado con éxito.')
    }
}
class csvHandler{
	constructor(filePath) {
		this.file = filePath
		this.data = []
		this.initialized = this.loadDataOnInit()
	}
	async loadDataOnInit() {
        try {
            this.data = await readCsvFile(this.file);
            console.log(`Datos de ${this.file} cargados con éxito.`);
        } catch (error) {
            console.error(`Inicialización fallida para ${this.file}:`, error.message);
            this.data = []; // Asegura un estado inicial si hay error
        }
    }
    async saveData() {
        await writeCsvFile(this.file, this.data);
        console.log('Datos guardados con éxito.')
    }
}
class cashHandler extends csvHandler {
	async writeCash(cash) {
		await this.initialized
		let lastLine = this.data[this.data.length-1]
		let [date, amount] = lastLine.split(',').map(v => v.trim())
		if (date === TODAY_SHORT) {
			amount += cash
			lastLine = [date, amount].join(',')
			this.data[this.data.length-1] = lastLine
			await this.saveData()
		} else {
			lastLine = [TODAY_SHORT, cash].join(',')
			this.data.push(lastLine)
			await this.saveData()
		}
	}
}
class salesHandler extends csvHandler {
	// fecha, id, precio
	async writeSales(id, price) {
		await this.initialized
		let line = [TODAY, id, price].join(',')
		this.data.push(line)
		await this.saveData()
	}
}


class processSell {
	constructor() {
		this.warnings = new warningsHandler("adminFolder/warning.json");
		this.products = new productsHandler("/adminFolder/products.json");
		this.change = new changeHandler('/adminFolder/change.json')
		this.cash = new CashHandler('./cash.csv')
		this.sales = new salesHandler('./sales.csv')
	}
	async startPurchase() {
		//menu para hacer compras
		await this.products.showProducts()
		let option = await input('Quieres realizar una compra(y/n): ')
		if (option === 'y') {
			await this.processTransaction()
		} else {
			console.log('Muchas gracias por todo.')
			rl.close()
			return
		}
	}
	async collectPayment() {
		let coin
		let sum = 0
		while (coin !== 0) {
			coin = input('Inserte moneda (0 para salir): ')
			if (coin === "0") {
				return sum
			} else if (new Set(this.change.constants.validCoins).has(coin)) {
				console.warn('La moneda no es válida.')
				continue
			} else {
				sum += Number(coin)
				if (await this.change.read(coin) >= this.change.constants.changeLimit) {
					await this.cash.writeCash(Number(coin))
				} else {
					await this.change.saveChange(coin)
				}
			}
		}
	}
	async selectProduct() {
		//pide id producto y verifica stock
		let id;
		const ids = new Set(this.products.listIds());
		while (true) {
			 id = await input('Seleccione un id: ')
			 if (!ids.has(id)) {
			 	console.warn('El producto seleccionado no existe.')
			 } else if (this.products.read(id, 'stock') <= 0) {
				console.warn('No existe stock de ese producto')
			 } else {
			 	return id
			 }
		}
	}
	async calcChange(sum) {
		const changeReturn = []
		const coins = this.change.constants['validCoins'].sort((a, b) => b.localeCompare(a)).map(Number)
		for (let coin of coins) {
			let numCoins = parseInt(sum / coin)
			sum -= coin * numCoins
			while (numCoins>0) {
				changeReturns.push(coin)
				await this.change.removeChange(coin)
				numCoins--
			}
			if (sum <= 0) {
				return changeReturn
			}
		}
	}
	async processTransaction() {
		// la logica central
		let sum = await this.collectPayment()
		const id = await this.selectProduct()
		const price = this.products.read(id, 'price')
		while (sum < price) {
			console.warn('Monedas insuficientes.')
			sum += await this.collectPayment()
		}
		await this.products.removeStock(id)
		if (this.products.read(id, 'stocks') === this.products.constants['lowStock']) {
			await this.warnings.addWarnings('stock', id, this.products.constants['lowStock'])
		}
		const changeReturn = await this.calcChange(sum - price)
		await this.sales.writeSales(id, price)
		this.dispenseProduct(id)
		this.returnChange(changeReturn)
	}
	dispenseProduct(id) {
		//simula la entrega
		console.log(`Compra realizada
Aquí tiene su ${this.products.data[id].name}.
Muchas gracias.`)
	}
	returnChange(change) {
		// retorna el cambio
		console.log(`Aquí tiene su cambio.
${change}`)
	}
}