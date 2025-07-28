const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { google } = require('googleapis');

// Inisialisasi WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth()
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

    if (text.startsWith('tugas')) {
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

client.initialize();

// Fungsi ambil data dari Google Sheets
async function ambilDataTugas(filterMapel = '') {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'bot-wa-1234-d113d8099c59.json', // Ganti dengan path file JSON kamu
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

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
