// استخدام localStorage فقط بدون sql.js
let db: any = null;

// محاكي قاعدة بيانات بسيط باستخدام localStorage
class SimpleDB {
  private data: any = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('confessionApp_simpleDB');
      if (stored) {
        this.data = JSON.parse(stored);
      } else {
        this.initializeDefaultData();
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      this.initializeDefaultData();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('confessionApp_simpleDB', JSON.stringify(this.data));
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
    }
  }

  private initializeDefaultData() {
    this.data = {
      confessors: this.generateFakeConfessors(),
      confession_logs: this.generateFakeConfessionLogs(),
      message_templates: this.generateFakeMessageTemplates(),
      settings: this.generateDefaultSettings()
    };
    this.saveToStorage();
  }

  private generateFakeConfessors() {
    const maleFirstNames = [
      'أحمد', 'محمد', 'علي', 'حسن', 'محمود', 'عبدالله', 'يوسف', 'إبراهيم', 'عمر', 'خالد',
      'مصطفى', 'طارق', 'سامح', 'هشام', 'وائل', 'أسامة', 'كريم', 'تامر', 'شريف', 'عادل',
      'ماجد', 'فادي', 'مينا', 'جورج', 'بيتر', 'مارك', 'أندرو', 'ديفيد', 'مايكل', 'جون'
    ];

    const femaleFirstNames = [
      'فاطمة', 'عائشة', 'خديجة', 'زينب', 'مريم', 'سارة', 'نور', 'هدى', 'أمل', 'رانيا',
      'دينا', 'منى', 'سمر', 'نادية', 'ليلى', 'سلمى', 'ياسمين', 'نهى', 'إيمان', 'هالة',
      'مارينا', 'كريستينا', 'نانسي', 'فيرونيا', 'مريانا', 'إيرين', 'جيهان', 'سوزان'
    ];

    const fatherNames = [
      'محمد', 'أحمد', 'علي', 'حسن', 'إبراهيم', 'عبدالله', 'محمود', 'يوسف', 'عمر', 'خالد',
      'مصطفى', 'طارق', 'سامح', 'هشام', 'وائل', 'أسامة', 'كريم', 'عادل', 'ماجد', 'فادي'
    ];

    const familyNames = [
      'محمد', 'أحمد', 'علي', 'حسن', 'إبراهيم', 'السيد', 'عبدالرحمن', 'الشريف', 'النجار', 'الطيب',
      'المصري', 'القاهري', 'الإسكندراني', 'الصعيدي', 'البحيري', 'الدمياطي', 'المنوفي', 'الغربي',
      'جرجس', 'يوسف', 'فهمي', 'زكي', 'رزق', 'عطية', 'بشارة', 'منصور', 'حنا', 'عبدالمسيح'
    ];

    const churches = [
      'كنيسة العذراء مريم - مصر الجديدة',
      'كنيسة مار جرجس - شبرا',
      'كنيسة الأنبا أنطونيوس - المعادي',
      'كنيسة مار مينا - فلمنج',
      'كنيسة الشهيد أبانوب - الإسكندرية',
      'كنيسة العذراء والأنبا بيشوي - الزيتون',
      'كنيسة الأنبا كاراس - المنيل',
      'كنيسة مار مرقس - الأزبكية'
    ];

    const professions = [
      'مهندس', 'طبيب', 'محاسب', 'صيدلي', 'محامي', 'مدرس', 'موظف', 'ربة منزل',
      'طالب', 'متقاعد', 'تاجر', 'فني', 'ممرض', 'طبيب أسنان', 'مبرمج', 'مصمم'
    ];

    const services = [
      'خدمة مدارس الأحد', 'خدمة شباب', 'كورال', 'خدمة اجتماعية', 'خدمة الشمامسة',
      'خدمة الكشافة', 'خدمة المرأة', 'خدمة كبار السن', 'خدمة الأطفال'
    ];

    const personalTags = [
      'طالب', 'مغترب', 'جديد', 'نشط', 'يحتاج متابعة', 'قيادي', 'متطوع',
      'موهوب', 'مبدع', 'مساعد', 'منتظم', 'متميز'
    ];

    const confessors = [];

    for (let i = 1; i <= 80; i++) {
      const gender = Math.random() > 0.5 ? 'ذكر' : 'أنثى';
      const firstName = gender === 'ذكر' 
        ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
        : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
      
      const fatherName = fatherNames[Math.floor(Math.random() * fatherNames.length)];
      const familyName = familyNames[Math.floor(Math.random() * familyNames.length)];
      
      const birthYear = 1950 + Math.floor(Math.random() * 55);
      const birthMonth = Math.floor(Math.random() * 12);
      const birthDay = Math.floor(Math.random() * 28) + 1;
      const birthDate = `${birthYear}-${(birthMonth + 1).toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
      
      const age = new Date().getFullYear() - birthYear;
      
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

      const phone1 = `010${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      const phone1Whatsapp = Math.random() > 0.2;
      
      const church = churches[Math.floor(Math.random() * churches.length)];
      const profession = professions[Math.floor(Math.random() * professions.length)];
      
      const selectedServices = services.filter(() => Math.random() > 0.7).slice(0, 3);
      const selectedTags = personalTags.filter(() => Math.random() > 0.6).slice(0, 2);
      
      const isDeacon = gender === 'ذكر' && age >= 25 && Math.random() > 0.85;
      const isDeceased = age >= 70 && Math.random() > 0.95;
      
      let marriageDate = null;
      let spouseName = null;
      let children = [];
      
      if (socialStatus === 'متزوج') {
        const marriageYear = Math.max(birthYear + 18, 1970);
        marriageDate = `${marriageYear + Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}`;
        
        if (gender === 'ذكر') {
          spouseName = femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)] + ' ' + familyName;
        } else {
          spouseName = maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)] + ' ' + familyNames[Math.floor(Math.random() * familyNames.length)];
        }
        
        const numChildren = Math.floor(Math.random() * 4);
        for (let j = 0; j < numChildren; j++) {
          const childGender = Math.random() > 0.5 ? 'ذكر' : 'أنثى';
          const childName = childGender === 'ذكر' 
            ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
            : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
          
          const childBirthYear = new Date(marriageDate).getFullYear() + 1 + j * 2;
          const childBirthDate = `${childBirthYear}-${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}`;
          
          children.push({
            name: childName + ' ' + firstName,
            birthDate: childBirthDate,
            phone: ''
          });
        }
      }

      confessors.push({
        id: i.toString(),
        firstName,
        fatherName,
        grandFatherName: Math.random() > 0.5 ? fatherNames[Math.floor(Math.random() * fatherNames.length)] : '',
        familyName,
        phone1,
        phone1Whatsapp,
        phone2: '',
        phone2Whatsapp: false,
        gender,
        birthDate,
        socialStatus,
        marriageDate,
        church,
        confessionStartDate: age >= 18 ? `${Math.max(birthYear + 18, 1990)}-01-01` : '',
        profession,
        services: selectedServices,
        personalTags: selectedTags,
        isDeacon,
        isDeceased,
        notes: Math.random() > 0.5 ? 'شخص نشط في الخدمة ومتفاعل مع الأنشطة الكنسية.' : '',
        spouseName,
        spousePhone: '',
        children,
        isArchived: false,
        profileImage: '',
        customFields: {}
      });
    }

    return confessors;
  }

  private generateFakeConfessionLogs() {
    const logs = [];
    const confessionTags = [
      'نمو روحي', 'مشاكل أسرية', 'مشاكل شخصية', 'ضعف عام', 'توبة', 'إرشاد',
      'تشجيع', 'صلاة', 'دراسة كتابية', 'خدمة', 'علاقات', 'عمل'
    ];

    const logNotes = [
      'جلسة اعتراف مثمرة، نمو روحي ملحوظ.',
      'مناقشة حول التحديات الشخصية والصلاة.',
      'تشجيع في الخدمة والمشاركة الكنسية.',
      'إرشاد حول العلاقات الأسرية.',
      'صلاة من أجل النجاح في العمل/الدراسة.',
      'تأمل في كلمة الله وتطبيقها العملي.'
    ];

    for (let i = 1; i <= 200; i++) {
      const confessorId = Math.floor(Math.random() * 80) + 1;
      const year = 2020 + Math.floor(Math.random() * 5);
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const selectedTags = confessionTags.filter(() => Math.random() > 0.6).slice(0, 3);
      const notes = Math.random() > 0.3 ? logNotes[Math.floor(Math.random() * logNotes.length)] : '';

      logs.push({
        id: i.toString(),
        confessorId: confessorId.toString(),
        date,
        notes,
        tags: selectedTags
      });
    }

    return logs;
  }

  private generateFakeMessageTemplates() {
    return [
      {
        id: '1',
        title: 'تهنئة عيد ميلاد بسيطة',
        body: 'كل عام وأنت بخير يا {الاسم_الأول}! أسأل الله أن يبارك في عمرك ويحفظك من كل شر. عيد ميلاد سعيد! 🎉'
      },
      {
        id: '2',
        title: 'تهنئة عيد ميلاد مفصلة',
        body: 'أبارك لك يا {الاسم_الأول} {اسم_العائلة} بمناسبة عيد ميلادك، وأسأل الله العلي القدير أن يمنحك الصحة والعافية والسعادة، وأن يبارك في عمرك ويجعل كل أيامك خيراً وبركة. كل عام وأنت بألف خير! 🎂🎉'
      },
      {
        id: '3',
        title: 'تهنئة عيد زواج',
        body: 'بارك الله لكما يا {اسم_الزوج} و {اسم_الزوجة} بمناسبة ذكرى زواجكما، وأدام عليكما المحبة والوئام، وبارك في بيتكما وأولادكما. كل عام وأنتما بخير! 💕'
      },
      {
        id: '4',
        title: 'تشجيع ومتابعة',
        body: 'السلام عليك يا {الاسم_الأول}، أتمنى أن تكون بخير وصحة جيدة. أصلي من أجلك دائماً وأتمنى أن يبارك الله في حياتك وخدمتك. لا تتردد في التواصل إذا احتجت لأي شيء. 🙏'
      }
    ];
  }

  private generateDefaultSettings() {
    return {
      professions: [
        'مهندس', 'طبيب', 'محاسب', 'صيدلي', 'محامي', 'مدرس', 'موظف', 'ربة منزل',
        'طالب', 'متقاعد', 'تاجر', 'فني', 'ممرض', 'طبيب أسنان', 'مبرمج', 'مصمم'
      ],
      services: [
        'خدمة مدارس الأحد', 'خدمة شباب', 'كورال', 'خدمة اجتماعية', 'خدمة الشمامسة',
        'خدمة الكشافة', 'خدمة المرأة', 'خدمة كبار السن', 'خدمة الأطفال'
      ],
      personalTags: [
        'طالب', 'مغترب', 'جديد', 'نشط', 'يحتاج متابعة', 'قيادي', 'متطوع',
        'موهوب', 'مبدع', 'مساعد', 'منتظم', 'متميز'
      ],
      confessionTags: [
        'نمو روحي', 'مشاكل أسرية', 'مشاكل شخصية', 'ضعف عام', 'توبة', 'إرشاد',
        'تشجيع', 'صلاة', 'دراسة كتابية', 'خدمة', 'علاقات', 'عمل'
      ]
    };
  }

  // طرق للتعامل مع البيانات
  select(table: string, where?: any): any[] {
    if (!this.data[table]) return [];
    
    let results = [...this.data[table]];
    
    if (where) {
      results = results.filter(item => {
        return Object.keys(where).every(key => {
          if (where[key] === null || where[key] === undefined) {
            return item[key] === null || item[key] === undefined;
          }
          return item[key] === where[key];
        });
      });
    }
    
    return results;
  }

  insert(table: string, data: any): string {
    if (!this.data[table]) this.data[table] = [];
    
    const newId = (Math.max(0, ...this.data[table].map((item: any) => parseInt(item.id) || 0)) + 1).toString();
    const newItem = { ...data, id: newId };
    
    this.data[table].push(newItem);
    this.saveToStorage();
    
    return newId;
  }

  update(table: string, id: string, data: any): boolean {
    if (!this.data[table]) return false;
    
    const index = this.data[table].findIndex((item: any) => item.id === id);
    if (index === -1) return false;
    
    this.data[table][index] = { ...this.data[table][index], ...data };
    this.saveToStorage();
    
    return true;
  }

  delete(table: string, id: string): boolean {
    if (!this.data[table]) return false;
    
    const index = this.data[table].findIndex((item: any) => item.id === id);
    if (index === -1) return false;
    
    this.data[table].splice(index, 1);
    this.saveToStorage();
    
    return true;
  }

  getSetting(key: string): any {
    return this.data.settings[key];
  }

  setSetting(key: string, value: any): void {
    this.data.settings[key] = value;
    this.saveToStorage();
  }

  export(): string {
    return JSON.stringify(this.data, null, 2);
  }

  import(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData);
      this.data = importedData;
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('خطأ في استيراد البيانات:', error);
      return false;
    }
  }

  clear(): void {
    this.data = {
      confessors: [],
      confession_logs: [],
      message_templates: [],
      settings: this.generateDefaultSettings()
    };
    this.saveToStorage();
  }
}

export const initDatabase = async () => {
  if (!db) {
    db = new SimpleDB();
    console.log('تم تهيئة قاعدة البيانات المحلية');
  }
  return db;
};

export const saveDatabase = () => {
  // البيانات تُحفظ تلقائياً في SimpleDB
  console.log('تم حفظ قاعدة البيانات');
};

export const exportDatabase = () => {
  if (db) {
    const data = db.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confession_app_backup_${new Date().toISOString().split('T')[0]}.json`;
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
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        if (db && db.import(jsonData)) {
          console.log('تم استيراد قاعدة البيانات بنجاح');
          resolve(true);
        } else {
          reject(new Error('فشل في استيراد البيانات'));
        }
      } catch (error) {
        console.error('خطأ في استيراد قاعدة البيانات:', error);
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

export const clearDatabase = async () => {
  if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) {
    if (db) {
      db.clear();
      console.log('تم مسح قاعدة البيانات');
      return true;
    }
  }
  return false;
};

export { db };