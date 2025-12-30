const express = require("express");
const TicketPrinter = require("./printer");
const app = express();
const port = 3001;
const path = require("path");
const cors = require("cors");
const fs = require("fs").promises;
const os = require("os");

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

//IMPRIMIR
app.post("/print-ticket", async (req, res) => {
  const { data, vendor_id, product_id, barcode, imagePath, qr_url } = req.body;

  if (!data) {
    return res.status(400).json({ error: "El texto del ticket es necesario" });
  }

  try {
    const vendorIdNumeric = parseInt(vendor_id, 16);
    const productIdNumeric = parseInt(product_id, 16);

    const printer = new TicketPrinter("USB", {
      vendorId: vendorIdNumeric,
      productId: productIdNumeric,
    });

    // const barcode = '23452345';
    // const imagePath = `logosapa.png`;
    // const qr_url = ``;

    await printer.printImage(imagePath);
    await printer.printTicket(data);
    if (qr_url) {
      await printer.printQRCode(qr_url);
    }
    await printer.printBarcode(barcode);

    console.log("Proceso de impresión completado");
    res.status(200).json({ message: "Impresión completada", data: data });
  } catch (err) {
    console.error("Error en la impresión:", err);
    res.status(500).json({ error: "Error en la impresión" });
  }
});

//OBTENER IMPRESORAS
app.get("/get-printers", async (req, res) => {
  try {
    let impresoras;

    TicketPrinter.listUSBPrinters()
      .then((printers) =>
        console.log(
          "Impresoras disponibles:",
          res.status(200).json({ impresoras: printers })
        )
      )
      .catch((err) => console.error("Error:", err));

    //res.status(200).json({ message: impresoras});
  } catch (err) {
    console.error("Error en la impresión:", err);
    res.status(500).json({ error: "Error buscando las impresora" });
  }
});

// Manejo de errores global para evitar que el servidor se cierre
process.on("uncaughtException", (err) => {
  console.error("Excepción no capturada:", err);
});

//INICIAR EL SERVER
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

app.get("/validar-caja/:nombre", async (req, res) => {
  const { nombre } = req.params;

  const archivoPath = path.join("C:", "CAJAPLUGIN", "caja.txt");

  try {
    const contenido = await fs.readFile(archivoPath, "utf8");

    // Elimina saltos de línea y espacios si es necesario
    const contenidoLimpio = contenido.trim();

    console.log("Nombre recibido:", nombre);
    console.log("Contenido del archivo:", contenidoLimpio);

    if (contenidoLimpio === nombre) {
      return res.status(200).json({
        valid: true,
        message: "Nombre coincide con el contenido del archivo",
      });
    } else {
      return res.status(400).json({
        valid: false,
        message: "Nombre NO coincide con el contenido del archivo",
      });
    }
  } catch (error) {
    console.error("Error leyendo el archivo:", error);
    return res.status(500).json({
      error: "No se pudo leer el archivo",
      detalle: error.message,
    });
  }
});

app.get("/obtenerCaja", async (req, res) => {
  const archivoPath = path.join("C:", "CAJAPLUGIN", "caja.txt");

  try {
    const contenido = await fs.readFile(archivoPath, "utf8");

    const contenidoLimpio = contenido.trim();

    return res.json({
      caja: contenidoLimpio,
    });
  } catch (error) {
    console.error("Error leyendo el archivo:", error);
    return res.status(500).json({
      error: "No se pudo leer el archivo",
      detalle: error.message,
    });
  }
});
