'use strict';

window.onload = function (){
    window.ipcRenderer.invoke('getTagList', 'req').then((res) => {
        log.info("get tag");
        log.info(res);
    });
}

function apply() {
    let selected_tags = ['ぼくときみとの物語', 'ポートレートセクション'];
    window.ipcRenderer.invoke('analyse', selected_tags);
}
