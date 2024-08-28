const TicketPrinter = require('./printer');
const path = require('path');

//ALINEACIONES LT CT RT 
//ESTILOS DE FUENTE `NORMAL` | `B` | `I` | `U` | `U2` | `BI` | `BIU` | `BIU2` | `BU` | `BU2` | `IU` | `IU2`;
//`texto`, `alineacion`,`estilo`

//funcion para alinear los conceptos
function formatLine(concept, amount, totalWidth = 40) {
      const conceptLength = concept.length;
      const amountLength = amount.length;
      const spacesNeeded = totalWidth - (conceptLength + amountLength);
      const paddedConcept = concept + ' '.repeat(spacesNeeded > 0 ? spacesNeeded : 0);
      return paddedConcept + amount;
}

const printer = new TicketPrinter('USB', { vendorId: 0x04B8, productId: 0x0202 });

let estructura_ticket = []
estructura_ticket.push([`FELIX ORTEGA 2330, CENTRO, LA PAZ .C.S`, `CT`, `B`])
estructura_ticket.push([`(612) 123 8600`, `CT`, `B`])
estructura_ticket.push([`_________________________________________`, `LT`, `B`])
estructura_ticket.push([` `, `CT`])
estructura_ticket.push([`Caja: Caja 10`, `LT`])
estructura_ticket.push([`Consecutivo: 101`, `LT`])
estructura_ticket.push([`Cajero: MIGUEL ANGEL MURILLO JAIMES`, `LT`])
estructura_ticket.push([`Recibo: 42353546023450`, `LT`])
estructura_ticket.push([`Fecha de Pago: 15/08/2024 13:19`, `LT`, `B`])
estructura_ticket.push([`_________________________________________`, `LT`, `B`])
estructura_ticket.push([` `, `CT`])
estructura_ticket.push([`***COPIA***`, `CT`, `B`])
estructura_ticket.push([`_________________________________________`, `LT`, `B`])
estructura_ticket.push([` `, `CT`])
estructura_ticket.push([`Usuario: PUBLICO EN GENERAL`, `LT`, `B`])
estructura_ticket.push([`Cuenta: 00002026`, `LT`, `B`])
estructura_ticket.push([` `, `CT`])
estructura_ticket.push([`Direccion`, `CT`, `B`])
estructura_ticket.push([` `, `CT`])
estructura_ticket.push([`Calle: BAHIA DE LA PAZ #120`, `LT`])
estructura_ticket.push([`Codigo Postal: 23080`, `LT`])
estructura_ticket.push([`COLONIA: FOVISSTE`, `LT`])
estructura_ticket.push([`RFC: XAXXX010101010010`, `LT`])
estructura_ticket.push([`_________________________________________`, `LT`, `B`])
estructura_ticket.push([` `, `LT`])
estructura_ticket.push([`CONCEPTO(S)`, `CT`, `B`])
estructura_ticket.push([`_________________________________________`, `LT`, `B`])
estructura_ticket.push([["ASDFASDFASDFASDFASDFASDFSASFSDFASDFASDF", "20"], `LT`, `B`, "TABLE"])
estructura_ticket.push([formatLine(`IVA`, `$20`), `LT`, `B`])
estructura_ticket.push([`_________________________________________`, `LT`, `B`])
estructura_ticket.push([` `, `LT`])
estructura_ticket.push([`Detalle del pago`, `CT`, `B`])
estructura_ticket.push([`_________________________________________`, `LT`, `B`])
estructura_ticket.push([formatLine(`SALDO ANTERIOR`, `$329`), `LT`])
estructura_ticket.push([`TARJETA`, `LT`, `B`])
estructura_ticket.push([formatLine(`RECIBIDIO`, `$329`), `LT`])
estructura_ticket.push([formatLine(`CAMBIO`, `$329`), `LT`])
estructura_ticket.push([` `, `LT`])
estructura_ticket.push([formatLine(`PAGO NETO`, `$329`), `LT`])
estructura_ticket.push([formatLine(`SALDO PENDIENTE`, `$0`), `LT`])
estructura_ticket.push([` `, `LT`])
estructura_ticket.push([` `, `LT`])
estructura_ticket.push([`pruebas.sapalapaz.gob.mx`, `CT`])



const barcode = '23452345';
const imagePath = `logosapa.png`;
const qr_url = ``;

printer.printImage(imagePath)
      .then(() => { printer.printTicket(estructura_ticket) })
      .then(() => qr_url != null && qr_url != `` ? printer.printQRCode(qr_url) : path.resolve())
      .then(() => printer.printBarcode(barcode))
      .then(() => console.log('Proceso de impresión completado'))
      .catch(err => console.error('Error durante el proceso de impresión:', err));


// //Listar todas las impresoras disponibles
// printer.listPrinters()
//       .then(printers => console.log('Impresoras disponibles:', printers))
//       .catch(err => console.error('Error:', err));
