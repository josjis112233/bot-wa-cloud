
const { Client } = require('whatsapp-web.js');
require('dotenv').config();
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { google } = require('googleapis');

// Inisialisasi WhatsApp client
let sessionData = null;
const SESSION_FILE_PATH = './session.json';
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf-8'));
}

const client = new Client({
    session: sessionData,
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});



client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot WhatsApp siap digunakan!');
});

// Saat menerima pesan
client.on('message', async msg => {
    const text = msg.body.toLowerCase();

    if (text.startsWith('.tugas')) {
    const kata = text.split(' ');
    if (kata.length === 1) {
        const hasil = await ambilDataTugas();
        msg.reply(hasil);
    } else {
        const mapel = kata.slice(1).join(' ');
        const hasil = await ambilDataTugas(mapel);
        msg.reply(hasil);
    }
}

});

//server express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot WhatsApp aktif!");
});




client.initialize();
client.on('authenticated', session => {
    console.log('✅ Session berhasil dibuat');
    // Simpan session ke file agar bisa dipakai ulang di cloud
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
    console.log('Session disimpan ke session.json');
});


// Fungsi ambil data dari Google Sheets
async function ambilDataTugas(filterMapel = '') {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'bot-wa-1234-d113d8099c59.json', // Ganti dengan path file JSON kamu
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

   const gClient = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: gClient });

    const spreadsheetId = '1BkObKOSxx0v_pwj-rgceMTk9avBqHqS2ny8wq7DnH3c';
    const range = 'Sheet1!A6:C16';

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = res.data.values;
        if (!rows || rows.length === 0) return 'Tidak ada tugas.';

        let hasil = '*📚 Daftar Tugas:*\n\n';
        let ditemukan = false;

        rows.forEach(([mapel, keterangan, tanggal]) => {
            if (
                !filterMapel || // tanpa filter → semua mapel
                mapel.toLowerCase().includes(filterMapel.toLowerCase())
            ) {
                hasil += `📌 *${mapel}*\n📝 ${keterangan}\n📅 ${tanggal}\n\n`;
                ditemukan = true;
            }
        });

        return ditemukan ? hasil : `Tidak ada tugas untuk *${filterMapel}*.`;
    } catch (err) {
        console.error(err);
        return 'Gagal mengambil data dari Spreadsheet.';
    }
}


app.listen(port, () => {
  console.log(`🌐 Server aktif di http://localhost:${port}`);
});
