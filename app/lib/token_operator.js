'use strict';

const fetch = require('node-fetch');
const {AppError, checkAPIRes} = require('./err_handler');

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
    if(log){
        log.info('validateAccessInfo');
    }
    let gURL = fAPI + "debug_token?input_token=" + ac.token + "&access_token=" + ac.token;
    if(log){
        log.info('gURL : ' + gURL);
    }

    // validate token
    try {
        // === get post data ===>
        const res = await fetch(gURL, {method: 'GET'});
        const json = await res.json();
        if(log){
            log.info('res : ' + JSON.stringify(json));
        }
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

function generatePermanentToken(first_token, log){
}

module.exports = {
    AccessInfo,
    validateAccessInfo,
    generatePermanentToken
}
