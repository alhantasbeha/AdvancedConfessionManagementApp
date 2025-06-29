import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { Confessor, MessageTemplate } from '../../types';

interface SendMessageModalProps {
  person: Confessor;
  templates: MessageTemplate[];
  messageType: 'birthday' | 'anniversary';
  couple?: { husband: Confessor; wife: Confessor };
  onClose: () => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  person,
  templates,
  messageType,
  couple,
  onClose
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [messageBody, setMessageBody] = useState('');

  useEffect(() => {
    if (templates.length > 0) {
      setSelectedTemplateId(templates[0].id!);
    }
  }, [templates]);

  useEffect(() => {
    if (!selectedTemplateId || !person) {
      setMessageBody('');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplateId);
    if (template) {
      let body = template.body;
      
      if (messageType === 'anniversary' && couple) {
        // For anniversaries, replace couple names
        body = body.replace(/{اسم_الزوج}/g, couple.husband.firstName || '');
        body = body.replace(/{اسم_الزوجة}/g, couple.wife.firstName || '');
        body = body.replace(/{الاسم_الأول}/g, `${couple.husband.firstName} و ${couple.wife.firstName}`);
        body = body.replace(/{اسم_العائلة}/g, couple.husband.familyName || '');
      } else {
        // For birthdays or single person messages
        body = body.replace(/{الاسم_الأول}/g, person.firstName || '');
        body = body.replace(/{اسم_العائلة}/g, person.familyName || '');
      }
      
      setMessageBody(body);
    }
  }, [selectedTemplateId, templates, person, messageType, couple]);

  const handleSend = (recipient: 'husband' | 'wife' | 'both') => {
    if (!messageBody) {
      alert("نص الرسالة غير متوفر.");
      return;
    }

    const sendToPhone = (phoneNumber: string, recipientName: string) => {
      if (!phoneNumber) {
        alert(`رقم الهاتف غير متوفر لـ ${recipientName}.`);
        return;
      }
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageBody)}`;
      window.open(url, '_blank');
    };

    if (messageType === 'anniversary' && couple) {
      if (recipient === 'husband' || recipient === 'both') {
        sendToPhone(couple.husband.phone1, couple.husband.firstName);
      }
      if (recipient === 'wife' || recipient === 'both') {
        sendToPhone(couple.wife.phone1, couple.wife.firstName);
      }
    } else {
      sendToPhone(person.phone1, person.firstName);
    }

    onClose();
  };

  const getAvailableRecipients = () => {
    if (messageType === 'anniversary' && couple) {
      const recipients = [];
      if (couple.husband.phone1 && couple.husband.phone1Whatsapp) {
        recipients.push({ key: 'husband', label: couple.husband.firstName, phone: couple.husband.phone1 });
      }
      if (couple.wife.phone1 && couple.wife.phone1Whatsapp) {
        recipients.push({ key: 'wife', label: couple.wife.firstName, phone: couple.wife.phone1 });
      }
      return recipients;
    }
    return [{ key: 'person', label: person.firstName, phone: person.phone1 }];
  };

  const recipients = getAvailableRecipients();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Icon name="messages" className="w-6 h-6 text-green-500" />
            إرسال {messageType === 'birthday' ? 'تهنئة عيد ميلاد' : 'تهنئة عيد زواج'}
          </h3>
          <button onClick={onClose}>
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Recipient Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">المرسل إليه:</h4>
            {messageType === 'anniversary' && couple ? (
              <div className="space-y-2">
                <p className="font-bold">{couple.husband.firstName} و {couple.wife.firstName} {couple.husband.familyName}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {couple.husband.phone1 && (
                    <div className="flex items-center gap-2">
                      <Icon name="messages" className="w-4 h-4" />
                      <span>{couple.husband.firstName}: {couple.husband.phone1}</span>
                      {couple.husband.phone1Whatsapp && (
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                          واتساب
                        </span>
                      )}
                    </div>
                  )}
                  {couple.wife.phone1 && (
                    <div className="flex items-center gap-2">
                      <Icon name="messages" className="w-4 h-4" />
                      <span>{couple.wife.firstName}: {couple.wife.phone1}</span>
                      {couple.wife.phone1Whatsapp && (
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                          واتساب
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="font-bold">{person.firstName} {person.familyName}</p>
                {person.phone1 && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Icon name="messages" className="w-4 h-4" />
                    <span>{person.phone1}</span>
                    {person.phone1Whatsapp && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                        واتساب
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">اختر قالب الرسالة *</label>
            {templates.length === 0 ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  لا توجد قوالب متاحة لهذا النوع من الرسائل. يمكنك إضافة قوالب من صفحة الرسائل.
                </p>
              </div>
            ) : (
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                required
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Message Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">معاينة الرسالة</label>
            <div className="p-4 border rounded-lg dark:border-gray-600 bg-green-50 dark:bg-green-900 min-h-[120px]">
              {messageBody ? (
                <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  {messageBody}
                </p>
              ) : (
                <p className="text-gray-500 italic">اختر قالباً لمعاينة الرسالة</p>
              )}
            </div>
          </div>

          {/* Send Options */}
          {messageType === 'anniversary' && couple && recipients.length > 1 && (
            <div>
              <label className="block text-sm font-medium mb-2">إرسال إلى:</label>
              <div className="space-y-2">
                {recipients.map(recipient => (
                  <label key={recipient.key} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sendTo"
                      value={recipient.key}
                      defaultChecked={recipient.key === 'husband'}
                      className="w-4 h-4"
                    />
                    <span>{recipient.label} ({recipient.phone})</span>
                  </label>
                ))}
                {recipients.length === 2 && (
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sendTo"
                      value="both"
                      className="w-4 h-4"
                    />
                    <span>كلاهما</span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              إلغاء
            </button>
            
            {recipients.length > 0 && messageBody && (
              <button
                onClick={() => {
                  const sendToRadio = document.querySelector('input[name="sendTo"]:checked') as HTMLInputElement;
                  const sendToValue = sendToRadio?.value || 'husband';
                  handleSend(sendToValue as 'husband' | 'wife' | 'both');
                }}
                className="px-6 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Icon name="messages" className="w-5 h-5" />
                إرسال عبر واتساب
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};