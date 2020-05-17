'use strict';

window.onload = function (){
    window.ipcRenderer.invoke('getTagList', 'req').then((res) => {
        genTagList(res);
    });
}

function apply() {
    window.log.info('call select.apply()');
    const loader = document.getElementById('loader');
    loader.classList.add('loading');
    let selected_tags = loadSelectedTags();
    window.ipcRenderer.invoke('analyse', selected_tags);
}

function cancel() {
    window.log.info('call select.cancel()');
    window.ipcRenderer.invoke('cancel', '');
}

function genTagList(res) {
    window.log.info('call select.genTagList()');
    let taglist = document.getElementById('taglist');
    let checkbox_html = "";
    for(const tag in res){
        checkbox_html +=
            '<label><input type="checkbox" class="checkbox-input" name="tagselect" value="'
            + tag + '">'
            + '<span class="checkbox-parts">' + tag + ' (' + res[tag] + '回)</span></label>';
    }
    taglist.innerHTML += checkbox_html;
}

function loadSelectedTags() {
    window.log.info('call select.loadSelectedtags()');
    const checkbox = document.getElementsByName("tagselect");
    let selected_tags = [];
    for(const check of checkbox){
        if(check.checked){
            selected_tags.push(check.value);
        }
    }
    window.log.info('selected tags : ');
    window.log.info(selected_tags);
    return selected_tags;
}
