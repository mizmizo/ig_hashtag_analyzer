'use strict';

function cancel() {
    window.log.info('call howto.cancel()');
    window.ipcRenderer.invoke('cancel', '');
}




async function apply() {
  　window.log.info('call explain.apply()');
    var first_token_kari=document.form1.mini_token.value;
    var app_id_kari=document.form1.appID.value;
    var app_secret_kari=document.form1.appSecret.value;
    var pagename_kari=document.form1.FACEBOOK.value;
    const params={first_token:String(first_token_kari),app_id:String(app_id_kari),app_secret:String(app_secret_kari),pagename:String(pagename_kari)}
    const res = await ipcRenderer.invoke("generatePermanentToken",params).then((res) => {
        if(res){
            // if resitration succeeded, load and show current Setting (update only token, igID)
            window.ipcRenderer.invoke('getCurrentSetting', '').then((setting) => {
                form2.innerHTML =
                    '<input class="explain-con-input" type="text" name="tokenform" value="' + setting.ac.token + '">'
                    + '<input class="explain-con-input" type="text" name="igIDform" value="' + setting.ac.igID + '">';
            });
        } else {
            // if failed, clear forms
            form2.innerHTML =
                    '<input class="explain-con-input" type="text" name="tokenform" value="">'
                    + '<input class="explain-con-input" type="text" name="igIDform" value="">';
        }
    });
    alert("登録できました！");
}

async function regist() {
    window.log.info('call explain.regist()');
    var igID_kari=document.form2.igIDform.value;
    var token_kari=document.form2.tokenform.value
    const params={igID:String(igID_kari),token:String(token_kari)}
    const res = await ipcRenderer.invoke("registerAccessInfo",params).then((res) => {
        if(res){
            // if resitration succeeded, load and show current Setting (update only token, igID)
            window.ipcRenderer.invoke('getCurrentSetting', '').then((setting) => {
                form2.innerHTML =
                    '<input class="explain-con-input" type="text" name="tokenform" value="' + setting.ac.token + '">'
                    + '<input class="explain-con-input" type="text" name="igIDform" value="' + setting.ac.igID + '">';
            });
        } else {
            // if failed, clear forms
            form2.innerHTML =
                '<input class="explain-con-input" type="text" name="tokenform" value="">'
                + '<input class="explain-con-input" type="text" name="igIDform" value="">';
        }
    });
    alert("登録できました！");
}


function regist_setting(){
    window.log.info('call explain.regist_setting()');
    const loader = document.getElementById('loader');
    loader.classList.add('loading');
    var post_num_kari=document.form3.num_an.value;
    var top_thre_kari=document.form3.famous.value
    const params={post_num:parseFloat(post_num_kari),top_thre:parseFloat(top_thre_kari)}
    console.log(typeof(params.top_thre))
    window.ipcRenderer.invoke('registerSetting', params);
}