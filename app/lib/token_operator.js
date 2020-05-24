'use strict';

const fetch = require('node-fetch');
const {AppError, checkAPIRes} = require('./err_handler');
const {dialog} = require('electron');

const fAPI = "https://graph.facebook.com/v7.0/";   // Ver.7.0

const required_scopes = [
    "pages_show_list",
    "business_management",
    "instagram_basic",
    "instagram_manage_comments",
    "instagram_manage_insights"
];


class AccessInfo {
    igID;
    token;

    constructor(igID, token) {
        if(igID === undefined){
            igID = "";
        }
        if(token === undefined){
            token = "";
        }
        this.igID = igID;
        this.token = token;
    }
}

// Check if
// ac.token
// - is valid
// - is permanent
// - has all required permissions
// ac.igID
// - is Instagram business acount ID
// If not, throw AppError
async function validateAccessInfo(ac, log){
    log.info('validateAccessInfo');
    let gURL = fAPI + "debug_token?input_token=" + ac.token + "&access_token=" + ac.token;
    log.info('gURL : ' + gURL);

    // validate token
    try {
        // === get post data ===>
        const res = await fetch(gURL, {method: 'GET'});
        const json = await res.json();
        log.info('res : ' + JSON.stringify(json));
        checkAPIRes(json); // throw if json contains error
        const debug_data = json["data"];

        if(!debug_data.is_valid){
            throw new AppError(true, 1, "アクセストークンが無効です。");
        }
        if(debug_data.expires_at != 0){
            throw new AppError(true, 1, "無期限のアクセストークンではありません。");
        }
        for(const scope of required_scopes){
            let valid = false;
            for(const granted of debug_data.granular_scopes){
                if(scope === granted.scope){
                    if(granted.target_ids){
                        // Scopeの対象がAll Objectでなかったらエラー
                        throw new AppError(true, 1, "Scope '" + scope + "' の対象IDがAllになっていません。");
                    }
                    // Scopeに対する権限を持っていればOK
                    valid = true;
                    break;
                }
            }
            if(!valid){
                // Scopeに対する権限がなかったらエラー
                throw new AppError(true, 1, "Scope '" + scope + "' に対する権限がありません。");
            }
        }
    } catch (err) {
        if(err instanceof AppError){
            throw err;
        } else {
            throw new AppError(false, 0, err.message); // treat Built-in Error as a critical error
        }
    }
}

async function generatePermanentToken(first_token, app_id, app_secret, pagename, log){
    log.info('generatePermanentToken');

    try {
        // generate 2nd-token
        let gURL = fAPI + "oauth/access_token?grant_type=fb_exchange_token&client_id="
            + app_id + "&client_secret=" + app_secret + "&fb_exchange_token=" + first_token;
        log.info('2nd_token gURL : ' + gURL);
        let res = await fetch(gURL, {method: 'GET'});
        let json = await res.json();
        log.info('res : ' + JSON.stringify(json));
        checkAPIRes(json); // throw if json contains error
        const second_token = json["access_token"];
        log.info('2nd_token : ' + second_token);

        // get FaceBook id
        gURL = fAPI + "me?access_token=" + second_token;
        log.info('FaceBook id gURL : ' + gURL);
        res = await fetch(gURL, {method: 'GET'});
        json = await res.json();
        log.info('res : ' + JSON.stringify(json));
        checkAPIRes(json); // throw if json contains error
        const fb_id = json["id"];
        log.info('FaceBook id : ' + fb_id);

        // generate 3rd-token
        gURL = fAPI + fb_id + "/accounts?access_token=" + second_token;
        log.info('3rd_token gURL : ' + gURL);
        res = await fetch(gURL, {method: 'GET'});
        json = await res.json();
        log.info('res : ' + JSON.stringify(json));
        checkAPIRes(json); // throw if json contains error
        // todo
        const pages = json["data"];
        let third_token = undefined;
        for(const page of pages){
            if(page["name"] == pagename){
                third_token = page["access_token"];
                break;
            }
        }
        if(!third_token){
            // no page exists => error
            throw new AppError(true, 1, "アクセストークンと関連付けられたFaceBook Pageが見つかりません。");
        }
        log.info('3rd_token : ' + third_token);

        // get instagram_business_account-id
        gURL = fAPI + "me?fields=instagram_business_account&access_token=" + third_token;
        log.info('igID gURL : ' + gURL);
        res = await fetch(gURL, {method: 'GET'});
        json = await res.json();
        log.info('res : ' + JSON.stringify(json));
        checkAPIRes(json); // throw if json contains error
        // todo
        const igID = json["instagram_business_account"]["id"];
        log.info('igID : ' + igID);

        // validate and return AccessInfo
        const ac = new AccessInfo(igID, third_token);
        await validateAccessInfo(ac, log);
        return ac;
    } catch (err) {
        if(err instanceof AppError){
            throw err;
        } else {
            throw new AppError(false, 0, err.message); // treat Built-in Error as a critical error
        }
    }
}

module.exports = {
    AccessInfo,
    validateAccessInfo,
    generatePermanentToken
}
