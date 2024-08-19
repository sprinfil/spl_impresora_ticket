const express = require('express');
const TicketPrinter = require('./printer');
const app = express();
const port = 3001;
const path = require('path');
const cors = require('cors');

app.use(express.json());

app.use(cors({
    origin: '*'
}));

//IMPRIMIR
app.post('/print-ticket', async (req, res) => {
    const { data, vendor_id, product_id, barcode, imagePath, qr_url } = req.body;

    if (!data) {
        return res.status(400).json({ error: 'El texto del ticket es necesario' });
    }

    try {
        const vendorIdNumeric = parseInt(vendor_id, 16);
        const productIdNumeric = parseInt(product_id, 16);

        const printer = new TicketPrinter('USB', { vendorId: vendorIdNumeric, productId: productIdNumeric });

        // const barcode = '23452345';
        // const imagePath = `logosapa.png`;
        // const qr_url = ``;

        await printer.printImage(imagePath);
        await printer.printTicket(data);
        if (qr_url) {
            await printer.printQRCode(qr_url);
        }
        await printer.printBarcode(barcode);

        console.log('Proceso de impresión completado');
        res.status(200).json({ message: 'Impresión completada', data: data });

    } catch (err) {
        console.error('Error en la impresión:', err);
        res.status(500).json({ error: 'Error en la impresión' });
    }
});

//OBTENER IMPRESORAS
app.get('/get-printers', async (req, res) => {
    try {
        let impresoras;

        TicketPrinter.listUSBPrinters()
            .then(printers => console.log('Impresoras disponibles:', res.status(200).json({ impresoras: printers })))
            .catch(err => console.error('Error:', err));

        //res.status(200).json({ message: impresoras});

    } catch (err) {
        console.error('Error en la impresión:', err);
        res.status(500).json({ error: 'Error buscando las impresora' });
    }
});

// Manejo de errores global para evitar que el servidor se cierre
process.on('uncaughtException', (err) => {
    console.error('Excepción no capturada:', err);
});

//INICIAR EL SERVER
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
