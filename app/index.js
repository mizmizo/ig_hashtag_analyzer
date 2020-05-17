'use strict';

function apply() {
    window.log.info('call index.apply()');
    const loader = document.getElementById('loader');
    loader.classList.add('loading');
    window.ipcRenderer.invoke('requestPostData', 'req');
}
