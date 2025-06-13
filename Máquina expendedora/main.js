import {readJsonFile, writeJsonFile, readCsvFile, writeCsvFile} from "./fileUtils.js"
import * as readline from "node:readline"
const rl = readline.createInterface({input: process.stdin, output: process.stdout})
function input(query) {
	return new Promise(resolve => {
		rl.question(query, answer => {resolve(answer)})
	})
}
const TODAY = new Date()
const TODAY_SHORT = `${TODAY.getMonth()+1}-${TODAY.getFullYear()}`
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
	_formatCoin(coin) {
		return Number(coin).toFixed(2)
	}
    async read(coin) {
    	await this.initialized
		return this.data[this._formatCoin(coin)]
	}
	async saveChange(coin) {
		await this.initialized
		const formattedCoin = this._formatCoin(coin);
		if (this.data[formattedCoin] === undefined) {
            this.data[formattedCoin] = 0;
        }
		this.data[formattedCoin]++
		await this.saveData()
	}
	async removeChange(coin) {
		await this.initialized
		const formattedCoin = this._formatCoin(coin);
        if (this.data[formattedCoin] === undefined) {
            console.warn(`Intento de remover moneda inexistente: ${formattedCoin}`);
            return;
        }
        this.data[formattedCoin]--
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
    	let key = Number(this.constants['lastIdWarnings']) +1
    	await this.saveIdWarning(key)
    	let message = `Solo hay ${quantity} ${category==='change' ? 'monedas' : 'productos'} de ${id}`
    	let line = {TODAY, category, id, quantity, message}
    	this.data[key] = line
    	await writeJsonFile(this.file, this.data)
    }
    async saveIdWarning(id) {
    	this.constants['lastIdWarnings'] = id
        await writeJsonFile(this.fileSettings, this.constants);
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
		if (this.data.length !== 0) {
			let lastLine = this.data[this.data.length-1]
			let [date, amount] = lastLine.split(',').map(v => v.trim())
			if (date === TODAY_SHORT) {
				amount = Number(amount)
				amount += cash
				lastLine = [date, amount].join(',')
				this.data[this.data.length-1] = lastLine
				await this.saveData()
			} else {
				lastLine = [TODAY_SHORT, cash].join(',')
				this.data.push(lastLine)
				await this.saveData()
			}
		} else {
			const lastLine = [TODAY_SHORT, cash].join(',')
			this.data.push(lastLine)
			await this.saveData()
		}
	}
}
class salesHandler extends csvHandler {
	// fecha, id, precio
	async writeSales(id, price) {
		await this.initialized
		let line = [TODAY, id, price].join(',') + '\n'
		this.data.push(line)
		await this.saveData()
	}
}


class processSell {
	constructor() {
		this.warnings = new warningsHandler("./adminFolder/warnings.json");
		this.products = new productsHandler("./adminFolder/products.json");
		this.change = new changeHandler('./adminFolder/change.json')
		this.cash = new cashHandler('./cash.csv')
		this.sales = new salesHandler('./sales.csv')
	}
	async startPurchase() {
		//menu para hacer compras
		await this.products.showProducts()
		let option = await input('Quieres realizar una compra(y/n): ')
		while (option === 'y') {
			await this.processTransaction()
			option = await input('Quieres realizar otra compra(y/n): ')
		}
		console.log('Muchas gracias por todo.')
		rl.close()
		return
	}
	async collectPayment() {
		let coin
		let sum = 0
		await this.change.initialized
		while (coin !== 0) {
			coin = await input('Inserte moneda (0 para salir): ')
			let formattedCoin = Number(coin).toFixed(2); 
			if (coin === "0") {
				return sum
			} else if (!new Set(this.change.constants.validCoins).has(formattedCoin)) {
				console.warn('La moneda no es válida.')
				continue
			} else {
				sum += Number(formattedCoin)
				if (await this.change.read(formattedCoin) >= this.change.constants.changeLimit) {
					await this.cash.writeCash(Number(formattedCoin))
				} else {
					await this.change.saveChange(formattedCoin)
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
		sum = Math.round(sum * 100)
		const coins = this.change.constants['validCoins'].map(Number).sort((a, b) => b-a).map(n => Math.round(n*100))
		for (let coin of coins) {
			let numCoins = Math.floor(sum / coin)
			if (numCoins > 0 && await this.change.read(coin/100) > 0) {
				sum -= coin * numCoins
				coin = coin/100
				while (numCoins>0) {
					changeReturn.push(coin)
					await this.change.removeChange(coin)
					if (await this.change.read(coin) === this.change.constants.lowChange) {
						await this.warnings.addWarnings("change", coin, 3)
					}
					numCoins--
				}
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
		if (this.products.read(id, 'stock') === 3) {
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
const newBuy = new processSell()
newBuy.startPurchase()