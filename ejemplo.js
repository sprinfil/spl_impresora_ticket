//Abrir el archivo "spl_ticket_plugin.exe" ese archivo es el server que estara escuchando en el puerto 3001
//la siguientes funciones se pueden implementar en el front:

import axios from "axios";

async function App() {
  //este arreglo es el ticket, se le pasan instrucciones
  let estructura_ticket = [];


  //este es un ejemplo de instrucciones
  //"el primer argumento es el texto,
  // el segundo es la alineación del texto CT es centrado, también se
  // puede poner LT para alinear a la izquierda", el tercer argumento es para poner si es negrita "B" si se deja vacio es normal
  estructura_ticket.push([`_________________________________________`, `LT`, `B`])
  estructura_ticket.push([``, `CT`, `B`])
  estructura_ticket.push([`EJEMPLO DE IMPRESION`, `CT`, `B`]);
  estructura_ticket.push([``, `CT`, `B`])
  estructura_ticket.push([`_________________________________________`, `LT`, `B`])

  //una vez hechas las instrucciones se manda a imprimir
  await imprimir(estructura_ticket);
}

function imprimir(
  ticket,
  barcode = "", //no obligatorio
  imagePath = "logosapa.png", //no obligatorio
  qr_url = "", //no obligatorio
  vendor_id = localStorage.getItem("vendor_id") ?? 0x04b8 /*0x04B8*/ /* con estos números la librería puede identificar la impresora */,
  product_id = localStorage.getItem("product_id") ?? 0x0202 /*0x0202*/
) {
  return axios.post("http://localhost:3001/print-ticket", {
    data: ticket,
    vendor_id: vendor_id,
    product_id: product_id,
    barcode: barcode,
    imagePath: imagePath,
    qr_url: qr_url,
  });
}

App();