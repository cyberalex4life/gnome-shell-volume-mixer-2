/**
 * Shell Volume Mixer
 *
 * Advanced mixer extension.
 *
 * @author Harry Karvonen <harry.karvonen@gmail.com>
 * @author Alexander Hofbauer <alex@derhofbauer.at>
 */

/* exported init, enable, disable */

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;

const Menu = Extension.imports.menu;
const Mixer = Extension.imports.mixer;
const Panel = Extension.imports.panel;
const Settings = Extension.imports.settings;

let settings;

let aggregateMenu;
let volumeIndicator;
let volumeIcon;
let volumeMenu;
let volumeActor;
let mixer;

let menu;
let gvmIndicator;

const Scripting = imports.ui.scripting;

function init() {
    settings = new Settings.Settings();
    aggregateMenu = Main.panel.statusArea.aggregateMenu;
    volumeIndicator = aggregateMenu._volume;
    volumeIcon = volumeIndicator._primaryIndicator;
    volumeMenu = volumeIndicator._volumeMenu;
    volumeActor = volumeMenu.actor;
}

function enable() {
	sleep(10);
	
    settings.connectChanged(function() {
        disable();
        enable();
    });

    mixer = new Mixer.Mixer();

    let position = settings.get_enum('position');

	sleep(10);
    if (position === Settings.POS_MENU) {
        replaceOriginal();
    } else {
        addPanelButton(position);
    }
}

function replaceOriginal() {
    gvmIndicator = new Menu.Indicator(mixer, {
        separator: false
    });

    volumeActor.hide();
    volumeIcon.hide();

    // add our own indicator and menu
    aggregateMenu._volume = gvmIndicator;
    aggregateMenu._indicators.insert_child_at_index(gvmIndicator.indicators, 3);
    aggregateMenu.menu.addMenuItem(gvmIndicator.menu, 0);

    aggregateMenu.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem(), 1);

    // on disable/enable we won't get a stream-changed event, so trigger it here to be safe
    gvmIndicator.updateIcon();
}

function addPanelButton(position) {
    let removeOriginal = settings.get_boolean('remove-original');
    if (removeOriginal) {
        volumeActor.hide();
        volumeIcon.hide();
    }

    menu = new Panel.Button(mixer, {
        separator: false
    });

    if (position === Settings.POS_LEFT) {
        Main.panel.addToStatusArea('ShellvolumeActor', menu, 999, 'left');
    } else if (position === Settings.POS_CENTER) {
        Main.panel.addToStatusArea('ShellvolumeActor', menu, 999, 'center');
    } else {
        Main.panel.addToStatusArea('ShellvolumeActor', menu);
    }
}

function sleep(n) {
	yield Scripting.sleep(n);
	yield Scripting.waitLeisure();
}
function disable() {
	sleep(10);


    if (gvmIndicator) {
        aggregateMenu._indicators.remove_actor(gvmIndicator.indicators);
        gvmIndicator.destroy();
        gvmIndicator = null;
    }
	sleep(10);
    if (menu) {
        menu.destroy();
        menu = null;
    }
	sleep(10);
    if (mixer) {
        mixer.disconnectAll();
        mixer = null;
    }

    sleep(10);

	Settings.cleanup();
	
    sleep(10);
    
    volumeActor.show();
    volumeIcon.show();
    aggregateMenu._volume = volumeIndicator;
}
