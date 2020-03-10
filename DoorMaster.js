/*
DoorMaster
A complex door management system for Roll20

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
    https://www.patreon.com/benscripts
*/

var DoorMaster = DoorMaster || (function () {
    'use strict';

    //---- INFO ----//

    var version = '4.5',
    timestamp = 1583869205925,
    debugMode = false,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 6px 8px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 6px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        resultBox: 'margin: 3px; padding: 2px 6px; border: 1px solid #c1c1c1; border-radius: 9px; font-variant: small-caps; color: #545454;',
        result: 'font-size: 1.125em; font-weight: bold; cursor: pointer; font-family: "Lucida Console", Monaco, monospace;',
        msg: 'padding: 4px 10px; color: #C91010; font-size: 1em; border: 1px solid #C91010; text-align: center;'
    },
    DOOR_CONDITIONS = ['Unlocked', 'Locked', 'Keyed', 'Barred', 'Obstructed', 'Stuck', 'Disabled', 'Broken'],

    checkInstall = function () {
        if (!_.has(state, 'DoorMaster')) state['DoorMaster'] = state['DoorMaster'] || {};
        if (typeof state['DoorMaster'].doors == 'undefined') state['DoorMaster'].doors = [];
        if (typeof state['DoorMaster'].doorCharID == 'undefined') state['DoorMaster'].doorCharID = '';
        if (typeof state['DoorMaster'].doorKeyedCharID == 'undefined') state['DoorMaster'].doorKeyedCharID = '';
        if (typeof state['DoorMaster'].switchCharID == 'undefined') state['DoorMaster'].switchCharID = '';
        if (typeof state['DoorMaster'].lockCharID == 'undefined') state['DoorMaster'].lockCharID = '';
        if (typeof state['DoorMaster'].trapCharID == 'undefined') state['DoorMaster'].trapCharID = '';
        if (typeof state['DoorMaster'].trapKeyedCharID == 'undefined') state['DoorMaster'].trapKeyedCharID = '';
        if (typeof state['DoorMaster'].lockedTokens == 'undefined') state['DoorMaster'].lockedTokens = [];
        if (typeof state['DoorMaster'].allowFumbles == 'undefined') state['DoorMaster'].allowFumbles = true;
        if (typeof state['DoorMaster'].trapFumbles == 'undefined') state['DoorMaster'].trapFumbles = true;
        if (typeof state['DoorMaster'].showPlayersRolls == 'undefined') state['DoorMaster'].showPlayersRolls = false;
        if (typeof state['DoorMaster'].whisper == 'undefined') state['DoorMaster'].whisper = false;
        if (typeof state['DoorMaster'].useAura == 'undefined') state['DoorMaster'].useAura = true;
        if (typeof state['DoorMaster'].doorAuraColor == 'undefined') state['DoorMaster'].doorAuraColor = '#666666';
        if (typeof state['DoorMaster'].hiddenAuraColor == 'undefined') state['DoorMaster'].hiddenAuraColor = '#99cc99';
        if (typeof state['DoorMaster'].obfuscateState == 'undefined') state['DoorMaster'].obfuscateState = true;
        if (state['DoorMaster'].doorKeyedCharID == '' || state['DoorMaster'].switchCharID == '' || state['DoorMaster'].lockCharID == ''
            || state['DoorMaster'].trapCharID == '' || state['DoorMaster'].trapKeyedCharID == '') state['DoorMaster'].showInit = true;
        runUpgrades();

        log('--> DoorMaster v' + version + ' <-- Initialized');
		if (debugMode) {
			var d = new Date();
			showDialog('Debug Mode', 'DoorMaster v' + version + ' loaded at ' + d.toLocaleTimeString() + '<br><a style=\'' + styles.textButton + '\' href="!door config">Show config</a>', 'GM');
			//showDialog('', 'Timestamp: ' + d.valueOf(), 'GM');
		}

        if (createDoorChars()) {
            var macro = createMacro();
            showDialog('Welcome', 'Characters have been created for use by the DoorMaster script. <i>Do not</i> rename or delete them.' + (macro ? ' A macro has also been created to give easy acces to the Status, Create, and Destroy functions.' : '') + '<div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!door config">Show config</a></div>', 'GM');
            state['DoorMaster'].showInit = false;
        }
    },

    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!door')) {
			var parms = msg.content.split(/\s+/i);
			if (parms[1]) {
				switch (parms[1]) {
					case 'use':
							commandUseDoor(msg);
						break;
					case 'pick':
							commandUseDoor(msg, 'pick');
						break;
					case 'break':
							commandUseDoor(msg, 'break');
						break;
					case 'key':
							commandUseKey(msg);
						break;
					case 'disable-trap':
							commandDisableTrap(msg);
						break;
					case 'help':
							commandHelp(msg);
						break;
					case 'config':
						if (playerIsGM(msg.playerid)) {
							commandConfig(msg);
						}
						break;
					case 'create':
						if (playerIsGM(msg.playerid)) {
							commandCreateDoor(msg);
						}
						break;
					case 'destroy':
						if (playerIsGM(msg.playerid)) {
							commandDestroyDoor(msg);
						}
						break;
					case 'status':
						if (playerIsGM(msg.playerid)) {
							commandDoorStatus(msg);
						}
						break;
					case 'link':
						if (playerIsGM(msg.playerid)) {
							commandLinkDoors(msg);
						}
						break;
					case 'ping':
						if (playerIsGM(msg.playerid)) {
							commandPingToken(msg);
						}
						break;
					case 'macro':
						if (playerIsGM(msg.playerid)) {
							createMacro(msg.content);
						}
						break;
					case 'purge':
						if (playerIsGM(msg.playerid)) {
							purgeOldDoors(msg);
						}
						break;
				}
			}
		}
    },

    commandConfig = function (msg) {
        var message = '', err = '', parms = msg.content.replace('!hm config ', '').split(/\s*\-\-/i);
        _.each(parms, function (x) {
            var action = x.trim().split(/\s*\|\s*/i);
            if (action[0] == 'aura-color') {
                if (action[1].match(/^([0-9a-fA-F]{3}){1,2}$/) !== null) state['DoorMaster'].doorAuraColor = '#' + action[1];
                else err = '⚠️ "' + action[1] + '" is not a valid hexadecimal color value!';
            }
            if (action[0] == 'hidden-color') {
                if (action[1].match(/^([0-9a-fA-F]{3}){1,2}$/) !== null) state['DoorMaster'].hiddenAuraColor = '#' + action[1];
                else err = '⚠️ "' + action[1] + '" is not a valid hexadecimal color value!';
            }
            if (action[0] == 'aura-toggle') state['DoorMaster'].useAura = !state['DoorMaster'].useAura;
            if (action[0] == 'fumble-toggle') state['DoorMaster'].allowFumbles = !state['DoorMaster'].allowFumbles;
            if (action[0] == 'trap-fumble-toggle') state['DoorMaster'].trapFumbles = !state['DoorMaster'].trapFumbles;
            if (action[0] == 'show-toggle') state['DoorMaster'].showPlayersRolls = !state['DoorMaster'].showPlayersRolls;
            if (action[0] == 'whisper-toggle') state['DoorMaster'].whisper = !state['DoorMaster'].whisper;
            if (action[0] == 'obstate-toggle') state['DoorMaster'].obfuscateState = !state['DoorMaster'].obfuscateState;
        });

        if (err != '') {
            message += '<p style=\'' + styles.msg + '\'>' + err + '</p>';
        }

        message += '<div style=\'' + styles.title + '\'>Door Indicator: ' + (state['DoorMaster'].useAura ? 'On' : 'Off') + '</div>';
        if (!state['DoorMaster'].useAura) {
            message += 'You are not using a Door Indicator aura to highlight your doors for players. ';
            message += '<a style=\'' + styles.textButton + '\' href="!door config --aura-toggle">turn on</a><br>';
        } else {
            message += 'Enter a hexadecimal color value without the hash (#). ';
            message += '<a style=\'' + styles.textButton + '\' href="!door config --aura-toggle">turn off</a><br>';
            message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '; background-color: ' + state['DoorMaster'].doorAuraColor + '; color: ' + getContrastColor(state['DoorMaster'].doorAuraColor) + '" href="!door config --aura-color|&#63;&#123;Color&#124;' + state['DoorMaster'].doorAuraColor.substr(1) + '&#125;" title="Change the Door Indicator color">Change 🎨</a></div>';
        }

        message += '<hr style="margin: 4px 12px 8px;"><div style=\'' + styles.title + '\'>Hidden Door Indicator</div>';
        message += 'Enter a hexadecimal color value without the hash (#).<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '; background-color: ' + state['DoorMaster'].hiddenAuraColor + '; color: ' + getContrastColor(state['DoorMaster'].hiddenAuraColor) + '" href="!door config --hidden-color|&#63;&#123;Color&#124;' + state['DoorMaster'].hiddenAuraColor.substr(1) + '&#125;" title="Change the Hidden Door Indicator color">Change 🎨</a></div>';

        message += '<hr style="margin: 4px 12px 8px;"><div style=\'' + styles.title + '\'>Fumbles</div>';
        message += '<b>Lock Picking:</b> <a style=\'' + styles.textButton + '\' href="!door config --fumble-toggle" title="Turn lock picking fumbles ' + (state['DoorMaster'].allowFumbles ? 'off' : 'on') + '">' + (state['DoorMaster'].allowFumbles ? 'ON' : 'OFF') + '</a><br>';
        message += 'On a natural 1, the lock will ' + (state['DoorMaster'].allowFumbles ? '' : '<i>not</i> ') + 'be rendered Disabled.<br><br>';

        message += '<B>Trap Disabling:</b> <a style=\'' + styles.textButton + '\' href="!door config --trap-fumble-toggle" title="Turn trap disabling fumbles ' + (state['DoorMaster'].trapFumbles ? 'off' : 'on') + '">' + (state['DoorMaster'].trapFumbles ? 'ON' : 'OFF') + '</a><br>';
        message += 'On a natural 1, the trap will ' + (state['DoorMaster'].trapFumbles ? '' : '<i>not</i> ') + 'be triggered.';

        message += '<hr style="margin: 4px 12px 8px;"><div style=\'' + styles.title + '\'>Other Options</div>';
        message += '<b>Show Results:</b> <a style=\'' + styles.textButton + '\' href="!door config --show-toggle" title="' + (state['DoorMaster'].showPlayersRolls ? 'Hide' : 'Show') + ' roll results to players">' + (state['DoorMaster'].showPlayersRolls ? 'ON' : 'OFF') + '</a><br>';
        message += '<b>Whisper Actions:</b> <a style=\'' + styles.textButton + '\' href="!door config --whisper-toggle" title="Turn ' + (state['DoorMaster'].whisper ? 'OFF' : 'ON') + ' whispered door interaction dialog">' + (state['DoorMaster'].whisper ? 'ON' : 'OFF') + '</a><br>';
        message += '<b>Obfuscate States:</b> <a style=\'' + styles.textButton + '\' href="!door config --obstate-toggle" title="Turn ' + (state['DoorMaster'].obfuscateState ? 'OFF' : 'ON') + ' door state obfuscation for players">' + (state['DoorMaster'].obfuscateState ? 'ON' : 'OFF') + '</a><br>';

        message += '<hr style="margin: 4px 12px 8px;">You have created ' + (_.size(state['DoorMaster'].doors) == 0 ? 'no doors yet' : (_.size(state['DoorMaster'].doors) == 1 ? '1 door' : _.size(state['DoorMaster'].doors) + ' doors')) + '.<br>';

        message += (_.size(findObjs({type: 'macro', name: 'DoorMaster'})) == 0 ? '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + ';" href="!door macro config" title="Create macro for Status, Create, and Destroy commands">Create GM Macro</a></div>' : '<br>');

        message += '<p>See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/DoorMaster">documentation</a> for complete instructions.</p>';
        showDialog('', message, 'GM');
	},

    commandHelp = function (msg) {
        var message = '<p><b>Use</b><br>Use a door or switch. <i>Try this first.</i> If the door is unlocked, it will simply open or close the door. If the door is locked, stuck or anything else, you will notified.</p>';
        message += '<p><b>Key</b><br>Use a passphrase to work the lock of a door.</p>';
        message += '<p><b>Pick</b><br>Try to pick the lock of a locked door. If you control more than one character you will be asked to select which one is making the attempt. Then you will select the skill that character should use, and indicate if they have Advantage or Disadvantage on the roll.</p>';
        if (state['DoorMaster'].allowFumbles) message += '<p>If you fumble in your attempt to pick the lock, it will be disabled and cannot be picked or unlocked thereafter.</p>';
        message += '<p><b>Break</b><br>Attempt to open the door by brute force. If you control more than one character you will be asked to select which one is making the attempt. Then you will select the skill to use, and indicate if they have Advantage or Disadvantage.</p>';
        message += '<p>Beware, you may break the door completely or destroy its lock, preventing it from being unlocked if the door gets closed.</p>';
        message += '<p><b>Disable</b><br>Try to disable a trap. As above, you will select a character if neccessary, the skill to use, and if to use Advantage or Disadvantage on the roll.</p>';
        if (state['DoorMaster'].trapFumbles) message += '<p>If you fumble in your attempt, you will trigger the trap.</p>';
        showDialog('DoorMaster Help', message, msg.who);
    },

    commandCreateDoor = function (msg) {
        var message = '', parms = msg.content.split(/\s*\-\-/i);
        if (_.size(msg.selected) < 2) {
            showDialog('Creation Error', 'You need at least 2 tokens selected to create a door.', 'GM');
            return;
        }

        var paths = [], dials = [], tiles = [], decoys = [], now = new Date(), door_tokens = [],
        new_door = {open: false, tokens_locked: false, created: now.valueOf()};
        _.each(msg.selected, function (obj) {
            var token = getObj(obj._type, obj._id);
            if (token) {
                if (token.get('type') == 'graphic') {
                    var token_name = token.get('name').trim();
                    switch (token_name) {
                        case 'Closed':
                            new_door.closed_id = token.get('id');
                            new_door.condition = (_.find(DOOR_CONDITIONS, function (x) { return x == token.get('bar1_value').trim(); }) && token.get('bar1_value').trim() != 'Broken') ? token.get('bar1_value').trim() : 'Unlocked';
                            new_door.visibility = (token.get('bar1_max') == 'Secret' || token.get('bar1_max') == 'Concealed') ? token.get('bar1_max') : 'Visible';
                            new_door.hidden = (token.get('bar1_max') == 'Secret' || token.get('bar1_max') == 'Concealed');
                            new_door.lockDC = (isNum(token.get('bar2_value'))) ? parseInt(token.get('bar2_value')) : 12;
                            new_door.breakDC = (isNum(token.get('bar2_max'))) ? parseInt(token.get('bar2_max')) : (new_door.condition == 'Barred' ? 30 : 15);
                            new_door.lock_passphrase = token.get('bar3_value').trim();
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                        case 'Open':
                            new_door.open_id = token.get('id');
                            if (token.get('bar1_value') != '') {
                                new_door.trap = {triggers: [], disableDC: '', hidden: true, disabled: false, disable_after_trigger: true, break_door: false, effect: ''};
                                new_door.trap['triggers'] = getTriggers(token.get('bar1_value'));
                                new_door.trap['disableDC'] = (isNum(token.get('bar2_value'))) ? parseInt(token.get('bar2_value')) : 15;
                                new_door.trap['break_door'] = (_.find(['true', 'yes', '1', 'on'], function (x) { return x == token.get('bar3_value').trim().toLowerCase(); }) ? true : false);
                                new_door.trap['effect'] = processGMNotes(token.get('gmnotes'));
                            }
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                        case 'Switch':
                        case 'Switch1':
                            new_door.switch_id = token.get('id');
                            if (token.get('bar1_value') == 'Hidden') new_door.switch_hidden = true;
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                        case 'Switch2':
                            new_door.switch2_id = token.get('id');
                            if (token.get('bar1_value') == 'Hidden') new_door.switch_hidden = true;
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                        case 'Broken':
                            new_door.broken_id = token.get('id');
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                        case 'Lock':
                            new_door.lock_id = token.get('id');
                            if (token.get('bar1_value') == 'Hidden') new_door.lock_hidden = true;
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                        case 'Trap':
                            new_door.trap_id = token.get('id');
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                        case 'Dial':
                            dials.push({dial_id: token.get('id'), rotation: getRotation(token.get('rotation')), feedback: token.get('bar1_value')});
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                        case 'Tile':
                            tiles.push({tile_id: token.get('id'), top: token.get('top'), left: token.get('left'), feedback: token.get('bar1_value')});
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                        case 'Decoy':
                            decoys.push({decoy_id: token.get('id'), top: token.get('top'), left: token.get('left'), feedback: token.get('bar1_value')});
                            door_tokens.push({type: 'graphic', id: token.get('id')});
                            break;
                    }
                } else if (token.get('type') == 'path') {
                    paths.push(token.get('id'));
                    door_tokens.push({type: 'path', id: token.get('id')});
                }
            }
        });

        new_door.paths = paths;
        if (_.size(dials) > 0) new_door.dials = dials;
        if (_.size(dials) == 0 && _.size(tiles) > 0) {
            new_door.tiles = tiles;
            if (_.size(decoys) > 0) new_door.decoys = decoys;
        }

        if (typeof new_door.open_id != 'undefined' && typeof new_door.closed_id != 'undefined') {
            new_door.id = generateUniqueID();
            if (new_door.condition == 'Keyed' || typeof new_door.lock_id != 'undefined') {
                new_door.condition = 'Locked';
                new_door.has_key = true;
                new_door.case_sensitive = true;
                new_door.key_char_id = state['DoorMaster'].doorCharID;
                if (new_door.lock_passphrase == '') new_door.lock_passphrase = 'Open sesame';
            }

            if (new_door.switch_hidden) new_door.switch_hidden = {original: true, current: true};
            else new_door.switch_hidden = {original: false, current: false};
            if (new_door.lock_hidden) new_door.lock_hidden = {original: true, current: true};
            else new_door.lock_hidden = {original: false, current: false};
            new_door.label = {door: 'door', switch: 'switch', dial: 'dial', tile: 'tile'};

            _.each(door_tokens, function (obj) {
                var token = getObj(obj.type, obj.id);
                if (token) {
                    var aura_settings = {aura1_radius: '0.1', aura1_color: state['DoorMaster'].doorAuraColor, aura1_square: false};
                    var hidden_aura_settings = {aura2_radius: '0.1', aura2_color: state['DoorMaster'].hiddenAuraColor, aura2_square: false};
                    if (token.get('type') == 'graphic') {
                        // Set basics
                        token.set({name: new_door.id, playersedit_name: false, showname: false, bar1_value: '', bar1_max: '', bar2_value: '', bar2_max: '', bar3_value: '', bar3_max: '', showplayers_bar1: false, showplayers_bar2: false, showplayers_bar3: false, showplayers_aura1: true, showplayers_aura2: false, playersedit_bar1: false, playersedit_bar2: false, playersedit_bar3: false, playersedit_aura1: false, playersedit_aura2: false});
                        if (token.get('id') == new_door.open_id || token.get('id') == new_door.broken_id || token.get('id') == new_door.trap_id) token.set({layer: 'walls'});
                        if (typeof new_door.switch2_id != 'undefined' && token.get('id') == new_door.switch2_id) token.set({layer: 'walls'});

                        // Set auras & assign characters
                        if (new_door.hidden) {
                            if (token.get('id') == new_door.open_id || token.get('id') == new_door.closed_id) token.set(hidden_aura_settings);
                        } else {
                            if ((token.get('id') == new_door.open_id || token.get('id') == new_door.closed_id) && state['DoorMaster'].useAura) token.set(aura_settings);
                            if (token.get('id') == new_door.open_id || token.get('id') == new_door.closed_id) token.set({represents: state['DoorMaster'].doorCharID});
                        }

                        if (new_door.switch_hidden['current']) {
                            if (token.get('id') == new_door.switch_id) token.set(hidden_aura_settings);
                            if (token.get('id') == new_door.switch2_id) token.set(hidden_aura_settings);
                        } else {
                            if (token.get('id') == new_door.switch_id) token.set({represents: state['DoorMaster'].switchCharID});
                            if (token.get('id') == new_door.switch2_id) token.set({represents: state['DoorMaster'].switchCharID});
                            if (token.get('id') == new_door.switch_id && state['DoorMaster'].useAura) token.set(aura_settings);
                            if (token.get('id') == new_door.switch2_id && state['DoorMaster'].useAura) token.set(aura_settings);
                        }

                        if (new_door.lock_hidden['current']) {
                            if (token.get('id') == new_door.lock_id) token.set(hidden_aura_settings);
                        } else {
                            if (token.get('id') == new_door.lock_id) token.set({represents: state['DoorMaster'].lockCharID});
                            if (token.get('id') == new_door.lock_id && state['DoorMaster'].useAura) token.set(aura_settings);
                        }

                        // Dials
                        if (typeof new_door.dials != 'undefined' && _.find(_.pluck(new_door.dials, 'dial_id'), function (x) { return x == token.get('id') })) {
                            token.set({controlledby: 'all', aura2_radius: '0.25', aura2_color: '#cc0000', aura2_square: false, rotation: 0});
                        }

                        // Tiles
                        var coords = getTokenOffset(token);
                        if (typeof new_door.tiles != 'undefined' && _.find(_.pluck(new_door.tiles, 'tile_id'), function (x) { return x == token.get('id') })) {
                            token.set({controlledby: 'all', aura2_radius: '0.25', aura2_color: '#cc0000', aura2_square: false, top: coords.top, left: coords.left});
                        }
                        if (typeof new_door.decoys != 'undefined' && _.find(_.pluck(new_door.decoys, 'decoy_id'), function (x) { return x == token.get('id') })) {
                            token.set({controlledby: 'all', aura2_radius: '', top: coords.top, left: coords.left});
                        }
                    }
                    if (token.get('type') == 'path') token.set({layer: 'walls'});
                }
            });
            state['DoorMaster'].doors.push(new_door);
            commandDoorStatus({content: '!door status ' + new_door.id}, 'Your new ' + new_door.label['door'] + ' has been created.');
        } else {
            showDialog('Creation Error', 'You need at least one token named "Open" and one named "Closed" to create a door.', 'GM');
        }
    },

    getTriggers = function (str) {
        var triggers = [];
        _.each(str.split(','), function (tmp) {
            tmp = tmp.trim().toLowerCase();
            if (tmp == 'open') triggers.push('Open');
            if (tmp == 'touch') triggers.push('Touch');
            if (tmp == 'pick') triggers.push('Pick');
            if (tmp == 'fail-pick') triggers.push('Fail-Pick');
            if (tmp == 'unlock') triggers.push('Unlock');
            if (tmp == 'wrong-code') triggers.push('Wrong-Code');
            if (tmp == 'misdial') triggers.push('Misdial');
            if (tmp == 'all-misdial') triggers.push('All-Misdial');
            if (tmp == 'misplace') triggers.push('Misplace');
            if (tmp == 'all-misplace') triggers.push('All-Misplace');
            if (tmp == 'decoy') triggers.push('Decoy');
        });
        if (_.size(triggers) == 0) triggers = ['Open'];
        return triggers;
    },

    triggeredTrap = function (door, action = ['Open']) {
        if (door.trap && !door.trap['disabled']) {
            if (_.size(_.intersection(action, door.trap['triggers'])) > 0) return true;
            else return false;
        } else return false;
    },

    commandUseDoor = function (msg, action = 'open/close') {
        var parms = msg.content.replace('!door ', '').split(/\s+/i);
        var char_id = (parms[1]) ? parms[1] : null;
        var die_mod = (parms[2]) ? parms[2] : null;
        var adv_dis = (parms[3]) ? parms[3] : null;

        if (_.size(msg.selected) == 1) {
            var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
            if (token) {
                var title = '', message = '', triggered = false, door = _.find(state['DoorMaster'].doors, function (x) { return x.id == token.get('name'); });
                if (door) {
                    var show_dialog = true, whispered = state['DoorMaster'].whisper;
                    var chars = getCharsFromPlayerID(msg.playerid);
                    var char_name = _.size(chars) == 1 ? chars[0].get('name') : '';

                    if (triggeredTrap(door, ['Touch'])) {
                        executeTrap(door, char_name);
                        return;
                    }

                    if (action == 'break' && door.condition != 'Obstructed' && door.condition != 'Broken') {
                        if (die_mod != null && adv_dis != null) {
                            // If skill and adv/dis have been sent, attempt to break the door down
                            var char = getObj('character', char_id);
                            char_name = char.get('name');
                            var roll_result = rollSkillCheck(die_mod, adv_dis);
                            var roll_display = '<div style="' + styles.resultBox + '"><span style=\'' + styles.result + (roll_result.base == 1 ? 'color: red;' : (roll_result.base == 20 ? 'color: green;' : '')) + '\' title="' + roll_result.formula + '">' + roll_result.final + '</span> ' + roll_result.skill + (roll_result.adv_dis == '-1' ? ' <span style="cursor: pointer;" title="Disadvantage">[Dis]</span> ' : (roll_result.adv_dis == '+1' ? ' <span style="cursor: pointer;" title="Advantage">[Adv]</span>' : '')) + '</div>';
                            var gm_display = roll_display.replace('</div>', ' vs. DC ' + door.breakDC + '</div>');

                            if (roll_result.final >= door.breakDC) {
                                title = 'Success!';
                                message = char_name + ' has successfully broken the ' + door.label['door'] + ' open';

                                // Assess the damage...
                                var break_chance = randomInteger(100) + ((roll_result.final - door.breakDC) * 2);
                                if (break_chance >= 80) {
                                    door.condition = 'Broken';
                                    message += ', but has ruined it. The ' + door.label['door'] + ' will no longer close.';
                                    if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                    if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has successfully broken through the ' + door.label['door'] + ' but destroyed it.<br>' + gm_display, 'GM');
                                } else if (break_chance >= 70 && door.condition == 'Locked') {
                                    door.condition = 'Disabled';
                                    message += ', but has damaged the ' + (typeof door.lock_id != 'undefined' ? 'locking mechanism' : 'lock') + '.';
                                    if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                    if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has successfully broken through the ' + door.label['door'] + ' but damaged the ' + (typeof door.lock_id != 'undefined' ? 'locking mechanism' : 'lock') + '.<br>' + gm_display, 'GM');
                                } else {
                                    door.condition = 'Unlocked';
                                    message += '.';
                                    if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                    if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has successfully broken the ' + door.label['door'] + ' open.<br>' + gm_display, 'GM');
                                }
                                if (door.condition == 'Broken') breakDoor(door);
                                else toggleDoorOpen(door);
                                triggered = (door.open && triggeredTrap(door, ['Open']));
                            } else {
                                title = 'Fail!';
                                message = char_name + ' has not succeeded in breaking through the ' + door.label['door'] + '.';
                                if (door.condition == 'Unlocked') message += ' However, you could just try opening it...';
                                if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has not succeeded in breaking through the ' + door.label['door'] + '.<br>' + gm_display, 'GM');
                            }
                        } else if (char_id || _.size(chars) == 1) {
                            // If one (or selected) character, give action for attempt to break
                            title = '', whispered = true;
                            char_id = (!char_id) ? chars[0].get('id') : char_id;
                            var char = (!char_id) ? chars[0].get('id') : getObj('character', char_id);
                            char_name = char.get('name');
                            message = '<div style="' + styles.buttonWrapper + '">' + char_name + ': <a style="' + styles.button + '" href="!door break ' + char_id + ' ?{Select skill' + getSkills(char_id, 'STR') + '} ?{Advantage or Disadvantage|Neither,0|Advantage,+1|Disadvantage,-1}" title="' + char_name + ' will attempt to break the ' + door.label['door'] + ' open.">Break Open</a></div>';
                        } else {
                            // If more than one character, make character selection
                            title = '', whispered = true;
                            message = '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!door break ?{Select character';
                            _.each(chars, function (char) {
                                message += '|' + char.get('name') + ',' + char.get('id');
                            });
                            message += '}" title="Please select which character is attempting to pick the lock.">Choose Character</a></div>';
                        }
                    } else {
                        // Ignore Pick Lock from a disabled yet still selected Lock token
                        if (typeof door.lock_id != 'undefined' && token.get('id') == door.lock_id && token.get('represents') == '') {
                            showDialog('', 'This lock no longer functions.', msg.who);
                            return;
                        }

                        switch (door.condition) {
                            case 'Unlocked':
                                if (typeof door.linked != 'undefined' && _.size(door.linked) != 0 && action == 'open/close') {
                                    openLinkedDoors(door);
                                    return;
                                }
                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    message = 'This door has a ' + door.label['switch'] + ' that must be used.';
                                    whispered = true;
                                } else if (token.get('id') == door.lock_id && action == 'pick') {
                                    message = 'This door is already unlocked and cannot be operated from here.';
                                    whispered = true;
                                } else {
                                    toggleDoorOpen(door);
                                    triggered = (action == 'open/close' && door.open && triggeredTrap(door, ['Open']));
                                    if (action == 'pick') {
                                        message = 'Um... This ' + door.label['door'] + ' was already unlocked.';
                                        whispered = true;
                                    } else show_dialog = false;
                                }
                                break;
                            case 'Locked':
                                title = state['DoorMaster'].obfuscateState ? 'Unopened' : 'Locked';
                                message = (typeof door.lock_id == 'undefined' && typeof door.dials == 'undefined' && typeof door.tiles == 'undefined') ? 'You cannot open the ' + door.label['door'] + ' without a key... or try another method.' : 'The ' + door.label['door'] + ' will not open, yet there is no lock visible.';

                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    title = '', whispered = true;
                                    message = 'This ' + door.label['door'] + ' has a ' + door.label['switch'] + ' that must be used.';
                                    break;
                                }

                                if (token.get('id') == door.switch_id || token.get('id') == door.switch2_id) {
                                    message = 'The ' + door.label['switch'] + ' will not budge.';
                                    break;
                                }

                                if (action == 'pick') {
                                    if ((typeof door.lock_id != 'undefined' && token.get('id') != door.lock_id) || typeof door.dials != 'undefined' || typeof door.tiles != 'undefined') {
                                        message = 'This ' + door.label['door'] + ' has no visible lock to pick...';
                                        break;
                                    }

                                    if (die_mod != null && adv_dis != null) {
                                        // If skill and adv/dis have been sent, attempt to pick the lock
                                        var char = getObj('character', char_id);
                                        char_name = char.get('name');
                                        var roll_result = rollSkillCheck(die_mod, adv_dis);
                                        var roll_display = '<div style="' + styles.resultBox + '"><span style=\'' + styles.result + (roll_result.base == 1 ? 'color: red;' : (roll_result.base == 20 ? 'color: green;' : '')) + '\' title="' + roll_result.formula + '">' + roll_result.final + '</span> ' + roll_result.skill + (roll_result.adv_dis == '-1' ? ' <span style="cursor: pointer;" title="Disadvantage">[Dis]</span>' : (roll_result.adv_dis == '+1' ? ' <span style="cursor: pointer;" title="Advantage">[Adv]</span>' : '')) + '</div>';
                                        var gm_display = roll_display.replace('</div>', ' vs. DC ' + door.breakDC + '</div>');

                                        if (roll_result.final >= door.lockDC) {
                                            title = 'Success!';
                                            message = char_name + ' has successfully picked the lock...';
                                            door.condition = 'Unlocked';
                                            if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                            if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has successfully picked the lock.<br>' + gm_display, 'GM');
                                            triggered = triggeredTrap(door, ['Pick', 'Unlock']);
                                        } else if (roll_result.base == 1 && state['DoorMaster'].allowFumbles) {
                                            title = 'Fumble!';
                                            message =  char_name + ' has broken the lock. No more attempts to pick it will succeed.';
                                            door.condition = 'Disabled';
                                            if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                            if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has fumbled while picking the lock.<br>' + gm_display, 'GM');
                                            triggered = triggeredTrap(door, ['Fail-Pick']);
                                        } else {
                                            title = 'Fail!';
                                            message =  char_name + ' has not succeeded in picking this lock.';
                                            if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                            if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has not succeeded in picking the lock.<br>' + gm_display, 'GM');
                                            triggered = triggeredTrap(door, ['Fail-Pick']);
                                        }
                                    } else if (char_id != null || _.size(chars) == 1) {
                                        // If one (or selected) character, give action for attempt to pick
                                        char_id = (!char_id) ? chars[0].get('id') : char_id;
                                        var char = (!char_id) ? chars[0] : getObj('character', char_id);
                                        char_name = char.get('name');
                                        title = '', whispered = true;
                                        message = '<div style="' + styles.buttonWrapper + '">' + char_name + ': <a style="' + styles.button + '" href="!door pick ' + char_id + ' ?{Select skill' + getSkills(char_id, 'DEX') + '} ?{Advantage or Disadvantage|Neither,0|Advantage,+1|Disadvantage,-1}" title="' + char_name + ' will attempt to pick the lock.">Pick Lock</a></div>';
                                    } else {
                                        // If more than one character, make character selection
                                        title = '', whispered = true;
                                        message = '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!door pick ?{Select character';
                                        _.each(chars, function (char) {
                                            message += '|' + char.get('name') + ',' + char.get('id');
                                        });
                                        message += '}" title="Please select which character is attempting to pick the lock.">Choose Character</a></div>';
                                    }
                                }
                                break;
                            case 'Disabled':
                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    title = '', whispered = true;
                                    message = 'This ' + door.label['door'] + ' has a ' + door.label['switch'] + ' that must be used.';
                                    break;
                                }

                                if (door.open) {
                                    toggleDoorOpen(door);
                                    show_dialog = false;
                                } else {
                                    title = state['DoorMaster'].obfuscateState ? 'Unsuccessful' : 'Lock Disabled';
                                    message = 'This ' + door.label['door'] + '\'s lock has been broken and cannot be picked, nor will a key work.';
                                    if (action == 'pick') message = 'This ' + door.label['door'] + '\'s lock has been broken and cannot be picked.' + (typeof door.lock_id != 'undefined' ? ' Plus, there is no lock visible on this ' + door.label['door'] + '.' : ' Your attempt to pick it is futile.');
                                    if (token.get('id') == door.switch_id || token.get('id') == door.switch2_id) {
                                        message = 'The ' + door.label['switch'] + ' will not budge.';
                                    }
                                }
                                break;
                            case 'Barred':
                                title = state['DoorMaster'].obfuscateState ? 'Unopened' : 'Barred';
                                if (action == 'pick') message = 'You can lift the bar on this ' + door.label['door'] + '. No lock picking is neccessary.';
                                if (token.get('id') == door.switch_id || token.get('id') == door.switch2_id) {
                                    message = 'The ' + door.label['switch'] + ' begins to move but cannot.';
                                }
                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    title = '';
                                    message = 'This ' + door.label['door'] + ' has a ' + door.label['switch'] + ' that must be used.';
                                }
                                if (!door.open && token.get('id') == door.closed_id && action == 'open/close') {
                                    door.condition = 'Unlocked';
                                    message = 'You have removed the bar from this ' + door.label['door'] + '.';
                                }
                                break;
                            case 'Obstructed':
                                title = state['DoorMaster'].obfuscateState ? 'Unopened' : 'Obstructed';
                                message = 'This ' + door.label['door'] + ' seems to be blocked from the other side.';
                                if (action == 'pick') message += (typeof door.lock_id != 'undefined' ? ' Plus, there is no lock visible on this ' + door.label['door'] + '.' : ' Your attempt to pick it is ineffectual.');
                                if (action == 'break') message += ' You cannot hope to break through.';
                                if (token.get('id') == door.switch_id || token.get('id') == door.switch2_id) {
                                    message = 'The ' + door.label['switch'] + ' begins to move but cannot.';
                                }
                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    title = '';
                                    message = 'This ' + door.label['door'] + ' has a ' + door.label['switch'] + ' that must be used.';
                                }
                                break;
                            case 'Stuck':
                                title = state['DoorMaster'].obfuscateState ? 'Unopened' : 'Stuck';
                                message = 'This ' + door.label['door'] + ' seems to be stuck and will not open easily.';
                                if (action == 'pick') message += (typeof door.lock_id != 'undefined' ? ' Plus, there is no lock visible on this ' + door.label['door'] + '.' : ' Your attempt to pick it is inconceivable.');
                                if (token.get('id') == door.switch_id || token.get('id') == door.switch2_id) {
                                    message = 'The ' + door.label['switch'] + ' begins to move but cannot.';
                                }
                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    title = '', whispered = true;
                                    message = 'This ' + door.label['door'] + ' has a ' + door.label['switch'] + ' that must be used.';
                                }
                                break;
                            case 'Broken':
                                title = 'Broken';
                                message = 'This ' + door.label['door'] + ' is broken and cannot be opened or closed.';
                                if (action == 'pick') message += (typeof door.lock_id != 'undefined' ? ' Plus, there is no lock visible on this ' + door.label['door'] + '.' : ' Your attempt to pick it is absurd.');
                                if (action == 'break') message = 'Why are you attacking a broken ' + door.label['door'] + '?';
                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    message = 'Why are you playing with the ' + door.label['switch'] + '?';
                                }
                        }
                    }

                    if (show_dialog) showDialog(title, message, (whispered ? msg.who : ''));
                    if (triggered) executeTrap(door, char_name);

                } else showDialog('Door Use Error', 'Invalid ID.', msg.who);
            } else showDialog('Door Use Error', 'Invalid token.', msg.who);
        } else {
            showDialog('Door Use Error', 'You must select a valid token.', msg.who);
        }
    },

    toggleDoorOpen = function (door, flip_switch = true) {
        if (flip_switch) flipSwitch(door);
        var open_token = getObj('graphic', door.open_id);
        open_token.set({layer: (open_token.get('layer') == 'objects' ? 'walls' : 'objects')});
        var closed_token = getObj('graphic', door.closed_id);
        closed_token.set({layer: (closed_token.get('layer') == 'objects' ? 'walls' : 'objects')});
        _.each(door.paths, function (path_id) {
            var path = getObj('path', path_id);
            path.set({layer: (path.get('layer') == 'gmlayer' ? 'walls' : 'gmlayer')});
        });
        door.open = !door.open;
    },

    breakDoor = function (door) {
        var open_token = getObj('graphic', door.open_id);
        var closed_token = getObj('graphic', door.closed_id);
        if (typeof door.broken_id != 'undefined') {
            var broken_token = getObj('graphic', door.broken_id);
            broken_token.set({layer: 'objects'});
            open_token.set({layer: 'walls'});
            closed_token.set({layer: 'walls'});
        } else {
            open_token.set({layer: 'objects'});
            closed_token.set({layer: 'walls'});
        }
        _.each(door.paths, function (path_id) {
            var path = getObj('path', path_id);
            path.set({layer: 'gmlayer'});
        });
        door.condition = 'Broken';
        door.open = true;
    },

    flipSwitch = function (door) {
        if (typeof door.switch_id != 'undefined' && typeof door.switch2_id != 'undefined') {
            var switch1_token = getObj('graphic', door.switch_id);
            var switch2_token = getObj('graphic', door.switch2_id);
            switch1_token.set({layer: (switch1_token.get('layer') == 'objects' ? 'walls' : 'objects')});
            switch2_token.set({layer: (switch2_token.get('layer') == 'objects' ? 'walls' : 'objects')});
        }
    },

    openLinkedDoors = function (door) {
        var message = '';
        if (door.condition == 'Unlocked') {
            var doors = _.filter(state['DoorMaster'].doors, function (x) { return _.find(door.linked, function (y) { return y == x.id; }); });
            var conditions = _.pluck(doors, 'condition');
            var bad_doors = _.filter(conditions, function (cond) { return cond != 'Unlocked' && cond != 'Broken'; });
            if (door.all_or_nothing && !_.find(conditions, function (cond) { return cond != 'Unlocked' && cond != 'Broken'; })) {
                toggleDoorOpen(door);
                _.each(doors, function (tmp_door) {
                    if (tmp_door.condition == 'Unlocked') toggleDoorOpen(tmp_door, false);
                });
            } else if (!door.all_or_nothing) {
                toggleDoorOpen(door);
                _.each(doors, function (tmp_door) {
                    if (tmp_door.condition == 'Unlocked') toggleDoorOpen(tmp_door, false);
                });
                if (_.size(bad_doors) > 0) {
                    message = 'There ' + (_.size(bad_doors) == 1 ? 'was an' : 'were') + ' ' + _.size(bad_doors) + ' unopenable linked ' + (_.size(bad_doors) == 1 ? 'door' : 'doors') + '.';
                }
            } else {
                message = 'This door has ' + (_.size(bad_doors) == 1 ? 'an' : 'some') + ' unopenable linked ' + (_.size(bad_doors) == 1 ? 'door' : 'doors') + ' preventing its use.';
            }
        }
        if (message != '') showDialog('', message, 'GM');
    },

    // Make a Secret or Concealed door available to the players
    revealDoor = function (door) {
        var aura_settings = {aura1_radius: '0.1', aura1_color: state['DoorMaster'].doorAuraColor, aura1_square: false};
        var open_token = getObj('graphic', door.open_id);
        var closed_token = getObj('graphic', door.closed_id);
        open_token.set({represents: state['DoorMaster'].doorCharID, aura2_radius: ''});
        closed_token.set({represents: state['DoorMaster'].doorCharID, aura2_radius: ''});
        if (state['DoorMaster'].useAura) {
            open_token.set(aura_settings);
            closed_token.set(aura_settings);
        }
        door.hidden = false;
        door.visibility = 'Visible';
    },

    // Make a hidden switch token available to the players
    revealSwitch = function (door) {
        var aura_settings = {aura1_radius: '0.1', aura1_color: state['DoorMaster'].doorAuraColor, aura1_square: false};
        var switch1_token = getObj('graphic', door.switch_id);
        var switch2_token = getObj('graphic', door.switch2_id);
        if (switch1_token) switch1_token.set({represents: state['DoorMaster'].switchCharID, aura2_radius: ''});
        if (switch2_token) switch2_token.set({represents: state['DoorMaster'].switchCharID, aura2_radius: ''});
        if (state['DoorMaster'].useAura) {
            if (switch1_token) switch1_token.set(aura_settings);
            if (switch2_token) switch2_token.set(aura_settings);
        }
        door.switch_hidden['current'] = false;
    },

    // Places all door elements back on the objects layer and deletes the door object
    commandDestroyDoor = function (msg, silent = false) {
        var door, parms = msg.content.split(/\s+/i);
        if (parms[2] && parms[2] != '') {
            door = _.find(state['DoorMaster'].doors, function (x) { return x.id == parms[2]; });
        } else if (_.size(msg.selected) == 1) {
            var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
            if (token) {
                var token_id = token.get('id');
                door =_.find(state['DoorMaster'].doors, function (x) { return x.id == token.get('name'); });
            } else showDialog('Destruction Error', 'Invalid token.', 'GM');
        } else showDialog('Destruction Error', 'You must select a token associated with a door.', 'GM');

        if (door) {
            // Backward compatability for door switches
            if (!door.switch_hidden || typeof door.switch_hidden == 'boolean') door.switch_hidden = {original: door.switch_hidden, current: door.switch_hidden};

            var closed_token = getObj('graphic', door.closed_id);
            if (closed_token) closed_token.set({layer: 'objects', name: 'Closed', represents: '', aura1_radius: '', aura2_radius: '', bar1_value: (door.has_key ? 'Keyed' : door.condition), bar1_max: (door.visibility != 'Visible' ? door.visibility : ''), bar2_value: door.lockDC, bar2_max: door.breakDC, bar3_value: (door.lock_passphrase ? door.lock_passphrase : ''), bar3_max: ''});
            var open_token = getObj('graphic', door.open_id);
            if (open_token) open_token.set({layer: 'objects', name: 'Open', bar1_value: (door.trap ? door.trap['triggers'].join(',') : ''), bar2_value: (door.trap ? door.trap['disableDC'] : ''), represents: '', aura1_radius: '', aura2_radius: ''});
            var switch_token = getObj('graphic', door.switch_id);
            if (switch_token) switch_token.set({layer: 'objects', name: 'Switch', represents: '', bar1_value: (door.switch_hidden['original'] ? 'Hidden' : ''), aura1_radius: '', aura2_radius: ''});
            var switch2_token = getObj('graphic', door.switch2_id);
            if (switch2_token) switch2_token.set({layer: 'objects', name: 'Switch2', represents: '', bar1_value: '', aura1_radius: '', aura2_radius: ''});
            var broken_token = getObj('graphic', door.broken_id);
            if (broken_token) broken_token.set({layer: 'objects', name: 'Broken'});
            var lock_token = getObj('graphic', door.lock_id);
            if (lock_token) lock_token.set({name: 'Lock', represents: '', bar1_value: (door.lock_hidden['original'] ? 'Hidden' : ''), aura1_radius: '', aura2_radius: ''});
            var trap_token = getObj('graphic', door.trap_id);
            if (trap_token) trap_token.set({layer: 'objects', name: 'Trap'});
            _.each(door.paths, function (path_id) {
                var path = getObj('path', path_id);
                if (path) path.set({layer: 'objects'});
            });
            _.each(door.dials, function (dial) {
                var dial_token = getObj('graphic', dial.dial_id);
                if (dial_token) dial_token.set({name: 'Dial', controlledby: '', aura2_radius: '', bar1_value: (dial.feedback ? dial.feedback : ''), rotation: dial.rotation});
            });
            _.each(door.tiles, function (tile) {
                var tile_token = getObj('graphic', tile.tile_id);
                if (tile_token) tile_token.set({name: 'Tile', controlledby: '', aura2_radius: '', bar1_value: (tile.feedback ? tile.feedback : ''), top: tile.top, left: tile.left});
            });
            _.each(door.decoys, function (decoy) {
                var decoy_token = getObj('graphic', decoy.decoy_id);
                if (decoy_token) decoy_token.set({name: 'Decoy', controlledby: '', aura2_radius: '', bar1_value: (decoy.feedback ? decoy.feedback : ''), top: decoy.top, left: decoy.left});
            });

            state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.open_id; });
            state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.closed_id; });
            if (typeof door.switch_id != 'undefined') state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.switch_id; });
            if (typeof door.switch2_id != 'undefined') state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.switch2_id; });
            if (typeof door.broken_id != 'undefined') state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.broken_id; });
            if (typeof door.lock_id != 'undefined') state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.lock_id; });
            if (typeof door.trap_id != 'undefined') state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.trap_id; });

            state['DoorMaster'].doors = _.reject(state['DoorMaster'].doors, function (x) { return x.id == door.id; });
            if (!silent) showDialog('Destruction Complete', 'The door tokens have all been unlocked and all pieces returned to the token layer.', 'GM');
        } else showDialog('Destruction Error', (_.size(msg.selected) != 1 ? 'Too many tokens selected.' : 'Invalid ID.'), 'GM');
    },

    // Removes doors from state that have lost tokens
    purgeOldDoors = function (msg) {
        var door, parms = msg.content.split(/\s+/i);
        if (parms[2] && parms[2].toLowerCase() == 'confirm') {
            var count = 0, doors = state['DoorMaster'].doors;
            _.each(doors, function (door) {
                var closed = getObj('graphic', door.closed_id);
                var open = getObj('graphic', door.open_id);
                var switch1 = (typeof door.switch_id != 'undefined') ? getObj('graphic', door.switch_id) : {};
                var switch2 = (typeof door.switch2_id != 'undefined') ? getObj('graphic', door.switch2_id) : {};
                var broken = (typeof door.broken_id != 'undefined') ? getObj('graphic', door.broken_id) : {};
                var lock = (typeof door.lock_id != 'undefined') ? getObj('graphic', door.lock_id) : {};
                var trap = (typeof door.trap_id != 'undefined') ? getObj('graphic', door.trap_id) : {};
                if (!closed || !open || !switch1 || !switch2 || !broken || !lock || !trap) {
                    commandDestroyDoor({content: '!door destroy ' + door.id}, true);
                    count++;
                }
            });
            showDialog('Purge Complete', (count == 1 ? '1 door' : count + ' doors') + ' have been purged.', 'GM');
        } else {
            showDialog('Purge Doors', 'This function <b>destroys all doors</b> that have missing tokens (missing paths are ignored). If you wish to proceed, click the button below.<div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!door purge confirm">PURGE</a></div>', 'GM');
        }
    },

    // Links selected doors to the indicated Master door
    commandLinkDoors = function (msg) {
        var door, parms = msg.content.split(/\s+/i);
        if (parms[2] && parms[2] != '') {
            door = _.find(state['DoorMaster'].doors, function (x) { return x.id == parms[2]; });
        } else {
            showDialog('Door Link Error', 'You must send a valid door ID.', 'GM');
            return;
        }

        if (door) {
            if (_.size(msg.selected) < 1) {
                commandDoorStatus({content: '!door status ' + door.id}, '⚠️ No tokens selected.');
                return;
            }

            var door_ids = (typeof door.linked != 'undefined' ? door.linked : []), message = '';
            _.each(msg.selected, function (obj) {
                var token = getObj(obj._type, obj._id);
                if (token) {
                    var door_id = token.get('name');
                    var tmp_door =_.find(state['DoorMaster'].doors, function (x) { return x.id == door_id && x.id != door.id; });
                    if (tmp_door) door_ids.push(door_id);
                }
            });
            door_ids = _.uniq(door_ids);

            if (_.size(door_ids) > 0) {
                door.linked = door_ids;
                door.all_or_nothing = false;
                commandDoorStatus({content: '!door status ' + door.id}, (_.size(door_ids) == 1 ? '1 door was linked.' : _.size(door_ids) + ' doors were linked.'));
            } else commandDoorStatus({content: '!door status ' + door.id}, '⚠️ No door tokens were selected.');
        } else showDialog('Door Link Error', 'You must send a valid door ID.', 'GM');
    },

    // Make a hidden lock token available to the players
    enableLock = function (door, reset = false) {
        var aura_settings = {aura2_radius: '', aura1_radius: '0.1', aura1_color: state['DoorMaster'].doorAuraColor, aura1_square: false};
        var hidden_aura_settings = {aura1_radius: '', aura2_radius: '0.1', aura2_color: state['DoorMaster'].hiddenAuraColor, aura2_square: false};
        var lock_token = getObj('graphic', door.lock_id);
        if (reset) {
            lock_token.set({represents: '', aura1_radius: ''});
            lock_token.set(hidden_aura_settings);
            door.lock_hidden['current'] = true;
        } else {
            lock_token.set({represents: state['DoorMaster'].lockCharID, aura2_radius: ''});
            if (state['DoorMaster'].useAura) lock_token.set(aura_settings);
            door.lock_hidden['current'] = false;
        }
    },

    // Make door tokens able to accept a key
    enableKey = function (door, reset = false) {
        var aura_settings = {aura2_radius: '', aura1_radius: '0.1', aura1_color: state['DoorMaster'].doorAuraColor, aura1_square: false};
        var hidden_aura_settings = {aura1_radius: '', aura2_radius: '0.1', aura2_color: state['DoorMaster'].hiddenAuraColor, aura2_square: false};
        door.key_char_id = reset ? state['DoorMaster'].doorCharID : state['DoorMaster'].doorKeyedCharID;
        var char_id;
        if (typeof door.trap != 'undefined') {
            char_id = !door.trap['hidden'] ? (reset ? state['DoorMaster'].trapCharID : state['DoorMaster'].trapKeyedCharID) : door.key_char_id;
        } else char_id = door.key_char_id;

        if (typeof door.lock_id == 'undefined') {
            var open_token = getObj('graphic', door.open_id);
            var closed_token = getObj('graphic', door.closed_id);
            if (reset) {
                open_token.set({represents: char_id});
                if (door.hidden) open_token.set(hidden_aura_settings);
                closed_token.set({represents: char_id});
                if (door.hidden) closed_token.set(hidden_aura_settings);
            } else {
                open_token.set({represents: char_id});
                closed_token.set({represents: char_id});
                if (state['DoorMaster'].useAura) open_token.set(aura_settings);
                if (state['DoorMaster'].useAura) closed_token.set(aura_settings);
            }
        }
    },

    commandUseKey = function (msg) {
        var passphrase = msg.content.replace('!door key ', '');
        if (_.size(msg.selected) == 1) {
            var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
            if (token) {
                var door = _.find(state['DoorMaster'].doors, function (x) { return x.id == token.get('name'); });
                if (door) {
                    // Ignore input from a disabled yet still selected Lock token
                    if (typeof door.lock_id != 'undefined' && token.get('id') == door.lock_id && token.get('represents') == '') {
                        showDialog('', 'This lock no longer functions.', msg.who);
                        return;
                    }

                    if (token.get('id') != door.lock_id && triggeredTrap(door, ['Touch'])) {
                        executeTrap(door, (_.size(chars) == 1 ? chars[0].get('name') : ''));
                        return;
                    }

                    if (typeof door.case_sensitive == 'undefined') door.case_sensitive = true; // Retrofit
                    var chars = getCharsFromPlayerID(msg.playerid);
                    var correctPassphrase = door.case_sensitive ? passphrase == door.lock_passphrase : passphrase.toLowerCase() == door.lock_passphrase.toLowerCase();
                    if (correctPassphrase) {
                        switch (door.condition) {
                            case 'Locked':
                                door.condition = 'Unlocked';
                                if (door.key_reset) {
                                    if (typeof door.lock_id == 'undefined') enableKey(door, true);
                                    else enableLock(door, true);
                                }
                                showDialog('Key Used', 'Success! The door is now unlocked.', (state['DoorMaster'].whisper ? msg.who : ''));
                                if (triggeredTrap(door, ['Unlock'])) executeTrap(door, (_.size(chars) == 1 ? chars[0].get('name') : ''));
                                break;
                            case 'Unlocked':
                                if (door.open) toggleDoorOpen(door);
                                door.condition = 'Locked';
                                showDialog('Key Used', 'This door is now locked.', (state['DoorMaster'].whisper ? msg.who : ''));
                                break;
                            default:
                                showDialog('Key Used', 'Using a key on this door makes no sense right now.', (state['DoorMaster'].whisper ? msg.who : ''));
                        }
                    } else {
                        var message = 'Passphrase "' + passphrase + '" is incorrect. The door remains ' + (door.condition == 'Locked' ? 'locked' : 'unlocked') + '.';
                        if (door.condition != 'Locked' && door.condition != 'Unlocked') message = 'Using a key on this door makes no sense right now.';
                        showDialog('Key Used', message, (state['DoorMaster'].whisper ? msg.who : ''));
                        if (triggeredTrap(door, ['Wrong-Code'])) executeTrap(door, (_.size(chars) == 1 ? chars[0].get('name') : ''));
                    }
                } else showDialog('Key Use Error', 'Invalid door ID.', msg.who);
            } else showDialog('Key Use Error', 'Invalid token.', msg.who);
        } else {
            showDialog('Key Use Error', 'You must select a door or lock token.', msg.who);
        }
    },

    executeTrap = function (door, char_name = '') {
        var victim = (char_name != '') ? char_name : 'Victim';
        if (door.trap['effect'] != '') {
            var diceExp, effect = _.clone(door.trap['effect']);
            effect = effect.replace(/\[WHO\]/g, victim);
            if (door.trap['effect'].startsWith('&{template')) sendChat('DoorMaster', effect);
            else {
                // Check for die roll expressions
                while (effect.search('@') != -1) {
                    diceExp = effect.replace(/.*\@(.+)\@.*/i, '$1');
                    effect = effect.replace('@' + diceExp + '@', '<span style=\'' + styles.result + '\' title="' + diceExp + '">' + rollDice(diceExp) + '</span>');
                }
                showDialog('It\'s a Trap!', effect);
            }
        } else {
            showDialog('It\'s a Trap!', victim + ', your action triggered a trap!');
            showDialog('Trap Effect Needed', 'There is no effect stored, so you must deliver the trap\'s effect manually.', 'GM');
        }

        if (door.trap['break_door']) breakDoor(door);
        if (door.trap['disable_after_trigger']) door.trap['disabled'] = true;
        if (typeof door.trap_id != 'undefined') {
            var trap_token = getObj('graphic', door.trap_id);
            trap_token.set({layer: 'objects'});
            if (!door.trap['disable_after_trigger']) {
                setTimeout(function () {
                    trap_token.set({layer: 'walls'});
                }, 1500);
            }
        }
    },

    commandDisableTrap = function (msg) {
        var parms = msg.content.replace('!door ', '').split(/\s+/i);
        var char_id = (parms[1]) ? parms[1] : null;
        var die_mod = (parms[2]) ? parms[2] : null;
        var adv_dis = (parms[3]) ? parms[3] : null;

        if (_.size(msg.selected) == 1) {
            var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
            if (token) {
                var title = '', message = '', triggered = false, door = _.find(state['DoorMaster'].doors, function (x) { return x.id == token.get('name'); });
                if (door) {
                    var show_dialog = true, whispered = state['DoorMaster'].whisper;
                    var chars = getCharsFromPlayerID(msg.playerid);
                    var char_name = _.size(chars) == 1 ? chars[0].get('name') : '';

                    if (triggeredTrap(door, ['Touch'])) {
                        executeTrap(door, char_name);
                        return;
                    }

                    if (die_mod != null && adv_dis != null) {
                        // If skill and adv/dis have been sent, attempt to disable the trap
                        var char = getObj('character', char_id);
                        char_name = char.get('name');
                        var roll_result = rollSkillCheck(die_mod, adv_dis);
                        var roll_display = '<div style="' + styles.resultBox + '"><span style=\'' + styles.result + (roll_result.base == 1 ? 'color: red;' : (roll_result.base == 20 ? 'color: green;' : '')) + '\' title="' + roll_result.formula + '">' + roll_result.final + '</span> ' + roll_result.skill + (roll_result.adv_dis == '-1' ? ' <span style="cursor: pointer;" title="Disadvantage">[Dis]</span>' : (roll_result.adv_dis == '+1' ? ' <span style="cursor: pointer;" title="Advantage">[Adv]</span>' : '')) + '</div>';
                        var gm_display = roll_display.replace('</div>', ' vs. DC ' + door.breakDC + '</div>');

                        if (roll_result.final >= door.trap['disableDC']) {
                            title = 'Success!';
                            message = char_name + ' has successfully disabled the trap...';
                            door.trap['disabled'] = true;
                            if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                            if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has successfully disabled the trap.<br>' + gm_display, 'GM');

                            // Remove "Disable" button from door tokens
                            revealDisableTrap(door, true);
                        } else if (roll_result.base == 1 && state['DoorMaster'].trapFumbles) {
                            title = 'Fumble!';
                            message =  char_name + ' has triggered the trap!';
                            if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                            if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has fumbled while disabling the trap.<br>' + gm_display, 'GM');
                        } else {
                            title = 'Fail!';
                            message =  char_name + ' has not succeeded in disabling the trap.';
                            if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                            if (state['DoorMaster'].whisper || !state['DoorMaster'].showPlayersRolls) showDialog('', char_name + ' has not succeeded in disabling the trap.<br>' + gm_display, 'GM');
                        }
                    } else if (char_id != null || _.size(chars) == 1) {
                        // If one (or selected) character, give action for attempt to disable
                        char_id = (!char_id) ? chars[0].get('id') : char_id;
                        var char = (!char_id) ? chars[0] : getObj('character', char_id);
                        char_name = char.get('name');
                        title = '', whispered = true;
                        message = '<div style="' + styles.buttonWrapper + '">' + char_name + ': <a style="' + styles.button + '" href="!door disable-trap ' + char_id + ' ?{Select skill' + getSkills(char_id, 'DEX') + '} ?{Advantage or Disadvantage|Neither,0|Advantage,+1|Disadvantage,-1}" title="' + char_name + ' will attempt to disable the trap.">Disable Trap</a></div>';
                    } else {
                        // If more than one character, make character selection
                        title = '', whispered = true;
                        message = '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!door disable-trap ?{Select character';
                        _.each(chars, function (char) {
                            message += '|' + char.get('name') + ',' + char.get('id');
                        });
                        message += '}" title="Select which character is attempting to disable the trap.">Choose Character</a></div>';
                    }
                    if (show_dialog) showDialog(title, message, (whispered ? msg.who : ''));

                } else showDialog('Disable Trap Error', 'Invalid ID.', msg.who);
            } else showDialog('Disable Trap Error', 'Invalid token.', msg.who);
        } else showDialog('Disable Trap Error', 'You must select a valid token.', msg.who);
    },

    revealDisableTrap = function (door, reset = false) {
        var trap_char_id;
        var open_token = getObj('graphic', door.open_id);
        var closed_token = getObj('graphic', door.closed_id);
        if (!reset) {
            trap_char_id = (door.has_key ? (door.key_char_id == state['DoorMaster'].doorKeyedCharID ? state['DoorMaster'].trapKeyedCharID : state['DoorMaster'].trapCharID) : state['DoorMaster'].trapCharID);
            door.trap['hidden'] = false;
        } else {
            trap_char_id = (door.has_key ? door.key_char_id : state['DoorMaster'].doorCharID);
            door.trap['hidden'] = true;
        }
        closed_token.set({represents: trap_char_id});
        open_token.set({represents: trap_char_id});
    },

    rollDice = function (exp) {
        exp = exp.split(/\D/gi);
        var roll, num = (exp[0]) ? parseInt(exp[0]) : 1,
        die = (exp[1]) ? parseInt(exp[1]) : 6,
        plus = (exp[2]) ? parseInt(exp[2]) : 0;
        roll = (num == 1) ? randomInteger(die) : randomInteger(die * num - (num - 1)) + (num - 1);
        return roll + plus;
    },

    // Door Status Window
    commandDoorStatus = function (msg, alert = '') {
        var door, message = '', parms = msg.content.split(/\s+/i);
        if (parms[2] && parms[2] != '') {
            door = _.find(state['DoorMaster'].doors, function (x) { return x.id == parms[2]; });
        } else if (_.size(msg.selected) == 1) {
            var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
            if (token) {
                var token_id = token.get('id');
                door = _.find(state['DoorMaster'].doors, function (x) { return x.id == token.get('name'); });
            } else showDialog('Status Error', 'Invalid token.', 'GM');
        } else showDialog('Status Error', 'You must select a door or switch token.', 'GM');

        if (door) {
            // Retrofit old doors when neccessary
            if (typeof door.case_sensitive == 'undefined') door.case_sensitive = false;
            if (typeof door.label == 'undefined') door.label = {door: 'door', switch: 'switch', dial: 'dial', tile: 'tile'};
            if (typeof door.switch_hidden == 'undefined' || typeof door.switch_hidden == 'boolean') door.switch_hidden = {original: (typeof door.switch_hidden == 'boolean' ? door.switch_hidden : false), current: (typeof door.switch_hidden == 'boolean' ? door.switch_hidden : false)};
            if (typeof door.lock_hidden == 'undefined' || typeof door.lock_hidden == 'boolean') door.lock_hidden = {original: (typeof door.lock_hidden == 'boolean' ? door.lock_hidden : false), current: (typeof door.lock_hidden == 'boolean' ? door.lock_hidden : false)};

            var actions = parms[3] ? parms[3].split('|') : [];
            switch (actions[0]) {
                case '--token-lock':
                    state['DoorMaster'].lockedTokens.push(door.open_id);
                    state['DoorMaster'].lockedTokens.push(door.closed_id);
                    if (typeof door.switch_id != 'undefined') state['DoorMaster'].lockedTokens.push(door.switch_id);
                    if (typeof door.switch2_id != 'undefined') state['DoorMaster'].lockedTokens.push(door.switch2_id);
                    if (typeof door.broken_id != 'undefined') state['DoorMaster'].lockedTokens.push(door.broken_id);
                    if (typeof door.lock_id != 'undefined') state['DoorMaster'].lockedTokens.push(door.lock_id);
                    door.tokens_locked = true;
                    alert = 'All door tokens have been locked.';
                    break;
                case '--set-cond':
                    if (actions[1] && _.find(DOOR_CONDITIONS, function (x) { return x == actions[1]; })) {
                        if (door.open && actions[1] != 'Unlocked' && actions[1] != 'Disabled') toggleDoorOpen(door);
                        door.condition = actions[1];
                        alert = 'Condition has been updated.';
                    }
                    break;
                case '--lock-dc':
                    if (actions[1] && actions[1] != '' && isNum(actions[1])) {
                        door.lockDC = parseInt(actions[1]);
                        alert = 'Lock DC has been updated.';
                    }
                    break;
                case '--break-dc':
                    if (actions[1] && actions[1] != '' && isNum(actions[1])) {
                        door.breakDC = parseInt(actions[1]);
                        alert = 'Break DC has been updated.';
                    }
                    break;
                case '--disable-dc':
                    if (actions[1] && actions[1] != '' && isNum(actions[1])) {
                        door.trap['disableDC'] = parseInt(actions[1]);
                        alert = 'Disable DC has been updated.';
                    }
                    break;
                case '--reveal-door':
                    revealDoor(door);
                    alert = initCap(door.label['door']) + ' has been revealed.';
                    break;
                case '--reveal-switch':
                    revealSwitch(door);
                    alert = initCap(door.label['switch']) + ' has been revealed.';
                    break;
                case '--reveal-trap':
                    if (door.trap['hidden']) {
                        revealDisableTrap(door);
                        alert = 'Disable Trap button has been revealed.';
                    } else {
                        revealDisableTrap(door, true);
                        alert = 'Disable Trap button is now hidden.';
                    }
                    break;
                case '--keyhole':
                    enableKey(door);
                    alert = 'Key has been enabled.';
                    break;
                case '--show-lock':
                    enableLock(door);
                    alert = 'Lock has been enabled.';
                    break;
                case '--passphrase':
                    var passphrase = msg.content.split(/\s*\|\s*/i);
                    if (passphrase[1] && passphrase[1].trim() != '') {
                        door.lock_passphrase = passphrase[1].trim();
                        alert = 'Passphrase has been updated.';
                    } else {
                        alert = '⚠️ Passphrase was blank! Not changed.';
                    }
                    break;
                case '--toggle-aon':
                    door.all_or_nothing = !door.all_or_nothing;
                    alert = 'All-or-nothing has been updated.';
                    break;
                case '--toggle-key-reset':
                    door.key_reset = !door.key_reset;
                    alert = 'Key reset has been updated.';
                    break;
                case '--toggle-trap':
                    door.trap['disabled'] = !door.trap['disabled'];
                    alert = 'Trap status has been updated.';
                    break;
                case '--toggle-trap-reset':
                    door.trap['disable_after_trigger'] = !door.trap['disable_after_trigger'];
                    if (!door.trap['disable_after_trigger']) door.trap['break_door'] = false;
                    alert = 'Trap auto reset has been updated.';
                    break;
                case '--toggle-trap-break':
                    door.trap['break_door'] = !door.trap['break_door'];
                    alert = 'Trap will' + (door.trap['break_door'] ? ' now' : ' no longer') + ' break the door.';
                    break;
                case '--toggle-case-sensitive':
                    door.case_sensitive = !door.case_sensitive;
                    alert = 'Passphrase is now case ' + (door.case_sensitive ? ' sensitive' : ' insensitive') + '.';
                    break;
                case '--label-door':
                    var label = msg.content.split(/\s*\|\s*/i);
                    if (label[1] && label[1].trim() != '') {
                        door.label['door'] = label[1].toLowerCase().trim();
                        alert = 'Door label has been updated.';
                    } else alert = '⚠️ Door label was blank! Not changed.';
                    break;
                case '--label-switch':
                    var label = msg.content.split(/\s*\|\s*/i);
                    if (label[1] && label[1].trim() != '') {
                        door.label['switch'] = label[1].toLowerCase().trim();
                        alert = 'Switch label has been updated.';
                    } else alert = '⚠️ Switch label was blank! Not changed.';
                    break;
                case '--label-dial':
                    var label = msg.content.split(/\s*\|\s*/i);
                    if (label[1] && label[1].trim() != '') {
                        door.label['dial'] = label[1].toLowerCase().trim();
                        alert = 'Dial label has been updated.';
                    } else alert = '⚠️ Dial label was blank! Not changed.';
                    break;
                case '--label-tile':
                    var label = msg.content.split(/\s*\|\s*/i);
                    if (label[1] && label[1].trim() != '') {
                        door.label['tile'] = label[1].toLowerCase().trim();
                        alert = 'Tile label has been updated.';
                    } else alert = '⚠️ Tile label was blank! Not changed.';
                    break;
            }

            if (alert != '') {
                message += '<p style=\'' + styles.msg + '\'>' + alert + '</p>';
            }

            message += '<p>';
            message += '<b>Condition:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --set-cond|?{Set Condition|Unlocked|Locked|Barred|Obstructed|Stuck|Disabled}" title="Change condition">' + door.condition + '</a> <a style=\'' + styles.textButton + 'text-decoration: none;\' href="!door ping ' + door.id + ' door" title="Ping door token">📍</a><br>';
            message += '<b>Visibility:</b> ' + (door.hidden ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --reveal-door" title="Reveal ' + door.label['door'] + ' to players">' + door.visibility + '</a>' : door.visibility) + '<br>';
            message += '<b>Door Label:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --label-door|?{Label|' + door.label['door'] + '}" title="Change door label">' + door.label['door'] + '</a><br>';
            message += '<b>Lock DC:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --lock-dc|?{Lock DC|' + door.lockDC + '}" title="Change lock DC">' + door.lockDC + '</a><br>';
            message += '<b>Break DC:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --break-dc|?{Break DC|' + door.breakDC + '}" title="Change break DC">' + door.breakDC + '</a><br>';

            message += '<b>Switch:</b> ' + (typeof door.switch_id == 'undefined' ? 'None' : (door.switch_hidden['current'] ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --reveal-switch" title="Reveal ' + door.label['switch'] + ' to players">Hidden</a>' : 'Visible') + ' <a style=\'' + styles.textButton + 'text-decoration: none;\' href="!door ping ' + door.id + ' switch" title="Ping switch token">📍</a>') + '<br>';
            if (typeof door.switch_id != 'undefined') message += '<b>Switch Label:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --label-switch|?{Label|' + door.label['switch'] + '}" title="Change switch label">' + door.label['switch'] + '</a></p>';

            // Keyed doors
            if (door.has_key) {
                message += '<hr style="margin: 4px 12px;"><p>';
                if (typeof door.lock_id != 'undefined') {
                    message += '<b>External Lock:</b> ' + (door.lock_hidden['current'] ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --show-lock" title="Allow players to use lock">Hidden</a>' : 'Enabled') + '  <a style=\'' + styles.textButton + 'text-decoration: none;\' href="!door ping ' + door.id + ' lock" title="Ping lock token">📍</a><br>';
                } else {
                    message += '<b>Key:</b> ' + (door.key_char_id == state['DoorMaster'].doorCharID ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --keyhole" title="Allow players to use key">Disabled</a>' : 'Enabled') + '<br>';
                }
                message += '<b>Key Reset:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --toggle-key-reset" title="Turn key reset ' + (door.key_reset ? 'OFF' : 'ON') + '">' + (door.key_reset ? 'ON' : 'OFF') + '</a><br>';
                message += '<b>Passphrase:</b> <i>' + door.lock_passphrase + '</i> <a style=\'' + styles.textButton + 'text-decoration: none;\' href="!door status ' + door.id + ' --passphrase|?{Passphrase|' + door.lock_passphrase + '}" title="Change lock passphrase">&Delta;</a><br>';
                message += '<b>Case Sensitive:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --toggle-case-sensitive" title="Turn case sensitivity ' + (door.case_sensitive ? 'off' : 'on') + ' for this passphrase">' + (door.case_sensitive ? 'YES' : 'NO') + '</a><br>';
                message += '</p><hr style="margin: 4px 12px;">';
            }

            // Trapped doors
            if (typeof door.trap != 'undefined') {
                var effect = _.clone(door.trap['effect']);
                message += (door.has_key ? '' : '<hr style="margin: 4px 12px;">') + '<p>';
                message += '<b>Trap:</b> ' + (door.trap['disabled'] ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --toggle-trap" title="Activate the trap">Disabled</a>' : '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --toggle-trap" title="Disable the trap">Activated</a>') + '<br>';
                message += '<b>Disable DC:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --disable-dc|?{Disable DC|' + door.trap['disableDC'] + '}" title="Change disable DC">' + door.trap['disableDC'] + '</a><br>';

                var reveal = door.trap['disabled'] ? 'Hidden' : (door.trap['hidden'] ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --reveal-trap" title="Reveal Disable button to players">Hidden</a>' : '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --reveal-trap" title="Remove Disable button door">Available</a>');

                message += '<b>Disable Button:</b> ' + reveal + '<br>';

                message += '<b>Triggers:</b> ' + door.trap['triggers'].join(', ') + '<br>';
                message += '<b>Auto Reset:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --toggle-trap-reset" title="Turn trap auto reset ' + (door.trap['disable_after_trigger'] ? 'ON' : 'OFF') + '">' + (door.trap['disable_after_trigger'] ? 'OFF' : 'ON') + '</a><br>';

                if (door.trap['disable_after_trigger']) message += '<b>Break Door:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --toggle-trap-break" title="Turn ' + (door.trap['break_door'] ? 'OFF' : 'ON') + ' breaking the door when triggered">' + (door.trap['break_door'] ? 'ON' : 'OFF') + '</a><br>';
                else message += '<b>Break Door:</b> <span style="cursor: help;" title="Trap cannot break the door while Auto Reset is on">' + (door.trap['break_door'] ? 'ON' : 'OFF') + '</span><br>';

                effect = (effect.startsWith('&{template') ? effect.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;') : effect.replace(/<[^>]+>/gi, '').replace(/\[/g, '&#91;').replace(/\]/g, '&#93;'));
                message += '<b>Effect:</b><br>' + (effect.search('&#123;template') != -1 ? '<i>' : '') + effect.substr(0, 145) + (effect.search('&#123;template') != -1 ? '</i>' : '') + (effect.length > 120 ? '&hellip;' : '') + '<br>';
                message += '</p><hr style="margin: 4px 12px;">';
            }

            if (typeof door.dials != 'undefined') {
                message += '<p>This door has ' + (_.size(door.dials) == 1 ? '1 dial' : _.size(door.dials) + ' dials') + ' in use.<br>';
                message += '<b>Dial Label:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --label-dial|?{Label|' + door.label['dial'] + '}" title="Change dial label">' + door.label['dial'] + '</a></p>';
            }

            if (typeof door.tiles != 'undefined') {
                message += '<p>This door has ' + (_.size(door.tiles) == 1 ? '1 tile' : _.size(door.tiles) + ' tiles');
                if (typeof door.decoys != 'undefined') message += ' and ' + (_.size(door.decoys) == 1 ? '1 decoy' : _.size(door.decoys) + ' decoys');
                message += ' in use.<br>';
                message += '<b>Tile Label:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --label-tile|?{Label|' + door.label['tile'] + '}" title="Change tile label">' + door.label['tile'] + '</a></p>';
            }

            message += '<p><b>Tokens locked?</b> ' + (door.tokens_locked ? 'Yes' : '<span style="color: #C91010;">No</span> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --token-lock" title="Lock all associated tokens">lock</a>') + '</p>';
            message += '<p><b>Linked Doors:</b> ' + (typeof door.linked != 'undefined' ? _.size(door.linked) : 'none') + ' <a style=\'' + styles.textButton + '\' href="!door link ' + door.id + '" title="Link selected door(s)">link</a><br>';
            if (typeof door.linked != 'undefined') message += '<b>All-or-nothing?</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --toggle-aon" title="Turn all-or-nothing ' + (door.all_or_nothing ? 'OFF' : 'ON') + '">' + (door.all_or_nothing ? 'ON' : 'OFF') + '</a></p>';

            showDialog((door.open ? 'Open ' : 'Closed ') + initCap(door.label['door']), message, 'GM');
        } else showDialog('Door Status Error', 'Invalid ID.', 'GM');
    },

    commandPingToken = function (msg) {
        var door, token_id, parms = msg.content.split(/\s+/i);
        door = _.find(state['DoorMaster'].doors, function (x) { return x.id == parms[2]; });
        if (door) {
            if (parms[3] == 'door') token_id = door.open ? door.open_id : door.closed_id;
            if (parms[3] == 'switch') token_id = door.open ? door.switch2_id : door.switch_id;
            if (parms[3] == 'lock') token_id = door.lock_id;
            var token = getObj('graphic', token_id);
            if (token) {
                var gm_ids = [], players = findObjs({type: 'player', online: true});
                _.each(players, function (player) {
                    if (playerIsGM(player.get('id'))) gm_ids.push(player.get('id'));
                });
                sendPing(token.get('left'), token.get('top'), token.get('pageid'), null, false, gm_ids);
            } else showDialog('Ping Error', 'Token does not exist.', 'GM');
        } else showDialog('Ping Error', 'Invalid door ID.', 'GM');
    },

    // Get all player controlled characters that are not "utility characters"
    getCharsFromPlayerID = function (player_id) {
        var chars = findObjs({type: 'character', archived: false});
        chars = _.filter(chars, function (char) {
            var controllers = char.get('controlledby').split(',');
            var str_attr = findObjs({type: 'attribute', characterid: char.get('id'), name: 'strength'}, {caseInsensitive: true});
            var str = (_.size(str_attr) > 0) ? str_attr[0].get('current') : 0;
            return (_.find(controllers, function (x) { return x == player_id; }) && parseInt(str) > 0);
        });
        return chars;
    },

    // Capitalizes the first letter of each word in a string
    initCap = function (str) {
        var new_words = [], words = str.split(/\s+/g);
        _.each(words, function (word) {
            var letters = word.split('');
            letters[0] = letters[0].toUpperCase();
            new_words.push(letters.join(''));
        });
        return new_words.join(' ');
    },

    getSkills = function (char_id, attribute = 'DEX') {
        var retSkills = '', skills = [];

        // Give the base attribute mod, just in case
        if (attribute == 'DEX') {
            var dex_mod = getAttrByName(char_id, (isShapedSheet() ? 'dexterity_mod_with_sign' : 'dexterity_mod'), 'current') || '0';
            skills.push({name: 'Dexterity', mod: dex_mod});
        } else {
            var str_mod = getAttrByName(char_id, (isShapedSheet() ? 'strength_mod_with_sign' : 'strength_mod'), 'current') || '0';
            skills.push({name: 'Strength', mod: str_mod});
        }

        var charAttrs = findObjs({type: 'attribute', characterid: char_id}, {caseInsensitive: true});
        if (isShapedSheet()) {
            var skillsForIDs = _.filter(charAttrs, function (attr) { return (attr.get('name').match(/^repeating_skill_(.+)_ability$/) !== null && attr.get('current') == attribute); });
            _.each(skillsForIDs, function (skill) {
                var skill_id = skill.get('name').replace(/^repeating_skill_([^_]+)_ability$/, '$1');
                var tmp_name = getAttrByName(char_id, 'repeating_skill_' + skill_id + '_name', 'current');
                // Filter out known irrelevant skills
                if (((tmp_name.match(/^thieve('s|s'|s)\s+tools$/i) || tmp_name == 'Sleight of Hand') && attribute == 'DEX')
                    || ((tmp_name.match(/^portable\s+ram$/i) || tmp_name == 'Athletics') && attribute == 'STR')) {
                    var tmp_mod = getAttrByName(char_id, 'repeating_skill_' + skill_id + '_total_with_sign', 'current') || '0';
                    if (tmp_name.match(/^portable\s+ram$/i)) tmp_mod = parseInt(tmp_mod) + 4; // Shaped sheet cannot add bonus or mod to skills
                    skills.push({name: tmp_name, mod: tmp_mod});
                }
            });
        } else { //OGL sheet
            if (attribute == 'STR') {
                var ath_mod = getAttrByName(char_id, 'athletics_bonus', 'current') || '0';
                skills.push({name: 'Athletics', mod: ath_mod});
                var pRam = _.find(charAttrs, function (attr) { return (attr.get('name').match(/^repeating_tool_(.+)_toolname$/) !== null && attr.get('current').match(/^portable\s+ram$/i) != null); });
                if (pRam) {
                    var skill_id = pRam.get('name').replace(/^repeating_tool_([^_]+)_toolname$/, '$1');
                    var tool_mod = getAttrByName(char_id, 'repeating_tool_' + skill_id + '_toolbonus', 'current') || '0';
                    skills.push({name: 'Portable Ram', mod: tool_mod});
                }
            } else {
                var soh_mod = getAttrByName(char_id, 'sleight_of_hand_bonus', 'current') || '0';
                skills.push({name: 'Sleight of Hand', mod: soh_mod});
                var tTools = _.find(charAttrs, function (attr) { return (attr.get('name').match(/^repeating_tool_(.+)_toolname$/) !== null && attr.get('current').match(/^thieve('s|s'|s)\s+tools$/i) != null); });
                if (tTools) {
                    var skill_id = tTools.get('name').replace(/^repeating_tool_([^_]+)_toolname$/, '$1');
                    var tool_mod = getAttrByName(char_id, 'repeating_tool_' + skill_id + '_toolbonus', 'current') || '0';
                    skills.push({name: 'Thieves\' Tools', mod: tool_mod});
                }
            }
        }

        // Return string for query
        skills = skills.reverse();
        _.each(skills, function (skill) { retSkills += '|' + skill.name + ',' + skill.mod + '::' + skill.name.replace(/\s/g, '~'); });
        return retSkills;
    },

    // Create Door Characters
    createDoorChars = function (msg) {
        var retval = false;
        if (!doorCharExists()) {
            var char = createObj("character", {name: 'DoorMaster', controlledby: 'all'});
            var char_id = char.get('id');
            char.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Use', characterid: char_id, action: '!door use', istokenaction: true });
            createObj("ability", { name: 'Pick', characterid: char_id, action: '!door pick', istokenaction: true });
            createObj("ability", { name: 'Break', characterid: char_id, action: '!door break', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: char_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].doorCharID = char_id;
            retval = true;
        }

        if (!doorKeyedCharExists()) {
            var char = createObj("character", {name: 'DoorMaster Keyed', controlledby: 'all'});
            var char_id = char.get('id');
            char.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Use', characterid: char_id, action: '!door use', istokenaction: true });
            createObj("ability", { name: 'Key', characterid: char_id, action: '!door key ?{Enter Passphrase|}', istokenaction: true });
            createObj("ability", { name: 'Pick', characterid: char_id, action: '!door pick', istokenaction: true });
            createObj("ability", { name: 'Break', characterid: char_id, action: '!door break', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: char_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].doorKeyedCharID = char_id;
            retval = true;
        }

        if (!switchCharExists()) {
            var char = createObj("character", {name: 'DoorMaster Switch', controlledby: 'all'});
            var char_id = char.get('id');
            char.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Use', characterid: char_id, action: '!door use', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: char_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].switchCharID = char_id;
            retval = true;
        }

        if (!lockCharExists()) {
            var char = createObj("character", {name: 'DoorMaster Lock', controlledby: 'all'});
            var char_id = char.get('id');
            char.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Key', characterid: char_id, action: '!door key ?{Enter Passphrase|}', istokenaction: true });
            createObj("ability", { name: 'Pick', characterid: char_id, action: '!door pick', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: char_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].lockCharID = char_id;
            retval = true;
        }

        if (!trapCharExists()) {
            var char = createObj("character", {name: 'DoorMaster Trapped', controlledby: 'all'});
            var char_id = char.get('id');
            char.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Use', characterid: char_id, action: '!door use', istokenaction: true });
            createObj("ability", { name: 'Pick', characterid: char_id, action: '!door pick', istokenaction: true });
            createObj("ability", { name: 'Break', characterid: char_id, action: '!door break', istokenaction: true });
            createObj("ability", { name: 'Disable', characterid: char_id, action: '!door disable-trap', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: char_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].trapCharID = char_id;
            retval = true;
        }

        if (!trapKeyedCharExists()) {
            var char = createObj("character", {name: 'DoorMaster Trapped Keyed', controlledby: 'all'});
            var char_id = char.get('id');
            char.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Use', characterid: char_id, action: '!door use', istokenaction: true });
            createObj("ability", { name: 'Key', characterid: char_id, action: '!door key ?{Enter Passphrase|}', istokenaction: true });
            createObj("ability", { name: 'Pick', characterid: char_id, action: '!door pick', istokenaction: true });
            createObj("ability", { name: 'Break', characterid: char_id, action: '!door break', istokenaction: true });
            createObj("ability", { name: 'Disable', characterid: char_id, action: '!door disable-trap', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: char_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].trapKeyedCharID = char_id;
            retval = true;
        }
        return retval;
    },

    doorCharExists = function () {
        var char = getObj('character', state['DoorMaster'].doorCharID);
        if (!char) {
            var allChars = findObjs({type: 'character', archived: false}, {caseInsensitive: true});
            char = _.find(allChars, function (char) { return char.get('name') == 'DoorMaster'; });
        }
        if (char) {
            if (state['DoorMaster'].doorCharID == '') state['DoorMaster'].doorCharID = char.get('id');
            return true;
        } else return false;
    },

    doorKeyedCharExists = function () {
        var char = getObj('character', state['DoorMaster'].doorKeyedCharID);
        if (!char) {
            var allChars = findObjs({type: 'character', archived: false}, {caseInsensitive: true});
            char = _.find(allChars, function (char) { return char.get('name') == 'DoorMaster Keyed'; });
        }
        if (char) {
            if (state['DoorMaster'].doorKeyedCharID == '') state['DoorMaster'].doorKeyedCharID = char.get('id');
            return true;
        } else return false;
    },

    trapCharExists = function () {
        var char = getObj('character', state['DoorMaster'].trapCharID);
        if (!char) {
            var allChars = findObjs({type: 'character', archived: false}, {caseInsensitive: true});
            char = _.find(allChars, function (char) { return char.get('name') == 'DoorMaster Trapped'; });
        }
        if (char) {
            if (state['DoorMaster'].trapCharID == '') state['DoorMaster'].trapCharID = char.get('id');
            return true;
        } else return false;
    },

    trapKeyedCharExists = function () {
        var char = getObj('character', state['DoorMaster'].trapKeyedCharID);
        if (!char) {
            var allChars = findObjs({type: 'character', archived: false}, {caseInsensitive: true});
            char = _.find(allChars, function (char) { return char.get('name') == 'DoorMaster Trapped Keyed'; });
        }
        if (char) {
            if (state['DoorMaster'].trapKeyedCharID == '') state['DoorMaster'].trapKeyedCharID = char.get('id');
            return true;
        } else return false;
    },

    switchCharExists = function () {
        var char = getObj('character', state['DoorMaster'].switchCharID);
        if (!char) {
            var allChars = findObjs({type: 'character', archived: false}, {caseInsensitive: true});
            char = _.find(allChars, function (char) { return char.get('name') == 'DoorMaster Switch'; });
        }
        if (char) {
            if (state['DoorMaster'].switchCharID == '') state['DoorMaster'].switchCharID = char.get('id');
            return true;
        } else return false;
    },

    lockCharExists = function () {
        var char = getObj('character', state['DoorMaster'].lockCharID);
        if (!char) {
            var allChars = findObjs({type: 'character', archived: false}, {caseInsensitive: true});
            char = _.find(allChars, function (char) { return char.get('name') == 'DoorMaster Lock'; });
        }
        if (char) {
            if (state['DoorMaster'].lockCharID == '') state['DoorMaster'].lockCharID = char.get('id');
            return true;
        } else return false;
    },

    showDialog = function (title, content, whisperTo = '') {
        // Outputs a pretty box in chat with a title and content
        var body, gm = /\(GM\)/i;
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        if (whisperTo.length > 0) {
            whisperTo = '/w ' + (gm.test(whisperTo) ? 'GM' : '"' + whisperTo + '"') + ' ';
            sendChat('DoorMaster', whisperTo + body, null, {noarchive:true});
        } else  {
            sendChat('DoorMaster', body);
        }
    },

    // Returns whether or not a string is actually a Number
    isNum = function (txt) {
        var nr = /^\d+$/;
        return nr.test(txt);
    },

    rollSkillCheck = function (skill_mod, adv_dis = '0') {
        // example +3::Sleight~of~Hand
        skill_mod = skill_mod.split('::');
        var end_result = {base: 0, mod: parseInt(skill_mod[0]), skill: skill_mod[1].replace(/~/g, ' '), adv_dis: adv_dis};
        end_result.roll1 = randomInteger(20),
        end_result.roll2 = randomInteger(20);

        end_result.base = end_result.roll1;
        if (end_result.adv_dis == '+1') end_result.base = (end_result.roll1 < end_result.roll2) ? end_result.roll2 : end_result.roll1;
        if (end_result.adv_dis == '-1') end_result.base = (end_result.roll1 < end_result.roll2) ? end_result.roll1 : end_result.roll2;

        end_result.final = end_result.base + end_result.mod;
        var mod = (end_result.mod > 0 ? '+ ' + end_result.mod : (end_result.mod < 0 ? '- ' + Math.abs(end_result.mod) : '+ 0'));

        // Accomodate bonus from portable ram
        var ram_mod = end_result.mod - 4;
        var str_only = (ram_mod > 0 ? '+ ' + ram_mod : (ram_mod < 0 ? '- ' + Math.abs(ram_mod) : '+ 0'));

        end_result.formula = (end_result.adv_dis != '0' ? '2' : '1') + 'd20' + ((end_result.adv_dis == '+1') ? 'kh1' : (end_result.adv_dis == '-1' ? 'kl1' : ''));
        end_result.formula += ' ' + (end_result.skill.match(/^portable(\s+)ram$/i) ? str_only + '[str] + 4[portable ram' : mod + '[' + end_result.skill.toLowerCase());
        end_result.formula += '] = (' + (end_result.adv_dis != '0' ? end_result.roll1 + '+' +  end_result.roll2 : end_result.base) + ')'
            + mod.replace(/\s/g, '') + (end_result.adv_dis != '0' ? ' = ' + end_result.base + mod.replace(/\s/g, '') : '');
        return end_result;
    },

    getContrastColor = function (color) {
        if (color.slice(0, 1) === '#') color = color.slice(1);
        if (color.length === 3) {
            color = color.split('').map(function (hex) {
                return hex + hex;
            }).join('');
        }
        var r = parseInt(color.substr(0, 2), 16);
        var g = parseInt(color.substr(2, 2), 16);
        var b = parseInt(color.substr(4, 2), 16);
        var ratio = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (ratio >= 128) ? 'black' : 'white';
    },

    // Returns a number between -179 and 180 for comparing angles
    getRotation = function (rotation) {
        var real_rotation = rotation;
        if (rotation < 0) real_rotation = 360 + rotation;
        if (rotation > 360) real_rotation = rotation % 360;
        if (rotation == 360) real_rotation = 0;
        if (real_rotation > 180) real_rotation -= 360;
        return parseInt(real_rotation);
    },

    // Returns offset coordinates that don't place the token off the map
    getTokenOffset = function (token) {
        var top = Math.round(token.get('top')), left = Math.round(token.get('left')),
        page = getObj('page', token.get('pageid'));
        var cell_width = page.get('snapping_increment') * 70; //pixels per unit
        var page_width = page.get('width') * cell_width; // pixel width of page
        var page_height = page.get('height') * cell_width; // pixel height of page
        var token_offset =(token.get('isdrawing') ? cell_width / 2 : cell_width); //amount to offset token

        top = (top <= page_height / 2) ? top + token_offset : top - token_offset;
        left = (left <= page_width / 2) ? left + token_offset : left - token_offset;

        return {top: Math.round(top), left: Math.round(left)};
    },

    isShapedSheet = function () {
        var is_shaped = false, char = findObjs({type: 'character'})[0];
        if (char) {
            var charAttrs = findObjs({type: 'attribute', characterid: char.get('id')}, {caseInsensitive: true});
            if (_.find(charAttrs, function (x) { return x.get('name') == 'character_sheet' && x.get('current').search('Shaped') != -1; })) is_shaped = true;
        }
        return is_shaped;
    },

    processGMNotes = function (notes) {
        var retval, text = unescape(notes).trim();
        if (text.search('{template:') != -1) {
            text = removeFormatting(text);
            text = text.replace('&amp;{template', '&{template');
        }
        return text;
    },

    removeFormatting = function (html) {
        html = html.replace(/<p[^>]*>/gi, '<p>').replace(/\n(<p>)?/gi, '</p><p>').replace(/<br>/gi, '</p><p>').replace(/<\/?(span|div|pre|img|code|a|b|i|h1|h2|h3|h4|h5|hr)[^>]*>/gi, '');
        if (html != '' && /<p>.*?<\/p>/g.test(html)) {
            html = html.match(/<p>.*?<\/p>/g).map( l => l.replace(/^<p>(.*?)<\/p>$/,'$1'));
            html = html.join(/\n/);
        }
        return html;
    },

    createMacro = function (action = '') {
        var macro = findObjs({type: 'macro', name: 'DoorMaster'});
        if (_.size(macro) == 0) {
            var gm = _.find(findObjs({type: 'player'}), function (char) { return playerIsGM(char.get('id')); });
            createObj("macro", { name: 'DoorMaster', playerid: gm.get('id'), action: '!door ?{Choose|View Status,status|Create Door,create|Destroy Door,destroy}' });
            if (action != '') commandConfig({content: '!door config'});
            else return true;
        } else return false;
    },

    runUpgrades = function () {
        // 3.0 upgrade
        if (typeof state['DoorMaster'].doorCharID != 'undefined' && state['DoorMaster'].doorCharID != '') {
            var attrs = findObjs({type: 'ability', characterid: state['DoorMaster'].doorCharID}, {caseInsensitive: true});
            _.each(attrs, function (attr) {
                if (attr.get('name') == 'Use Door') attr.set({name: 'Use'});
                if (attr.get('name') == 'Pick Lock') attr.set({name: 'Pick'});
                if (attr.get('name') == 'Break Door') attr.set({name: 'Break'});
            });
        }

        // 3.1 upgrade
        if (_.size(state['DoorMaster'].doors) > 0) {
            _.each(state['DoorMaster'].doors, function (door) {
                if (typeof door.label == 'undefined') door.label = {door: 'door', switch: 'switch'};
            });
        }

        // 4.1 upgrade
        _.each(state['DoorMaster'].doors, function (door) {
            if (typeof door.created == 'undefined') {
                var now = new Date();
                door.created = now.valueOf();
                if (door.condition == 'Barred') door.condition = 'Obstructed';
            }
        });
    },

    generateUniqueID = function () {
        "use strict";
        return generateUUID().replace(/_/g, "Z");
    },

    generateUUID = (function () {
        "use strict";
        var a = 0, b = [];
        return function() {
            var c = (new Date()).getTime() + 0, d = c === a;
            a = c;
            for (var e = new Array(8), f = 7; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++){
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    }()),

    //---- PUBLIC FUNCTIONS ----//

    // Enforces locks on tokens and checks tile placement
    handleMove = function (obj, prev) {
        if (_.find(state['DoorMaster'].lockedTokens, function (x) { return x == obj.get('id'); })) {
            obj.set({left: prev.left, top: prev.top, rotation: prev.rotation});
        }
        var door = _.find(state['DoorMaster'].doors, function (x) { return x.id == obj.get('name'); });
        if (door) {
            // Lock movement of dial tokens but not rotation, of course
            var dial_ids = (typeof door.dials != 'undefined') ? _.pluck(door.dials, 'dial_id') : [];
            if (door.tokens_locked && _.find(dial_ids, function (x) { return x = obj.get('id'); })) {
                obj.set({left: prev.left, top: prev.top});
            }

            // Check placement of tiles
            if (door.condition == 'Locked' && typeof door.tiles != 'undefined') {
                var tile_ids = _.pluck(door.tiles, 'tile_id');

                if (_.find(tile_ids, function (x) { return x == obj.get('id'); })) {
                    var responses = _.compact(_.pluck(door.tiles, 'feedback'));
                    if (typeof door.decoys != 'undefined') {
                        responses.push(_.compact(_.pluck(door.decoys, 'feedback')));
                        responses = _.flatten(responses);
                    }
                    if (_.size(responses) == 0) responses = ['A muffled "click" is heard...'];
                    var all_placed = true;
                    _.each(door.tiles, function (tile) {
                        var placed = true, tile_token = getObj('graphic', tile.tile_id);
                        if (Math.abs(tile_token.get('top') - tile.top) >= 5 || Math.abs(tile_token.get('left') - tile.left) >= 5) {
                            all_placed = false;
                            placed = false;
                        }
                        tile_token.set({aura2_radius: '0.25', aura2_color: (placed ? '#00cc00' : '#cc0000')});
                        if (!placed && tile.tile_id == obj.get('id') && triggeredTrap(door, ['Misplace'])) executeTrap(door, initCap(door.label['tile']) + ' Mover');
                    });
                    if (all_placed) {
                        door.condition = 'Unlocked';
                        _.each(door.tiles, function (tile) {
                            var tile_token = getObj('graphic', tile.tile_id);
                            tile_token.set({aura2_radius: ''});
                        });
                        showDialog('Unlocked', responses[randomInteger(_.size(responses))-1] );
                        if (triggeredTrap(door, ['Unlock'])) executeTrap(door, initCap(door.label['tile']) + ' Mover');
                    } else if (triggeredTrap(door, ['All-Misplace'])) executeTrap(door, initCap(door.label['tile']) + ' Mover');
                }

                // Check for wrongly placed decoy tokens
                var decoy_ids = (typeof door.decoys != 'undefined') ? _.pluck(door.decoys, 'decoy_id') : [];
                if (_.find(decoy_ids, function (x) { return x == obj.get('id'); }) && triggeredTrap(door, ['Decoy'])) {
                    var wrong = false;
                    _.each(door.tiles, function (tile) {
                        if (Math.abs(obj.get('top') - tile.top) < 5 && Math.abs(obj.get('left') - tile.left) < 5) wrong = true;
                    });
                    if (wrong) executeTrap(door, initCap(door.label['tile']) + ' Mover');
                }
            }
        }
    },

    // Checks rotation on dials
    handleRotation = function (obj) {
        var token = getObj('graphic', obj.get('id'));
        if (token) {
            var door = _.find(state['DoorMaster'].doors, function (x) { return x.id == token.get('name'); })
            if (door && door.condition == 'Locked' && typeof door.dials != 'undefined') {
                var dial_ids = _.pluck(door.dials, 'dial_id');
                if (_.find(dial_ids, function (x) { return x == token.get('id'); })) {
                    var responses = _.compact(_.pluck(door.dials, 'feedback'));
                    if (_.size(responses) == 0) responses = ['A muffled "click" is heard...'];
                    var all_dialed = true;
                    _.each(door.dials, function (dial) {
                        var dialed = true, dial_token = getObj('graphic', dial.dial_id);
                        var curr_rotation = getRotation(dial_token.get('rotation'));
                        if (Math.abs(curr_rotation - dial.rotation) >= 5) {
                            all_dialed = false;
                            dialed = false;
                        }
                        dial_token.set({aura2_radius: '0.25', aura2_color: (dialed ? '#00cc00' : '#cc0000')});
                        if (!dialed && dial.dial_id == token.get('id') && triggeredTrap(door, ['Misdial'])) executeTrap(door, initCap(door.label['dial']) + ' Mover');
                    });
                    if (all_dialed) {
                        door.condition = 'Unlocked';
                        _.each(door.dials, function (dial) {
                            var dial_token = getObj('graphic', dial.dial_id);
                            dial_token.set({aura2_radius: ''});
                        });
                        showDialog('Unlocked', responses[randomInteger(_.size(responses))-1] );
                        if (triggeredTrap(door, ['Unlock'])) executeTrap(door, initCap(door.label['dial']) + ' Mover');
                    } else if (triggeredTrap(door, ['All-Misdial'])) executeTrap(door, initCap(door.label['dial']) + ' Mover');
                }
            }
        }
    },

    registerEventHandlers = function () {
		on('chat:message', handleInput);
        on('change:graphic', handleMove);
        on('change:graphic:rotation', handleRotation);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    DoorMaster.checkInstall();
    DoorMaster.registerEventHandlers();
});
