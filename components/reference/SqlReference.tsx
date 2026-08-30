"use client";

import React, { useState } from 'react';
import { BookOpen, Search, Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';

const sqlModules = [
  {
    category: "DDL (Data Definition Language)",
    description: "Perintah untuk mendefinisikan dan memodifikasi struktur database atau tabel.",
    items: [
      {
        cmd: "CREATE DATABASE",
        desc: "Membuat database baru.",
        code: "CREATE DATABASE nama_database;"
      },
      {
        cmd: "CREATE TABLE",
        desc: "Membuat tabel baru dalam database beserta tipe datanya.",
        code: "CREATE TABLE nama_tabel (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  nama VARCHAR(100) NOT NULL,\n  umur INT\n);"
      },
      {
        cmd: "ALTER TABLE",
        desc: "Mengubah struktur tabel (menambah, menghapus, atau memodifikasi kolom).",
        code: "-- Menambah kolom:\nALTER TABLE nama_tabel ADD email VARCHAR(255);\n\n-- Menghapus kolom:\nALTER TABLE nama_tabel DROP COLUMN umur;"
      },
      {
        cmd: "DROP DATABASE",
        desc: "Menghapus database secara permanen.",
        code: "DROP DATABASE nama_database;"
      },
      {
        cmd: "DROP TABLE",
        desc: "Menghapus tabel beserta seluruh datanya secara permanen.",
        code: "DROP TABLE nama_tabel;"
      },
      {
        cmd: "TRUNCATE TABLE",
        desc: "Menghapus semua data dari tabel, tetapi struktur tabelnya tetap ada (jauh lebih cepat dari DELETE).",
        code: "TRUNCATE TABLE nama_tabel;"
      }
    ]
  },
  {
    category: "DML (Data Manipulation Language)",
    description: "Perintah untuk memanipulasi data di dalam tabel (CRUD).",
    items: [
      {
        cmd: "INSERT",
        desc: "Menambahkan baris data (record) baru ke dalam tabel.",
        code: "INSERT INTO nama_tabel (nama, umur)\nVALUES ('Lucky', 20), ('Budi', 22);"
      },
      {
        cmd: "SELECT",
        desc: "Membaca atau menampilkan data dari tabel.",
        code: "-- Menampilkan semua kolom:\nSELECT * FROM nama_tabel;\n\n-- Menampilkan dengan kondisi:\nSELECT nama FROM nama_tabel WHERE umur > 20;"
      },
      {
        cmd: "UPDATE",
        desc: "Memperbarui data yang sudah ada di dalam tabel.",
        code: "UPDATE nama_tabel \nSET umur = 21 \nWHERE nama = 'Lucky';"
      },
      {
        cmd: "DELETE",
        desc: "Menghapus baris data dari tabel berdasarkan kondisi tertentu.",
        code: "DELETE FROM nama_tabel \nWHERE nama = 'Budi';"
      }
    ]
  },
  {
    category: "DCL (Data Control Language)",
    description: "Perintah untuk mengontrol hak akses (privileges) pengguna terhadap database.",
    items: [
      {
        cmd: "GRANT",
        desc: "Memberikan hak akses (izin) kepada pengguna tertentu.",
        code: "-- Memberikan semua akses:\nGRANT ALL PRIVILEGES ON nama_database.* TO 'nama_user'@'localhost';"
      },
      {
        cmd: "REVOKE",
        desc: "Mencabut atau membatalkan hak akses pengguna.",
        code: "REVOKE ALL PRIVILEGES ON nama_database.* FROM 'nama_user'@'localhost';"
      }
    ]
  },
  {
    category: "TCL (Transaction Control Language)",
    description: "Perintah untuk mengelola transaksi di dalam database agar data tetap konsisten.",
    items: [
      {
        cmd: "START TRANSACTION",
        desc: "Memulai blok transaksi baru. (Terkadang menggunakan kata kunci BEGIN).",
        code: "START TRANSACTION;"
      },
      {
        cmd: "COMMIT",
        desc: "Menyimpan perubahan yang dilakukan selama transaksi secara permanen.",
        code: "COMMIT;"
      },
      {
        cmd: "ROLLBACK",
        desc: "Membatalkan seluruh perubahan yang dilakukan sejak transaksi dimulai.",
        code: "ROLLBACK;"
      },
      {
        cmd: "SAVEPOINT",
        desc: "Membuat titik simpan di dalam transaksi agar bisa di-rollback ke titik tertentu.",
        code: "SAVEPOINT titik_satu;\n\n-- Jika ingin kembali ke titik simpan:\nROLLBACK TO titik_satu;"
      }
    ]
  },
  {
    category: "Advanced / Utility",
    description: "Perintah umum dan sering digunakan sehari-hari.",
    items: [
      {
        cmd: "USE",
        desc: "Memilih database yang akan digunakan.",
        code: "USE nama_database;"
      },
      {
        cmd: "SHOW",
        desc: "Menampilkan daftar database, tabel, atau informasi lainnya.",
        code: "SHOW DATABASES;\nSHOW TABLES;"
      },
      {
        cmd: "DESCRIBE (DESC)",
        desc: "Melihat detail struktur dari sebuah tabel.",
        code: "DESC nama_tabel;"
      },
      {
        cmd: "JOIN",
        desc: "Menggabungkan data dari dua tabel atau lebih berdasarkan kolom yang saling terkait.",
        code: "SELECT a.nama, b.jurusan \nFROM tabel_mahasiswa a \nJOIN tabel_jurusan b ON a.id_jurusan = b.id;"
      }
    ]
  }
];

function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-2">
      <pre className="bg-[#1e1e1e] border border-[#333] rounded-md p-3 text-sm text-[#d4d4d4] font-mono overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-[#2d2d2d] border border-[#444] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
        title="Copy code"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

export default function SqlReference() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');

  const filteredModules = sqlModules.map(module => {
    const filteredItems = module.items.filter(item => 
      item.cmd.toLowerCase().includes(search.toLowerCase()) || 
      item.desc.toLowerCase().includes(search.toLowerCase())
    );
    return { ...module, items: filteredItems };
  }).filter(module => {
    if (activeTab !== 'All' && !module.category.startsWith(activeTab)) return false;
    return module.items.length > 0;
  });

  return (
    <div className="h-full overflow-y-auto bg-[#1e1e1e] text-slate-300 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="text-cyan-400" size={28} />
          <h1 className="text-3xl font-bold text-white tracking-tight">Panduan Modul SQL</h1>
        </div>
        <p className="text-slate-400 mb-8 max-w-2xl text-sm leading-relaxed">
          Kumpulan referensi cepat untuk perintah-perintah dasar dan lanjutan MySQL, mulai dari DDL, DML, DCL, hingga TCL. 
          Gunakan modul ini sebagai contekkan (cheatsheet) saat Anda menulis query.
        </p>

        {/* Search & Tabs */}
        <div className="sticky top-0 bg-[#1e1e1e]/95 backdrop-blur z-10 py-4 border-b border-[#333] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Cari perintah SQL... (misal: CREATE)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2d2d2d] border border-[#444] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
          
          <div className="flex space-x-1 overflow-x-auto no-scrollbar">
            {['All', 'DDL', 'DML', 'DCL', 'TCL', 'Advanced'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                  activeTab === tab 
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                    : "bg-[#2d2d2d] text-slate-400 hover:text-white hover:bg-[#333] border border-transparent"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {filteredModules.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p>Tidak ada perintah yang cocok dengan pencarian &quot;{search}&quot;</p>
            </div>
          ) : (
            filteredModules.map((module, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1 flex items-center">
                    <span className="bg-slate-800 text-cyan-400 px-2 py-0.5 rounded text-sm mr-3 font-mono border border-slate-700">
                      {module.category.split(' ')[0]}
                    </span>
                    {module.category}
                  </h2>
                  <p className="text-sm text-slate-400">{module.description}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {module.items.map((item, i) => (
                    <div key={i} className="bg-[#252526] border border-[#333] rounded-xl p-5 hover:border-[#444] transition-colors shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-cyan-400 font-mono">{item.cmd}</h3>
                      </div>
                      <p className="text-sm text-slate-300 mb-4 h-10">{item.desc}</p>
                      
                      <div className="pt-2 border-t border-[#333]">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Contoh Penggunaan:</span>
                        <CodeSnippet code={item.code} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-20 pt-8 border-t border-[#333] text-center text-xs text-slate-500">
          SQLukay Reference Module &bull; Data Definition, Manipulation, Control, and Transaction Language.
        </div>
      </div>
    </div>
  );
}
