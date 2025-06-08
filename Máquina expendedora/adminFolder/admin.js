/*ejemplos de ficheros json
products.json
"10" : {"nombre" : "Croissant", "stock" : 6, "precio" : 0.90},
"11" : {"nombre" : "Galletas limon", "stock" : 6, "precio" : 0.90},
change.json
"0.05" : 10,
"0.10" : 10,
warnings.json - vacio
*/


import * as readline from "node:readline";
const rl = readline.createInterface({input: process.stdin, output: process.stdout})
import { readJsonFile, writeJsonFile } from '../fileUtils.js';
function input(query) {
	return new Promise(resolve => {
		rl.question(query, answer => {resolve(answer)})
	})
}
async function readSettings() {
	try {
            let sets = await readJsonFile('./settings.json');
            console.log(`Datos de setting cargados con éxito.`);
			let {validCoins, changeLimit, maxAuthAttempts} = sets
            return {validCoins, changeLimit, maxAuthAttempts}
        } catch (error) {
            console.error(`Inicialización fallida para ./settings.json:`, error.message);
            let sets = {}; // Asegura un estado inicial si hay error
        }
}
class handler {
	constructor(file) {
		this.file = file
		this.fileSettings = '../settings.json'
		this.data = {}
		this.constants = {}
		this.initialized = this.loadDataOnInit();
	}
	async loadDataOnInit() {
        try {
            this.data = await readJsonFile(this.file);
            console.log(`Datos de ${this.file} cargados con éxito.`);
        } catch (error) {
            console.error(`Inicialización fallida para ${this.file}:`, error.message);
            this.data = {}
            ; // Asegura un estado inicial si hay error
        }
        try {
            this.constants = await readJsonFile(this.fileSettings);
            console.log(`Datos de ${this.fileSettings} cargados con éxito.`);
        } catch (error) {
            console.error(`Inicialización fallida para ${this.fileSettings}:`, error.message);
            this.constants = {}
            ; // Asegura un estado inicial si hay error
        }
    }
    async saveData() {
        await writeJsonFile(this.file, this.data);
        console.log('Datos guardados con éxito.')
    }
}
class productsHandler extends handler {
	async show(category) {
		await this.initialized
		if (category !== 'stock' && category !== 'price') {
			console.warn('No es una categoría válida.')
			return
		}
		Object.values(this.data).forEach(value => {
			console.log(`Nombre: ${value.name} - ${category}: ${value[category]}`)
		})
	}
	async change(category) {
		await this.initialized;
		if (category !== 'stock' && category !== 'price') {
			console.warn('No es una categoría válida.')
			return
		}
		await this.read(category)
		const listIds = new Set(Object.keys(this.data))
		while (true) {
    		let id = await input('Inserte id (0 para salir): ')
    		if (id === '0') {
        		break
    		} else if (!listIds.has(id)) {
        		console.warn('Este id no existe.')
        		continue
    		}
    		while (true) {
    			let newValue = Number(await input('Inserte el nuevo valor: '))
    			if (!isNaN(newValue) && newValue>0) {
    				break
    			} else {
    				console.warn('El valor tiene que ser un número.')
    			}
    		}
    		this.data[id][category] = newValue
    		console.log('Valor actualizado con éxito.')
    		await this.read(category, id)
		}
		await this.saveData()
	}
}
class changeHandler extends handler {
	async show() {
		await this.initialized
		Object.entries(this.data).forEach(([key, value]) => {
			console.log(`Moneda: ${key} Cantidad: ${value}`)
		})
	}
	async addChange() {
		await this.initialized;
		await this.read()
		while (true) {
    		let coin = await input('Inserte moneda (0 para salir): ')
    		if (coin === '0') {
        		break
    		} else if (new Set(this.constants.validCoins).has(coin)) {
        		console.warn('Esta moneda no existe.')
        		continue
    		} else {
				this.data[coin]++
				if (this.data[coin]>=this.constants.changeLimit) {console.log('El cambio de esa moneda está lleno.')}
    			await this.read(coin)
			}
		}
		await this.saveData()
		console.log('Cambios guardados con éxito.')
		await this.read()
	}
}

class warningsHandler extends handler {
	//{id : {fecha, category, id, cantidad, mensaje}}
	async show() {
		await this.initialized
		Object.values(this.data).forEach(value => {
			console.log(value)
		})
	}
	async check() {
		//{id : {fecha, category, id, cantidad, mensaje}}
		const idToDel = new Set()
		await this.initialized;
		const data = Objects.entries(this.data)
		data.forEach(([key, value]) => {
			let {category, id, quantity} = value
			if (category === 'change' && change.read(id) > quantity) {
				idToDel.add(key)
			} else if (category === 'stock' && products.readStock(id) > quantity) {
				idToDel.add(key)
			}
		})
		this.data = data.filter(v => !idToDel.has(v[0]))
		await this.saveData()
	}
}
const USERNAME = 'jangel'
const PASS = 'aluminio'
const MAX_AUTH_ATTEMPTS = 3
async function access() {
	let attempts = 1
	while (attempts < MAX_AUTH_ATTEMPTS) {
		let user = await input('Añade un usuario: ')
		let pass = await input('Añade la contra: ')
		if (user===USERNAME & pass ===PASS) {
			console.log('Login correcto.')
			return true
		}
		attempts++
	}
	console.log('Login fallido')
	return false
}
async function menu(user, pass, products, change, warnings) {
	let isLogin = await access()
	if (!isLogin) {
		rl.close()
		return
	}
	const products = new productsHandler("./products.json");
	const change = new changeHandler("./change.json");
	const warnings = new warningsHandler("./warning.json");
	const options = `
OPCIONES DE ADMINISTRADOR
---------------------------
|  0 - Ver cambio         |
|  1 - Añadir cambio      |
|  2 - Ver stock          |
|  3 - Añadir Stock       |
|  4 - Cambiar precio     |
|  5 - Ver avisos         |
|  6 - Comprobar avisos   |
|  7 - Salir              |
---------------------------`
	console.log(options)
	let option
	while (true) {
		do {
			option = Number(await input("Elije una opción(0-7): "))
		} while (isNaN(option) || option < 0 || option > 7)
		switch (option) {
			case 0:
				await change.show()
				break;
			case 1:
				await change.addChange()
				break
			case 2:
				products.show('stock')
				break
			case 3:
				await products.change('stock')
				break
			case 4:
				await products.change('price')
				break
			case 5:
				warnings.show()
				break
			case 6:
				await warnings.check()
				break
			case 7:
				console.log('Saliendo...')
				rl.close()
				return
		}		
	}

}