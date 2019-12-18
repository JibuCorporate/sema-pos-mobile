import realm from '../init';
const uuidv1 = require('uuid/v1');
import moment from 'moment-timezone';

class SettingRealm {
    constructor() {
        this.setting = [];
        this.settings = {
            semaUrl: 'http://142.93.115.206:3006/',
            site: '',
            user: '',
            password: '',
            uiLanguage: JSON.stringify({ name: 'English', iso_code: 'en' }),
            token: '',
            loginSync: false,
            siteId: 0
        };

        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('Settings')))).length == 0) {
                realm.create('Settings', this.settings);
            }

            if (Object.values(JSON.parse(JSON.stringify(realm.objects('TokenExpiry')))).length == 0) {
                let expirationDate = new Date();
                expirationDate.setTime(expirationDate.getTime() + 22 * 60 * 60 * 1000);
                console.log('Token will expire at: ' + expirationDate.toString());
                realm.create('TokenExpiry', { expirationDate: expirationDate.toString() });
            }
        });
    }


    truncate() {
        try {
            realm.write(() => {
                let settings = realm.objects('Settings');
                realm.delete(settings);

            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    getAllSetting() {
        return this.setting = { ...Object.values(JSON.parse(JSON.stringify(realm.objects('Settings'))))[0], uiLanguage: JSON.parse(Object.values(JSON.parse(JSON.stringify(realm.objects('Settings'))))[0].uiLanguage) };
    }

    initialise() {
        return this.getAllSetting();
    }

    setTokenExpiration() {
        // Currently the token is good for one day (24 hours)
        realm.write(() => {
            let expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + 22 * 60 * 60 * 1000);
            console.log('Token will expire at: ' + expirationDate.toString());
            let tokenExpiryObj = realm.objects('TokenExpiry');
            tokenExpiryObj[0].expirationDate = expirationDate.toISOString()
        })

    }
    
    getTokenExpiration() {
        return  JSON.parse(JSON.stringify(realm.objects('TokenExpiry')))['0'].expirationDate;
    }

    formatDay(date) {
        date = new Date(date);
        var day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();
        if (month.toString().length == 1) {
            month = "0" + month;
        }
        if (day.toString().length == 1) {
            day = "0" + day;
        }

        return date = year + '-' + month + '-' + day;
    }


    saveSettings(url, site, user, password, uiLanguage, token, siteId, loginSync) {
        console.log('uiLanguage', uiLanguage);
        let settings = {
            semaUrl: url,
            site,
            user,
            password,
            uiLanguage: JSON.stringify(uiLanguage),
            token,
            siteId,
            loginSync
        };
        this.settings = settings;
        try {
            realm.write(() => {
                let settingObj = realm.objects('Settings');
                console.log(settingObj[0])
                settingObj[0].semaUrl = settings.semaUrl;
                settingObj[0].site = site;
                settingObj[0].user = user;
                settingObj[0].password = password;
                settingObj[0].uiLanguage = settings.uiLanguage;
                settingObj[0].token = token;
                settingObj[0].siteId = siteId;
                settingObj[0].loginSync = loginSync;

            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

}

export default new SettingRealm();
