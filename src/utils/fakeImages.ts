// مولد الصور الوهمية للمعترفين
export const generateFakeProfileImage = (name: string, gender: 'ذكر' | 'أنثى'): string => {
  // استخدام خدمة DiceBear لتوليد صور وهمية جميلة
  const seed = encodeURIComponent(name);
  const style = gender === 'ذكر' ? 'male' : 'female';
  
  // خدمات مختلفة للصور الوهمية
  const services = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`,
    `https://ui-avatars.com/api/?name=${seed}&background=random&color=fff&size=200&rounded=true&bold=true&format=svg`,
    `https://robohash.org/${seed}?set=set4&size=200x200&bgset=bg1`
  ];
  
  // اختيار خدمة بناءً على hash الاسم
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return services[Math.abs(hash) % services.length];
};

// قائمة بالصور الوهمية الجاهزة
export const getRandomProfileImage = (gender: 'ذكر' | 'أنثى'): string => {
  const maleImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1557862921-37829c790f19?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=face&auto=format'
  ];

  const femaleImages = [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=200&h=200&fit=crop&crop=face&auto=format'
  ];

  const images = gender === 'ذكر' ? maleImages : femaleImages;
  return images[Math.floor(Math.random() * images.length)];
};

// دالة لتحديث المعترفين الموجودين بصور وهمية
export const assignFakeImagesToConfessors = (confessors: any[]) => {
  return confessors.map(confessor => {
    if (!confessor.profileImage) {
      const fullName = `${confessor.firstName} ${confessor.familyName}`;
      return {
        ...confessor,
        profileImage: generateFakeProfileImage(fullName, confessor.gender)
      };
    }
    return confessor;
  });
};