let SQL: any = null;
let db: any = null;

export const initDatabase = async () => {
  if (!SQL) {
    try {
      // استيراد sql.js بطريقة ديناميكية
      const sqlModule = await import('sql.js');
      const initSqlJs = sqlModule.default || sqlModule;
      
      SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });
    } catch (error) {
      console.error('خطأ في تحميل sql.js:', error);
      throw error;
    }
  }

  if (!db) {
    // محاولة تحميل قاعدة البيانات من localStorage
    const savedDb = localStorage.getItem('confessionApp_db');
    if (savedDb) {
      try {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        db = new SQL.Database(uint8Array);
        console.log('تم تحميل قاعدة البيانات من التخزين المحلي');
        
        // التحقق من وجود البيانات
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM confessors');
        countStmt.step();
        const result = countStmt.getAsObject();
        countStmt.free();
        
        console.log(`عدد المعترفين الموجودين: ${result.count}`);
        
        // إذا كان العدد أقل من 50، أضف المزيد من البيانات
        if (result.count < 50) {
          console.log('إضافة المزيد من البيانات الوهمية...');
          insertComprehensiveFakeData();
          saveDatabase();
        }
      } catch (error) {
        console.error('خطأ في تحميل قاعدة البيانات المحفوظة:', error);
        db = new SQL.Database();
        await createTables();
      }
    } else {
      db = new SQL.Database();
      await createTables();
      console.log('تم إنشاء قاعدة بيانات جديدة');
    }
  }

  return db;
};

const createTables = async () => {
  console.log('إنشاء الجداول...');
  
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
    professions: [
      'مهندس', 'طبيب', 'محاسب', 'صيدلي', 'محامي', 'مدرس', 'موظف', 'ربة منزل', 
      'طالب', 'متقاعد', 'تاجر', 'فني', 'ممرض', 'طبيب أسنان', 'مبرمج', 'مصمم',
      'كاتب', 'صحفي', 'مترجم', 'سائق', 'عامل', 'حرفي', 'مزارع', 'طباخ'
    ],
    services: [
      'خدمة مدارس الأحد', 'خدمة شباب', 'كورال', 'خدمة اجتماعية', 'خدمة الشمامسة', 
      'خدمة الكشافة', 'خدمة المرأة', 'خدمة كبار السن', 'خدمة الأطفال', 'خدمة الزيارات',
      'خدمة الإعلام', 'خدمة التنظيف', 'خدمة الاستقبال', 'خدمة الأمن', 'خدمة الصوتيات'
    ],
    personalTags: [
      'طالب', 'مغترب', 'جديد', 'نشط', 'يحتاج متابعة', 'قيادي', 'متطوع', 
      'موهوب', 'مبدع', 'مساعد', 'منتظم', 'متميز', 'مؤثر', 'داعم'
    ],
    confessionTags: [
      'نمو روحي', 'مشاكل أسرية', 'مشاكل شخصية', 'ضعف عام', 'توبة', 'إرشاد',
      'تشجيع', 'صلاة', 'دراسة كتابية', 'خدمة', 'علاقات', 'عمل', 'دراسة', 'صحة'
    ]
  };

  Object.entries(defaultSettings).forEach(([key, value]) => {
    db.exec(`
      INSERT OR IGNORE INTO settings (key, value) 
      VALUES ('${key}', '${JSON.stringify(value)}')
    `);
  });

  // إدراج بيانات وهمية شاملة
  insertComprehensiveFakeData();
  
  saveDatabase();
  console.log('تم إنشاء الجداول وإدراج البيانات الشاملة');
};

const insertComprehensiveFakeData = () => {
  console.log('بدء إدراج البيانات الوهمية...');
  
  // مسح البيانات الموجودة أولاً
  db.exec('DELETE FROM confession_logs');
  db.exec('DELETE FROM confessors');
  db.exec('DELETE FROM message_templates');
  
  // أسماء مصرية شائعة
  const maleFirstNames = [
    'أحمد', 'محمد', 'علي', 'حسن', 'محمود', 'عبدالله', 'يوسف', 'إبراهيم', 'عمر', 'خالد',
    'مصطفى', 'طارق', 'سامح', 'هشام', 'وائل', 'أسامة', 'كريم', 'تامر', 'شريف', 'عادل',
    'ماجد', 'فادي', 'مينا', 'جورج', 'بيتر', 'مارك', 'أندرو', 'ديفيد', 'مايكل', 'جون',
    'مارتن', 'ألبرت', 'إميل', 'نبيل', 'سمير', 'رامي', 'عماد', 'باسم', 'شادي', 'كيرلس'
  ];

  const femaleFirstNames = [
    'فاطمة', 'عائشة', 'خديجة', 'زينب', 'مريم', 'سارة', 'نور', 'هدى', 'أمل', 'رانيا',
    'دينا', 'منى', 'سمر', 'نادية', 'ليلى', 'سلمى', 'ياسمين', 'نهى', 'إيمان', 'هالة',
    'مارينا', 'كريستينا', 'نانسي', 'فيرونيا', 'مريانا', 'إيرين', 'جيهان', 'سوزان', 'نيفين', 'سيلفيا',
    'إيفيت', 'جوليا', 'ماجدة', 'سميرة', 'نجلاء', 'عبير', 'رشا', 'داليا', 'هبة', 'شيماء'
  ];

  const fatherNames = [
    'محمد', 'أحمد', 'علي', 'حسن', 'إبراهيم', 'عبدالله', 'محمود', 'يوسف', 'عمر', 'خالد',
    'مصطفى', 'طارق', 'سامح', 'هشام', 'وائل', 'أسامة', 'كريم', 'عادل', 'ماجد', 'فادي',
    'جورج', 'بيتر', 'مارك', 'نبيل', 'سمير', 'رامي', 'عماد', 'باسم', 'شادي', 'كيرلس'
  ];

  const familyNames = [
    'محمد', 'أحمد', 'علي', 'حسن', 'إبراهيم', 'السيد', 'عبدالرحمن', 'الشريف', 'النجار', 'الطيب',
    'المصري', 'القاهري', 'الإسكندراني', 'الصعيدي', 'البحيري', 'الدمياطي', 'المنوفي', 'الغربي', 'الشرقي', 'القليوبي',
    'جرجس', 'يوسف', 'إبراهيم', 'عبدالملك', 'فهمي', 'زكي', 'رزق', 'عطية', 'بشارة', 'منصور',
    'حنا', 'عبدالمسيح', 'فانوس', 'صليب', 'عزيز', 'حبيب', 'نصيف', 'شحاتة', 'عوض', 'سليمان'
  ];

  const churches = [
    'كنيسة العذراء مريم - مصر الجديدة',
    'كنيسة مار جرجس - شبرا',
    'كنيسة الأنبا أنطونيوس - المعادي',
    'كنيسة مار مينا - فلمنج',
    'كنيسة الشهيد أبانوب - الإسكندرية',
    'كنيسة العذراء والأنبا بيشوي - الزيتون',
    'كنيسة الأنبا كاراس - المنيل',
    'كنيسة مار مرقس - الأزبكية',
    'كنيسة الأنبا شنودة - القاهرة الجديدة',
    'كنيسة العذراء مريم - المطرية',
    'كنيسة الأنبا بولا - الشروق',
    'كنيسة مار جرجس - مدينة نصر',
    'كنيسة الأنبا موسى - المقطم',
    'كنيسة العذراء والأنبا أبرام - الهرم',
    'كنيسة الأنبا بيشوي - العبور',
    'كنيسة الأنبا رويس - العباسية',
    'كنيسة مار مينا - الزمالك',
    'كنيسة الأنبا تكلا - الإسكندرية'
  ];

  const professions = [
    'مهندس', 'طبيب', 'محاسب', 'صيدلي', 'محامي', 'مدرس', 'موظف', 'ربة منزل',
    'طالب', 'متقاعد', 'تاجر', 'فني', 'ممرض', 'طبيب أسنان', 'مبرمج', 'مصمم',
    'كاتب', 'صحفي', 'مترجم', 'سائق', 'عامل', 'حرفي', 'مزارع', 'طباخ'
  ];

  const services = [
    'خدمة مدارس الأحد', 'خدمة شباب', 'كورال', 'خدمة اجتماعية', 'خدمة الشمامسة',
    'خدمة الكشافة', 'خدمة المرأة', 'خدمة كبار السن', 'خدمة الأطفال', 'خدمة الزيارات',
    'خدمة الإعلام', 'خدمة التنظيف', 'خدمة الاستقبال', 'خدمة الأمن', 'خدمة الصوتيات'
  ];

  const personalTags = [
    'طالب', 'مغترب', 'جديد', 'نشط', 'يحتاج متابعة', 'قيادي', 'متطوع',
    'موهوب', 'مبدع', 'مساعد', 'منتظم', 'متميز', 'مؤثر', 'داعم'
  ];

  const confessionTags = [
    'نمو روحي', 'مشاكل أسرية', 'مشاكل شخصية', 'ضعف عام', 'توبة', 'إرشاد',
    'تشجيع', 'صلاة', 'دراسة كتابية', 'خدمة', 'علاقات', 'عمل', 'دراسة', 'صحة'
  ];

  // دالة مساعدة لتوليد تاريخ عشوائي
  const getRandomDate = (startYear: number, endYear: number) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString().split('T')[0];
  };

  // دالة مساعدة لتوليد رقم هاتف مصري
  const generatePhoneNumber = () => {
    const prefixes = ['010', '011', '012', '015'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + number;
  };

  // دالة مساعدة لاختيار عناصر عشوائية من مصفوفة
  const getRandomItems = (array: string[], count: number) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // إنشاء 120 معترف وهمي
  for (let i = 0; i < 120; i++) {
    const gender = Math.random() > 0.5 ? 'ذكر' : 'أنثى';
    const firstName = gender === 'ذكر' 
      ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
      : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
    
    const fatherName = fatherNames[Math.floor(Math.random() * fatherNames.length)];
    const grandFatherName = Math.random() > 0.3 ? fatherNames[Math.floor(Math.random() * fatherNames.length)] : null;
    const familyName = familyNames[Math.floor(Math.random() * familyNames.length)];
    
    const birthDate = getRandomDate(1950, 2005);
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    
    // تحديد الحالة الاجتماعية بناءً على العمر
    const socialStatuses = ['أعزب', 'متزوج', 'أرمل', 'مطلق'];
    const weights = age < 25 ? [0.8, 0.15, 0.03, 0.02] : 
                   age < 40 ? [0.3, 0.6, 0.05, 0.05] :
                   age < 60 ? [0.1, 0.7, 0.15, 0.05] :
                   [0.05, 0.5, 0.4, 0.05];
    
    let socialStatus = 'أعزب';
    const rand = Math.random();
    let cumulative = 0;
    for (let j = 0; j < socialStatuses.length; j++) {
      cumulative += weights[j];
      if (rand <= cumulative) {
        socialStatus = socialStatuses[j];
        break;
      }
    }

    const phone1 = generatePhoneNumber();
    const phone1Whatsapp = Math.random() > 0.2;
    const phone2 = Math.random() > 0.7 ? generatePhoneNumber() : null;
    const phone2Whatsapp = phone2 ? Math.random() > 0.5 : false;
    
    const church = churches[Math.floor(Math.random() * churches.length)];
    const profession = professions[Math.floor(Math.random() * professions.length)];
    
    const confessionStartDate = age >= 18 ? getRandomDate(Math.max(1970, new Date(birthDate).getFullYear() + 18), 2024) : null;
    
    const isDeacon = gender === 'ذكر' && age >= 25 && Math.random() > 0.85;
    const isDeceased = age >= 70 && Math.random() > 0.95;
    
    // الخدمات والعلامات الشخصية
    const selectedServices = getRandomItems(services, Math.floor(Math.random() * 4));
    const selectedTags = getRandomItems(personalTags, Math.floor(Math.random() * 3) + 1);
    
    // معلومات الزواج والأطفال
    let marriageDate = null;
    let spouseName = null;
    let spousePhone = null;
    let children = [];
    
    if (socialStatus === 'متزوج') {
      marriageDate = getRandomDate(Math.max(1970, new Date(birthDate).getFullYear() + 18), 2024);
      
      // اسم الزوج/الزوجة
      if (gender === 'ذكر') {
        spouseName = femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)] + ' ' + familyName;
      } else {
        spouseName = maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)] + ' ' + familyNames[Math.floor(Math.random() * familyNames.length)];
      }
      
      spousePhone = Math.random() > 0.3 ? generatePhoneNumber() : null;
      
      // الأطفال
      const marriageYear = new Date(marriageDate).getFullYear();
      const yearsMarried = new Date().getFullYear() - marriageYear;
      
      if (yearsMarried >= 2) {
        const numChildren = Math.floor(Math.random() * Math.min(5, Math.floor(yearsMarried / 2))) + (Math.random() > 0.7 ? 1 : 0);
        
        for (let j = 0; j < numChildren; j++) {
          const childGender = Math.random() > 0.5 ? 'ذكر' : 'أنثى';
          const childName = childGender === 'ذكر' 
            ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
            : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
          
          const childBirthYear = marriageYear + 1 + j * 2 + Math.floor(Math.random() * 3);
          const childBirthDate = getRandomDate(childBirthYear, Math.min(childBirthYear + 1, 2024));
          const childAge = new Date().getFullYear() - new Date(childBirthDate).getFullYear();
          
          children.push({
            name: childName + ' ' + firstName,
            birthDate: childBirthDate,
            phone: childAge >= 16 && Math.random() > 0.6 ? generatePhoneNumber() : ''
          });
        }
      }
    }
    
    // ملاحظات عشوائية
    const noteTemplates = [
      'شخص نشط في الخدمة ومتفاعل مع الأنشطة الكنسية.',
      'يحتاج إلى متابعة روحية أكثر وتشجيع في الصلاة.',
      'عضو مؤثر في المجتمع الكنسي ومساعد للآخرين.',
      'طالب جامعي نشط ومتميز في دراسته.',
      'يواجه بعض التحديات في العمل ويحتاج للصلاة.',
      'شخص محبوب من الجميع وله روح الخدمة.',
      'مغترب ويحتاج للتواصل المستمر.',
      'متزوج حديثاً ويحتاج لإرشاد أسري.',
      'والد مثالي ومهتم بتربية أطفاله روحياً.',
      'يخدم في عدة أنشطة ومتطوع نشط.',
      'يحب القراءة والدراسة الكتابية.',
      'له مواهب فنية ويشارك في الكورال.',
      'يساعد في تنظيم الأنشطة الكنسية.',
      'شخص هادئ ومتأمل في كلمة الله.',
      'يحتاج لتشجيع في الثقة بالنفس.'
    ];
    
    const notes = Math.random() > 0.4 ? noteTemplates[Math.floor(Math.random() * noteTemplates.length)] : '';
    
    try {
      // إدراج المعترف
      const stmt = db.prepare(`
        INSERT INTO confessors (
          firstName, fatherName, grandFatherName, familyName,
          phone1, phone1Whatsapp, phone2, phone2Whatsapp,
          gender, birthDate, socialStatus, marriageDate,
          church, confessionStartDate, profession,
          services, personalTags, isDeacon, isDeceased,
          notes, spouseName, spousePhone, children, isArchived
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        firstName,
        fatherName,
        grandFatherName,
        familyName,
        phone1,
        phone1Whatsapp ? 1 : 0,
        phone2,
        phone2Whatsapp ? 1 : 0,
        gender,
        birthDate,
        socialStatus,
        marriageDate,
        church,
        confessionStartDate,
        profession,
        JSON.stringify(selectedServices),
        JSON.stringify(selectedTags),
        isDeacon ? 1 : 0,
        isDeceased ? 1 : 0,
        notes,
        spouseName,
        spousePhone,
        JSON.stringify(children),
        0 // isArchived
      ]);
      
      stmt.free();
      
      // إضافة سجلات اعتراف عشوائية
      if (confessionStartDate && !isDeceased) {
        const confessorId = i + 1; // ID المعترف (بدءاً من 1)
        const startDate = new Date(confessionStartDate);
        const currentDate = new Date();
        
        // إضافة 1-8 سجلات اعتراف عشوائية
        const numLogs = Math.floor(Math.random() * 8) + 1;
        
        for (let j = 0; j < numLogs; j++) {
          const logDate = new Date(startDate.getTime() + Math.random() * (currentDate.getTime() - startDate.getTime()));
          const logDateStr = logDate.toISOString().split('T')[0];
          
          const selectedConfessionTags = getRandomItems(confessionTags, Math.floor(Math.random() * 3) + 1);
          
          const logNotes = [
            'جلسة اعتراف مثمرة، نمو روحي ملحوظ.',
            'مناقشة حول التحديات الشخصية والصلاة.',
            'تشجيع في الخدمة والمشاركة الكنسية.',
            'إرشاد حول العلاقات الأسرية.',
            'صلاة من أجل النجاح في العمل/الدراسة.',
            'تأمل في كلمة الله وتطبيقها العملي.',
            'مناقشة حول الهدف من الحياة المسيحية.',
            'تشجيع في أوقات الضعف والتجارب.',
            'شكر لله على البركات والنعم.',
            'طلب الصلاة من أجل قرارات مهمة.',
            'مناقشة حول التوبة والغفران.',
            'تأمل في محبة الله ورحمته.',
            'إرشاد حول التعامل مع الضغوط.',
            'تشجيع في النمو الروحي.',
            'صلاة من أجل الأسرة والأحباء.'
          ];
          
          const logNote = Math.random() > 0.3 ? logNotes[Math.floor(Math.random() * logNotes.length)] : '';
          
          const logStmt = db.prepare(`
            INSERT INTO confession_logs (confessorId, date, notes, tags) 
            VALUES (?, ?, ?, ?)
          `);
          
          logStmt.run([
            confessorId,
            logDateStr,
            logNote,
            JSON.stringify(selectedConfessionTags)
          ]);
          
          logStmt.free();
        }
      }
    } catch (error) {
      console.error(`خطأ في إدراج المعترف ${i + 1}:`, error);
    }
  }

  // إضافة قوالب رسائل شاملة
  const messageTemplates = [
    {
      title: 'تهنئة عيد ميلاد بسيطة',
      body: 'كل عام وأنت بخير يا {الاسم_الأول}! أسأل الله أن يبارك في عمرك ويحفظك من كل شر. عيد ميلاد سعيد! 🎉'
    },
    {
      title: 'تهنئة عيد ميلاد مفصلة',
      body: 'أبارك لك يا {الاسم_الأول} {اسم_العائلة} بمناسبة عيد ميلادك، وأسأل الله العلي القدير أن يمنحك الصحة والعافية والسعادة، وأن يبارك في عمرك ويجعل كل أيامك خيراً وبركة. كل عام وأنت بألف خير! 🎂🎉'
    },
    {
      title: 'تهنئة عيد زواج',
      body: 'بارك الله لكما يا {اسم_الزوج} و {اسم_الزوجة} بمناسبة ذكرى زواجكما، وأدام عليكما المحبة والوئام، وبارك في بيتكما وأولادكما. كل عام وأنتما بخير! 💕'
    },
    {
      title: 'تهنئة ذكرى زواج مفصلة',
      body: 'أهنئكما يا {اسم_الزوج} و {اسم_الزوجة} بمناسبة ذكرى زواجكما السعيد، وأسأل الله أن يديم عليكما نعمة المحبة والتفاهم، وأن يبارك في بيتكما ويرزقكما السعادة والهناء. كل عام وأنتما بألف خير! 🌹💍'
    },
    {
      title: 'تشجيع ومتابعة',
      body: 'السلام عليك يا {الاسم_الأول}، أتمنى أن تكون بخير وصحة جيدة. أصلي من أجلك دائماً وأتمنى أن يبارك الله في حياتك وخدمتك. لا تتردد في التواصل إذا احتجت لأي شيء. 🙏'
    },
    {
      title: 'دعوة لحضور نشاط',
      body: 'أهلاً {الاسم_الأول}، ندعوك لحضور [اسم النشاط] يوم [التاريخ] في تمام الساعة [الوقت]. نتطلع لرؤيتك ومشاركتك معنا. بارك الله فيك! ⛪'
    },
    {
      title: 'تعزية ومواساة',
      body: 'أشاركك الأحزان يا {الاسم_الأول} في هذا الوقت الصعب، وأصلي أن يعزيك الله ويقويك. تذكر أن الله معك دائماً وأننا نحبك ونصلي من أجلك. 💙'
    },
    {
      title: 'تهنئة بالنجاح',
      body: 'مبروك يا {الاسم_الأول} على نجاحك وتفوقك! أسأل الله أن يبارك في مجهودك ويوفقك في كل خطواتك القادمة. نحن فخورون بك! 🎓✨'
    },
    {
      title: 'دعوة للصلاة',
      body: 'أخي الحبيب {الاسم_الأول}، ندعوك للمشاركة في صلاة خاصة من أجل [الموضوع] يوم [التاريخ]. صلاتك مهمة ونحتاج لها. بارك الله فيك! 🙏'
    },
    {
      title: 'تذكير بالخدمة',
      body: 'أخي الحبيب {الاسم_الأول}، نذكرك بموعد خدمتك يوم [التاريخ] في تمام الساعة [الوقت]. شكراً لك على خدمتك المباركة. الرب يعوضك! ⛪'
    }
  ];

  messageTemplates.forEach(template => {
    try {
      const templateStmt = db.prepare(`
        INSERT INTO message_templates (title, body) 
        VALUES (?, ?)
      `);
      templateStmt.run([template.title, template.body]);
      templateStmt.free();
    } catch (error) {
      console.error('خطأ في إدراج قالب الرسالة:', error);
    }
  });

  console.log('تم إدراج 120 معترف وهمي مع بيانات شاملة وسجلات اعتراف وقوالب رسائل');
  
  // التحقق من النتائج
  try {
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM confessors');
    countStmt.step();
    const result = countStmt.getAsObject();
    countStmt.free();
    console.log(`إجمالي المعترفين في قاعدة البيانات: ${result.count}`);
    
    const logsCountStmt = db.prepare('SELECT COUNT(*) as count FROM confession_logs');
    logsCountStmt.step();
    const logsResult = logsCountStmt.getAsObject();
    logsCountStmt.free();
    console.log(`إجمالي سجلات الاعتراف: ${logsResult.count}`);
    
    const templatesCountStmt = db.prepare('SELECT COUNT(*) as count FROM message_templates');
    templatesCountStmt.step();
    const templatesResult = templatesCountStmt.getAsObject();
    templatesCountStmt.free();
    console.log(`إجمالي قوالب الرسائل: ${templatesResult.count}`);
  } catch (error) {
    console.error('خطأ في التحقق من النتائج:', error);
  }
};

export const saveDatabase = () => {
  if (db) {
    try {
      const data = db.export();
      localStorage.setItem('confessionApp_db', JSON.stringify(Array.from(data)));
      console.log('تم حفظ قاعدة البيانات في التخزين المحلي');
    } catch (error) {
      console.error('خطأ في حفظ قاعدة البيانات:', error);
    }
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
    console.log('تم تصدير قاعدة البيانات');
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
        console.log('تم استيراد قاعدة البيانات بنجاح');
        resolve(true);
      } catch (error) {
        console.error('خطأ في استيراد قاعدة البيانات:', error);
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const clearDatabase = async () => {
  if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) {
    localStorage.removeItem('confessionApp_db');
    db = null;
    await initDatabase();
    console.log('تم مسح قاعدة البيانات وإعادة إنشائها');
    return true;
  }
  return false;
};

export { db };