import initSqlJs from 'sql.js';

let SQL: any = null;
let db: any = null;

export const initDatabase = async () => {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
  }

  if (!db) {
    // محاولة تحميل قاعدة البيانات من localStorage
    const savedDb = localStorage.getItem('confessionApp_db');
    if (savedDb) {
      const uint8Array = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(uint8Array);
    } else {
      db = new SQL.Database();
      await createTables();
    }
  }

  return db;
};

const createTables = async () => {
  // جدول المعترفين
  db.exec(`
    CREATE TABLE IF NOT EXISTS confessors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      fatherName TEXT NOT NULL,
      grandFatherName TEXT,
      familyName TEXT NOT NULL,
      phone1 TEXT NOT NULL,
      phone1Whatsapp BOOLEAN DEFAULT 1,
      phone2 TEXT,
      phone2Whatsapp BOOLEAN DEFAULT 0,
      gender TEXT CHECK(gender IN ('ذكر', 'أنثى')) NOT NULL,
      birthDate TEXT NOT NULL,
      socialStatus TEXT CHECK(socialStatus IN ('أعزب', 'متزوج', 'أرمل', 'مطلق')) NOT NULL,
      marriageDate TEXT,
      church TEXT NOT NULL,
      confessionStartDate TEXT,
      profession TEXT,
      services TEXT, -- JSON array
      personalTags TEXT, -- JSON array
      isDeacon BOOLEAN DEFAULT 0,
      isDeceased BOOLEAN DEFAULT 0,
      notes TEXT,
      spouseName TEXT,
      spousePhone TEXT,
      children TEXT, -- JSON array
      isArchived BOOLEAN DEFAULT 0,
      profileImage TEXT,
      customFields TEXT, -- JSON object
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // جدول سجل الاعترافات
  db.exec(`
    CREATE TABLE IF NOT EXISTS confession_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      confessorId INTEGER NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      tags TEXT, -- JSON array
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (confessorId) REFERENCES confessors(id)
    )
  `);

  // جدول قوالب الرسائل
  db.exec(`
    CREATE TABLE IF NOT EXISTS message_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // جدول الإعدادات
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // إدراج الإعدادات الافتراضية
  const defaultSettings = {
    professions: ['مهندس', 'طبيب', 'محاسب', 'صيدلي', 'محامي', 'مدرس', 'موظف', 'ربة منزل'],
    services: ['خدمة مدارس الأحد', 'خدمة شباب', 'كورال', 'خدمة اجتماعية'],
    personalTags: ['طالب', 'مغترب'],
    confessionTags: ['نمو روحي', 'مشاكل أسرية', 'مشاكل شخصية', 'ضعف عام']
  };

  Object.entries(defaultSettings).forEach(([key, value]) => {
    db.exec(`
      INSERT OR IGNORE INTO settings (key, value) 
      VALUES ('${key}', '${JSON.stringify(value)}')
    `);
  });

  saveDatabase();
};

export const saveDatabase = () => {
  if (db) {
    const data = db.export();
    localStorage.setItem('confessionApp_db', JSON.stringify(Array.from(data)));
  }
};

export const exportDatabase = () => {
  if (db) {
    const data = db.export();
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confession_app_backup_${new Date().toISOString().split('T')[0]}.db`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

export const importDatabase = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        if (!SQL) {
          await initDatabase();
        }
        
        db = new SQL.Database(uint8Array);
        saveDatabase();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export { db };