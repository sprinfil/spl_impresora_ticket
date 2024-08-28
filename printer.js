const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');
escpos.Serial = require('escpos-serialport');
const fs = require('fs');
const path = require('path');
const usb = require('usb');
const { exec } = require('child_process');

class TicketPrinter {
    constructor(deviceType = 'USB', options = {}) {
        this.device = null;

        switch (deviceType) {
            case 'USB':
                this.device = new escpos.USB(options.vendorId || 0x04b8, options.productId || 0x0202);
                break;
            case 'Network':
                this.device = new escpos.Network(options.address);
                break;
            case 'Serial':
                this.device = new escpos.Serial(options.path, options.serialOptions);
                break;
            default:
                throw new Error('Tipo de dispositivo no soportado');
        }

        this.printer = new escpos.Printer(this.device);
    }

    // Método para imprimir un ticket simple
    printTicket(content) {
        return new Promise((resolve, reject) => {
            this.device.open((err) => {
                if (err) {
                    console.error('Error al abrir la impresora:', err.message);
                    return reject(new Error('No se pudo conectar con la impresora. Verifica la conexión y los permisos.'));
                }

                this.printer
                    .size(0.2); // Reducir el tamaño de la letra (0.2x0.2)

                content.forEach(element => {
                    if (element[3]?.toString() == "TABLE") {

                        this.printer.tableCustom(
                            [
                              { text: element[0][0], align: "LEFT", width: 0.33, style:element[2]?.toString() || "NORMAL"},
                              { text: "", align: "CENTER", width: 0.33 },
                              { text: "$ " + element[0][1], align: "RIGHT", width: 0.33, style:element[2]?.toString() || "NORMAL"},
                            ]
                          )
                    
                    } else {
                        this.printer.font("A");
                        this.printer.style(element[2]?.toString() || "NORMAL");
                        this.printer.align(element[1]?.toString());
                        this.printer.text(element[0]?.toString());
                    }
                });

                this.printer.close(() => {
                    console.log('Texto impreso correctamente');
                    resolve();
                });
            });
        });
    }

    // Método para imprimir un código QR
    printQRCode(content) {
        return new Promise((resolve, reject) => {
            this.device.open((err) => {
                if (err) {
                    console.error('Error al cargar QR', err.message);
                    return reject(new Error('No se pudo conectar con la impresora. Verifica la conexión y los permisos.'));
                }
                if (content == "" || content == null) {
                    console.error('Error al cargar QR');
                    return resolve();
                }
                console.log('Imprimiendo QR...');
                this.printer
                    .align('CT')
                    .qrimage(content, { type: 'png', mode: 'dhdw', size: 2 }, (err) => {  // Reducir el tamaño
                        if (err) {
                            console.error('Error al generar el QR:', err.message);
                            return reject(err);
                        }
                        this.printer.close(() => {
                            console.log('Código QR impreso correctamente');
                            resolve();
                        });
                    });
            });
        });
    }

    // Método para imprimir un código de barras
    printBarcode(code) {
        return new Promise((resolve, reject) => {
            this.device.open((err) => {
                if (err) {
                    console.error('Sin Codigo de barras: ', err.message);
                    return reject(err);
                }
                try {
                    this.printer
                        .align('CT') // Alineación al centro
                        .barcode(code, "CODE39", { width: 100 }) // Asegúrate de convertir el código a cadena
                        .feed(2)
                        .cut() // Espaciado después del código de barras
                        .close(() => {
                            console.log('Código de barras impreso correctamente');
                            resolve();
                        });
                } catch (error) {
                    console.error('Error al imprimir el código de barras:', error.message);
                    reject(error);
                }
            });
        });
    }

    // Método para imprimir una imagen
    printImage(imagePath) {
        return new Promise((resolve, reject) => {
            fs.access(imagePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error('Archivo de imagen no encontrado:', err.message);
                    return resolve();
                }

                this.device.open((err) => {
                    if (err) {
                        console.error('Error al abrir la impresora:', err.message);
                        return reject(new Error('No se pudo conectar con la impresora. Verifica la conexión y los permisos.'));
                    }

                    escpos.Image.load(imagePath, (img, err) => {
                        if (err) {
                            console.error('Error al cargar la imagen:', err.message);
                            return reject(new Error('Error al cargar la imagen.'));
                        }

                        this.printer
                            .align('CT')
                            .image(img)
                            .then(() => this.printer.feed(2)) // Alimentar el papel
                            .then(() => {
                                console.log('Imagen impresa correctamente');
                                resolve();
                            })
                            .catch(err => {
                                console.error('Error durante el proceso de impresión:', err.message);
                                reject(err);
                            });
                    });
                });
            });
        });
    }

    // Método para listar las impresoras disponibles
    static listPrinters() {
        return new Promise((resolve, reject) => {
            exec('wmic printer get name', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error al ejecutar el comando: ${error.message}`);
                    return reject(error);
                }
                if (stderr) {
                    console.error(`Error en el comando: ${stderr}`);
                    return reject(new Error('Error al obtener la lista de impresoras.'));
                }

                const printers = stdout.split('\n').filter(line => line.trim() !== '').map(line => line.trim());
                console.log('Impresoras disponibles:', printers);
                resolve(printers);
            });
        });
    }

    // Método para listar impresoras USB con vendorId y productId
    static listUSBPrinters() {
        return new Promise((resolve, reject) => {
            try {
                const devices = usb.getDeviceList();
                const printers = devices.map(device => ({
                    vendorId: `0x${device.deviceDescriptor.idVendor.toString(16).toUpperCase()}`,
                    productId: `0x${device.deviceDescriptor.idProduct.toString(16).toUpperCase()}`,
                }));

                resolve(printers);
            } catch (error) {
                console.error('Error al obtener la lista de impresoras USB:', error.message);
                reject(error);
            }
        });
    }
}

module.exports = TicketPrinter;
