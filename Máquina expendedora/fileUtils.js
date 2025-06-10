import fsPromises from "node:fs/promises";

export async function readJsonFile(filePath) {
    try {
        const fileContent = await fsPromises.readFile(filePath, 'utf-8');
        // Si el archivo está vacío, JSON.parse daría error.
        // Podríamos devolver un objeto vacío en ese caso, o lanzar un error si un archivo vacío es un problema.
        if (fileContent.trim() === '') {
            console.warn(`El archivo ${filePath} está vacío. Devolviendo un objeto vacío.`);
            return {};
        }
        return JSON.parse(fileContent);
    } catch (error) {
        // Mejorar el mensaje de error para incluir el nombre del archivo
        console.error(`Error al leer o parsear el archivo JSON ${filePath}:`, error.message);
        throw new Error(`No se pudo cargar el archivo ${filePath}: ${error.message}`);
    }
}

export async function writeJsonFile(filePath, data) {
    try {
        await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error al escribir en el archivo JSON ${filePath}:`, error.message);
        throw new Error(`No se pudo guardar el archivo ${filePath}: ${error.message}`);
    }
}

export async function readCsvFile(filePath) {
	try {
		const fileContent = await fsPromises.readFile(filePath, 'utf-8');
		const lines = fileContent.trim().split('\n')
		const header = lines.pop(0)
		if (lines.length === 0) {
			console.warn('El archivo está vacío.')
			return []
		}
		return lines
	} catch (error) {
		console.error(`Error al leer o parsear el archivo JSON ${filePath}:`, error.message);
        throw new Error(`No se pudo cargar el archivo ${filePath}: ${error.message}`);
	}
}
export async function writeCsvFile(filePath, data) {
	try {
		await fsPromises.writeFile(filePath, data, 'utf-8')
	} catch (error) {
		console.error(`Error al leer o parsear el archivo JSON ${filePath}:`, error.message);
        throw new Error(`No se pudo cargar el archivo ${filePath}: ${error.message}`);
	}
}
