import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { KeyValue } from './common/utils'

const resources = {
    EN: {
        translation: {
            "welcome": "Welcome to PPE-Allocation",
            'special_items': 'Special items',
            'access_check': 'Access Check',
            'issue_return': 'Issue & Return',
        }
    },
    MN: {
        translation: {
            "welcome": "Тавтай морил: PPE-Allocation",
            'special_items': 'Тусгай хэрэгсэл',
            'access_check': 'Эрх шалгах',
            'issue_return': 'Олголт & Буцаалт',
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: KeyValue('iLang') ?? 'EN',
        interpolation: {
            escapeValue: false /** React already safes from XSS */
        }
    })

export default i18n