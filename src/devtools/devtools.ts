import extension from '../extension';
chrome.devtools.panels.create(extension.name, '', 'src/devtools/panel.html');
