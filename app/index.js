'use strict';

function apply() {
    const loader = document.getElementById('loader');
    loader.classList.add('loading');
    window.ipcRenderer.invoke('requestPostData', 'req');
}
