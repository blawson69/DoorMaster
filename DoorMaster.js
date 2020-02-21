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

    var version = '3.0',
    debugMode = true,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 6px 8px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 6px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        resultBox: 'margin: 3px; padding: 2px 6px; border: 1px solid #c1c1c1; border-radius: 9px; font-variant: small-caps; color: #545454;',
        result: 'font-size: 1.25em; font-weight: bold; cursor: pointer;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
        alert: 'color: #C91010; font-size: 1.5em; font-weight: bold; font-variant: small-caps; text-align: center;',
        msg: 'padding: 4px 10px; color: #C91010; font-size: 1em; border: 1px solid #C91010; text-align: center;'
    },
    DOOR_CONDITIONS = ['Unlocked', 'Locked', 'Keyed', 'Barred', 'Stuck', 'Disabled', 'Broken'],

    checkInstall = function () {
        if (!_.has(state, 'DoorMaster')) {
            state['DoorMaster'] = state['DoorMaster'] || {};
            state['DoorMaster'].showInit = true;
        }
        if (typeof state['DoorMaster'].doors == 'undefined') state['DoorMaster'].doors = [];
        if (typeof state['DoorMaster'].doorCharID == 'undefined') state['DoorMaster'].doorCharID = '';
        if (typeof state['DoorMaster'].doorKeyedCharID == 'undefined') state['DoorMaster'].doorKeyedCharID = '';
        if (typeof state['DoorMaster'].switchCharID == 'undefined') state['DoorMaster'].switchCharID = '';
        if (typeof state['DoorMaster'].lockCharID == 'undefined') state['DoorMaster'].lockCharID = '';
        if (typeof state['DoorMaster'].lockedTokens == 'undefined') state['DoorMaster'].lockedTokens = [];
        if (typeof state['DoorMaster'].allowFumbles == 'undefined') state['DoorMaster'].allowFumbles = true;
        if (typeof state['DoorMaster'].showPlayersRolls == 'undefined') state['DoorMaster'].showPlayersRolls = false;
        if (typeof state['DoorMaster'].useAura == 'undefined') state['DoorMaster'].useAura = true;
        if (typeof state['DoorMaster'].doorAuraColor == 'undefined') state['DoorMaster'].doorAuraColor = '#666666';
        if (typeof state['DoorMaster'].hiddenAuraColor == 'undefined') state['DoorMaster'].hiddenAuraColor = '#99cc99';

        if (state['DoorMaster'].doorKeyedCharID == '' || state['DoorMaster'].switchCharID == '' || state['DoorMaster'].lockCharID == '') state['DoorMaster'].showInit = true;
        if (typeof state['DoorMaster'].doorCharID != 'undefined' && state['DoorMaster'].doorCharID != '') {
            var attrs = findObjs({type: 'ability', characterid: state['DoorMaster'].doorCharID}, {caseInsensitive: true});
            _.each(attrs, function (attr) {
                if (attr.get('name') == 'Use Door') attr.set({name: 'Use'});
                if (attr.get('name') == 'Pick Lock') attr.set({name: 'Pick'});
                if (attr.get('name') == 'Break Door') attr.set({name: 'Break'});
            });
        }

        log('--> DoorMaster v' + version + ' <-- Initialized');
		if (debugMode) {
			var d = new Date();
			showDialog('Debug Mode', 'DoorMaster v' + version + ' loaded at ' + d.toLocaleTimeString() + '<br><a style=\'' + styles.textButton + '\' href="!door config">Show config</a>', 'GM');
		}

        if (state['DoorMaster'].showInit) {
            createDoorChars();
            showDialog('Welcome', 'Characters have been created for use by the DoorMaster script. <i>Do not</i> rename or delete them.<div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!door config">Show config</a></div>', 'GM');
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
            if (action[0] == 'show-toggle') state['DoorMaster'].showPlayersRolls = !state['DoorMaster'].showPlayersRolls;
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

        message += '<hr style="margin: 4px 12px 8px;"><div style=\'' + styles.title + '\'>Lock Picking Fumbles: ' + (state['DoorMaster'].allowFumbles ? 'On' : 'Off') + '</div>';
        message += (state['DoorMaster'].allowFumbles ? 'You have opted' : 'You can opt') + ' to allow fumbles for lock picking attempts. On a natural 1, the lock will be rendered Disabled.<br>';
        message += '<a style=\'' + styles.textButton + '\' href="!door config --fumble-toggle">turn ' + (state['DoorMaster'].allowFumbles ? 'off' : 'on') + '</a><br><br>';

        message += '<hr style="margin: 4px 12px 8px;"><div style=\'' + styles.title + '\'>Show Results: ' + (state['DoorMaster'].showPlayersRolls ? 'On' : 'Off') + '</div>';
        message += (state['DoorMaster'].showPlayersRolls ? 'You have opted' : 'You can opt') + ' to show players the roll results of their lock picking and door breaking attempts.<br>';
        message += '<a style=\'' + styles.textButton + '\' href="!door config --show-toggle">turn ' + (state['DoorMaster'].showPlayersRolls ? 'off' : 'on') + '</a><br><br>';

        message += '<hr style="margin: 4px 12px 8px;">You have created ' + (_.size(state['DoorMaster'].doors) == 0 ? 'no doors yet' : (_.size(state['DoorMaster'].doors) == 1 ? '1 door' : _.size(state['DoorMaster'].doors) + ' doors')) + '.<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + ';" href="!door create" title="Create a new door with the selected tokens">Create Door</a> &nbsp; <a style="' + styles.button + ';" href="!door status" title="Show the status the selected token\'s door">Door Status</a></div><br>';

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
        showDialog('DoorMaster Help', message, msg.who);
    },

    commandCreateDoor = function (msg) {
        var message = '', parms = msg.content.split(/\s*\-\-/i);
        if (_.size(msg.selected) < 2) {
            showDialog('Creation Error', 'You need at least 2 tokens selected to create a door.', 'GM');
            return;
        }

        var paths = [], new_door = {open: false, tokens_locked: false};
        _.each(msg.selected, function (obj) {
            var token = getObj(obj._type, obj._id);
            if (token) {
                if (token.get('type') == 'graphic') {
                    var token_name = token.get('name').trim();
                    if (token_name == 'Closed') {
                        new_door.closed_id = token.get('id');
                        new_door.condition = (_.find(DOOR_CONDITIONS, function (x) { return x == token.get('bar1_value').trim(); }) && token.get('bar1_value').trim() != 'Broken') ? token.get('bar1_value').trim() : 'Unlocked';
                        new_door.visibility = (token.get('bar1_max') == 'Secret' || token.get('bar1_max') == 'Concealed') ? token.get('bar1_max') : 'Visible';
                        new_door.hidden = (token.get('bar1_max') == 'Secret' || token.get('bar1_max') == 'Concealed');
                        new_door.lockDC = (isNum(token.get('bar2_value'))) ? parseInt(token.get('bar2_value')) : 12;
                        new_door.breakDC = (isNum(token.get('bar2_max'))) ? parseInt(token.get('bar2_max')) : (new_door.condition == 'Barred' ? 30 : 15);
                        new_door.lock_passphrase = token.get('bar3_value').trim();
                    } else if (token_name == 'Open') {
                        new_door.open_id = token.get('id');
                    } else if (token_name == 'Switch' || token_name == 'Switch1') {
                        new_door.switch_id = token.get('id');
                        if (token.get('bar1_value') == 'Hidden') new_door.switch_hidden = true;
                    } else if (token_name == 'Switch2') {
                        new_door.switch2_id = token.get('id');
                        if (token.get('bar1_value') == 'Hidden') new_door.switch_hidden = true;
                    } else if (token_name == 'Broken') {
                        new_door.broken_id = token.get('id');
                    } else if (token_name == 'Lock') {
                        new_door.lock_id = token.get('id');
                        if (token.get('bar1_value') == 'Hidden') new_door.lock_hidden = true;
                    }
                } else if (token.get('type') == 'path') {
                    paths.push(token.get('id'));
                }
            }
        });
        new_door.paths = paths;
        if (new_door.condition == 'Keyed') {
            new_door.condition = 'Locked';
            new_door.has_key = true;
            new_door.key_char_id = state['DoorMaster'].doorCharID;
            if (new_door.lock_passphrase == '') new_door.lock_passphrase = 'Open sesame';
        }

        if (typeof new_door.open_id != 'undefined' && typeof new_door.closed_id != 'undefined') {
            new_door.id = generateUniqueID();
            if (new_door.switch_hidden) new_door.switch_hidden = {original: true, current: true};
            else new_door.switch_hidden = {original: false, current: false};
            if (new_door.lock_hidden) new_door.lock_hidden = {original: true, current: true};
            else new_door.lock_hidden = {original: false, current: false};
            _.each(msg.selected, function (obj) {
                var token = getObj(obj._type, obj._id);
                if (token) {
                    var aura_settings = {aura1_radius: '0.1', aura1_color: state['DoorMaster'].doorAuraColor, aura1_square: false};
                    var hidden_aura_settings = {aura2_radius: '0.1', aura2_color: state['DoorMaster'].hiddenAuraColor, aura2_square: false};
                    if (token.get('type') == 'graphic') {
                        // Set basics
                        token.set({name: new_door.id, playersedit_name: false, showname: false, bar1_value: '', bar1_max: '', bar2_value: '', bar2_max: '', bar3_value: '', bar3_max: '', showplayers_bar1: false, showplayers_bar2: false, showplayers_bar3: false, showplayers_aura1: true, showplayers_aura2: false, playersedit_bar1: false, playersedit_bar2: false, playersedit_bar3: false, playersedit_aura1: false, playersedit_aura2: false});
                        if (token.get('id') == new_door.open_id || token.get('id') == new_door.broken_id) token.set({layer: 'walls'});
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
                    }
                    if (token.get('type') == 'path') token.set({layer: 'walls'});
                }
            });
            state['DoorMaster'].doors.push(new_door);
            commandDoorStatus({content: '!door status ' + new_door.id}, 'Your new door has been created.');
        } else {
            showDialog('Creation Error', 'You need at least one token named "Open" and one named "Closed" to create a door.', 'GM');
        }
    },

    commandUseDoor = function (msg, action = 'open/close') {
        var parms = msg.content.replace('!door ', '').split(/\s+/i);
        var char_id = (parms[1]) ? parms[1] : null;
        var die_mod = (parms[2]) ? parms[2] : null;
        var adv_dis = (parms[3]) ? parms[3] : null;

        if (_.size(msg.selected) == 1) {
            var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
            if (token) {
                var title = '', message = '', door = getDoorFromTokenID(token.get('id'));
                if (door) {
                    var show_dialog = true;
                    var chars = getCharsFromPlayerID(msg.playerid);
                    if (action == 'break' && door.condition != 'Barred' && door.condition != 'Broken') {
                        if (die_mod != null && adv_dis != null) {
                            // If skill and adv/dis have been sent, attempt to break the door down
                            var char = getObj('character', char_id);
                            var roll_result = rollDice(die_mod, adv_dis);
                            var roll_display = '<div style="' + styles.resultBox + '"><span style="' + styles.result + (roll_result.base == 1 ? 'color: red;' : (roll_result.base == 20 ? 'color: green;' : '')) + '" title="' + roll_result.formula + '">' + roll_result.final + '</span> ' + roll_result.skill + (roll_result.adv_dis == '-1' ? ' <span style="cursor: pointer;" title="Disadvantage">[Dis]</span> ' : (roll_result.adv_dis == '+1' ? ' <span style="cursor: pointer;" title="Advantage">[Adv]</span>' : '')) + '</div>';
                            var gm_display = roll_display.replace('</div>', ' vs. DC ' + door.breakDC + '</div>');

                            if (roll_result.final >= door.breakDC) {
                                title = 'Success!';
                                message = char.get('name') + ' has successfully broken the door open';

                                // Assess the damage...
                                var break_chance = randomInteger(100) + ((roll_result.final - door.breakDC) * 2);
                                if (break_chance >= 80) {
                                    door.condition = 'Broken';
                                    message += ', but has ruined it. The door will no longer close.';
                                    if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                    showDialog('', char.get('name') + ' has successfully broken through the door but destroyed it.<br>' + gm_display, 'GM');
                                } else if (break_chance >= 70 && door.condition == 'Locked') {
                                    door.condition = 'Disabled';
                                    message += ', but has damaged the ' + (typeof door.lock_id != 'undefined' ? 'locking mechanism' : 'lock') + '.';
                                    if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                    showDialog('', char.get('name') + ' has successfully broken through the door but damaged the ' + (typeof door.lock_id != 'undefined' ? 'locking mechanism' : 'lock') + '.<br>' + gm_display, 'GM');
                                } else {
                                    door.condition = 'Unlocked';
                                    message += '.';
                                    if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                    showDialog('', char.get('name') + ' has successfully broken the door open.<br>' + gm_display, 'GM');
                                }
                                if (door.condition == 'Broken') breakDoor(door);
                                else toggleDoorOpen(door);
                            } else {
                                title = 'Fail!';
                                message = char.get('name') + ' has not succeeded in breaking through the door.';
                                if (door.condition == 'Unlocked') message += ' However, you could just try opening it...';
                                if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                showDialog('', char.get('name') + ' has not succeeded in breaking through the door.<br>' + gm_display, 'GM');
                            }
                        } else if (char_id || _.size(chars) == 1) {
                            // If one (or selected) character, give action for attempt to break
                            title = '';
                            char_id = (!char_id) ? chars[0].get('id') : char_id;
                            var char = (!char_id) ? chars[0].get('id') : getObj('character', char_id);
                            message = '<div style="' + styles.buttonWrapper + '">' + char.get('name') + ': <a style="' + styles.button + '" href="!door break ' + char_id + ' ?{Select skill' + getSkills(char_id, 'STR') + '} ?{Advantage or Disadvantage|Neither,0|Advantage,+1|Disadvantage,-1}" title="' + char.get('name') + ' will attempt to break the door open.">Force Door</a></div>';
                        } else {
                            // If more than one character, make character selection
                            title = '';
                            message = '<div style="' + styles.buttonWrapper + '"><a style="' + styles.button + '" href="!door break ?{Select character';
                            _.each(chars, function (char) {
                                message += '|' + char.get('name') + ',' + char.get('id');
                            });
                            message += '}" title="Please select which character is attempting to pick the lock.">Choose Character</a></div>';
                        }
                    } else {
                        // IgnorePick Lock from a disabled yet still selected Lock token
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
                                    message = 'This door has a switch that must be used.';
                                } else if (token.get('id') == door.lock_id && action == 'pick') {
                                    message = 'This door is already unlocked and cannot be operated from here.';
                                } else {
                                    toggleDoorOpen(door);
                                    if (action == 'pick') {
                                        message = 'Um... This door was already unlocked.';
                                    } else show_dialog = false;
                                }
                                break;
                            case 'Locked':
                                title = 'Locked';
                                message = typeof door.lock_id == 'undefined' ? 'You cannot open the door without a key... or try another method.' : '... yet there is no lock visible on the door.';

                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    title = '';
                                    message = 'This door has a switch that must be used.';
                                    break;
                                }

                                if (token.get('id') == door.switch_id || token.get('id') == door.switch2_id) {
                                    message = 'The switch will not budge.';
                                    break;
                                }

                                if (action == 'pick') {
                                    if (typeof door.lock_id != 'undefined' && token.get('id') != door.lock_id) {
                                        message = 'This door has no visible lock to pick...';
                                        break;
                                    }

                                    if (die_mod != null && adv_dis != null) {
                                        // If skill and adv/dis have been sent, attempt to pick the lock
                                        var char = getObj('character', char_id);
                                        var roll_result = rollDice(die_mod, adv_dis);
                                        var roll_display = '<div style="' + styles.resultBox + '"><span style="' + styles.result + (roll_result.base == 1 ? 'color: red;' : (roll_result.base == 20 ? 'color: green;' : '')) + '" title="' + roll_result.formula + '">' + roll_result.final + '</span> ' + roll_result.skill + ' ' + (roll_result.adv_dis == '-1' ? '<span style="cursor: pointer;" title="Disadvantage">[Dis]</span>' : (roll_result.adv_dis == '+1' ? '<span style="cursor: pointer;" title="Advantage">[Adv]</span>' : '')) + '</div>';
                                        var gm_display = roll_display.replace('</div>', 'vs. DC ' + door.breakDC + '</div>');

                                        if (roll_result.final >= door.lockDC) {
                                            title = 'Success!';
                                            message = char.get('name') + ' has successfully picked the lock...';
                                            if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                            door.condition = 'Unlocked';
                                            showDialog('', char.get('name') + ' has successfully picked the lock.<br>' + gm_display, 'GM');
                                        } else if (roll_result.base == 1 && state['DoorMaster'].allowFumbles) {
                                            title = 'Fumble!';
                                            message =  char.get('name') + ' has broken the lock. No more attempts to pick it will succeed.';
                                            if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                            door.condition = 'Disabled';
                                            showDialog('', char.get('name') + ' has fumbled while picking the lock.<br>' + gm_display, 'GM');
                                        } else {
                                            title = 'Fail!';
                                            message =  char.get('name') + ' has not succeeded in picking this lock.';
                                            if (state['DoorMaster'].showPlayersRolls) message += '<br>' + roll_display;
                                            showDialog('', char.get('name') + ' has not succeeded in picking the lock.<br>' + gm_display, 'GM');
                                        }
                                    } else if (char_id != null || _.size(chars) == 1) {
                                        // If one (or selected) character, give action for attempt to pick
                                        char_id = (!char_id) ? chars[0].get('id') : char_id;
                                        var char = (!char_id) ? chars[0] : getObj('character', char_id);
                                        title = '';
                                        message = '<div style="' + styles.buttonWrapper + '">' + char.get('name') + ': <a style="' + styles.button + '" href="!door pick ' + char_id + ' ?{Select skill' + getSkills(char_id, 'DEX') + '} ?{Advantage or Disadvantage|Neither,0|Advantage,+1|Disadvantage,-1}" title="' + char.get('name') + ' will attempt to pick the lock.">Pick Lock</a></div>';
                                    } else {
                                        // If more than one character, make character selection
                                        title = '';
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
                                    title = '';
                                    message = 'This door has a switch that must be used.';
                                    break;
                                }

                                if (door.open) {
                                    toggleDoorOpen(door);
                                    show_dialog = false;
                                } else {
                                    title = 'Lock Disabled';
                                    message = 'This door\'s lock has been broken and cannot be picked, nor will a key work.';
                                    if (action == 'pick') message = 'This door\'s lock has been broken and cannot be picked.' + (typeof door.lock_id != 'undefined' ? ' Plus, there is no lock visible on this door.' : ' Your attempt to pick it is futile.');
                                    if (token.get('id') == door.switch_id || token.get('id') == door.switch2_id) {
                                        message = 'The switch will not budge.';
                                    }
                                }
                                break;
                            case 'Barred':
                                title = 'Barred';
                                message = 'This door seems to be barred or blocked from the other side.';
                                if (action == 'pick') message += (typeof door.lock_id != 'undefined' ? ' Plus, there is no lock visible on this door.' : ' Your attempt to pick it is ineffectual.');
                                if (action == 'break') message += ' You cannot hope to break through.';
                                if (token.get('id') == door.switch_id || token.get('id') == door.switch2_id) {
                                    message = 'The switch begins to move but cannot.';
                                }
                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    title = '';
                                    message = 'This door has a switch that must be used.';
                                }
                                break;
                            case 'Stuck':
                                title = 'Stuck';
                                message = 'This door is stuck shut and will not open easily.';
                                if (action == 'pick') message += (typeof door.lock_id != 'undefined' ? ' Plus, there is no lock visible on this door.' : ' Your attempt to pick it is inconceivable.');
                                if (token.get('id') == door.switch_id || token.get('id') == door.switch2_id) {
                                    message = 'The switch begins to move but cannot.';
                                }
                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    title = '';
                                    message = 'This door has a switch that must be used.';
                                }
                                break;
                            case 'Broken':
                                title = 'Broken';
                                message = 'This door is broken and cannot be opened or closed.';
                                if (action == 'pick') message += (typeof door.lock_id != 'undefined' ? ' Plus, there is no lock visible on this door.' : ' Your attempt to pick it is absurd.');
                                if (action == 'break') message = 'Why are you attacking a broken door?';
                                if (typeof door.switch_id != 'undefined' && token.get('id') != door.switch_id && token.get('id') != door.switch2_id && action == 'open/close') {
                                    message = 'Why are you playing with the switch?';
                                }
                        }
                    }

                    if (show_dialog) showDialog(title, message, msg.who);

                } else showDialog('Door Use Error', 'Invalid door ID.', msg.who);
            } else showDialog('Door Use Error', 'Invalid token.', msg.who);
        } else {
            showDialog('Door Use Error', 'You must select a door or switch token.', msg.who);
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
    commandDestroyDoor = function (msg) {
        var door, parms = msg.content.split(/\s+/i);
        if (parms[2] && parms[2] != '') {
            door = _.find(state['DoorMaster'].doors, function (x) { return x.id == parms[2]; });
        } else if (_.size(msg.selected) == 1) {
            var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
            if (token) {
                var token_id = token.get('id');
                door = getDoorFromTokenID(token_id);
            } else showDialog('Destruction Error', 'Invalid token.', 'GM');
        } else showDialog('Destruction Error', 'You must select a token associated with a door.', 'GM');

        if (door) {
            // Backward compatability for door switches
            if (!door.switch_hidden || typeof door.switch_hidden == 'boolean') door.switch_hidden = {original: door.switch_hidden, current: door.switch_hidden};

            var closed_token = getObj('graphic', door.closed_id);
            if (closed_token) closed_token.set({layer: 'objects', name: 'Closed', represents: '', aura1_radius: '', aura2_radius: '', bar1_value: (door.has_key ? 'Keyed' : door.condition), bar1_max: (door.visibility != 'Visible' ? door.visibility : ''), bar2_value: door.lockDC, bar2_max: door.breakDC, bar3_value: (door.lock_passphrase ? door.lock_passphrase : ''), bar3_max: ''});
            var open_token = getObj('graphic', door.open_id);
            if (open_token) open_token.set({layer: 'objects', name: 'Open', represents: '', aura1_radius: '', aura2_radius: ''});
            var switch_token = getObj('graphic', door.switch_id);
            if (switch_token) switch_token.set({layer: 'objects', name: 'Switch', represents: '', bar1_value: (door.switch_hidden['original'] ? 'Hidden' : ''), aura1_radius: '', aura2_radius: ''});
            var switch2_token = getObj('graphic', door.switch2_id);
            if (switch2_token) switch2_token.set({layer: 'objects', name: 'Switch2', represents: '', bar1_value: '', aura1_radius: '', aura2_radius: ''});
            var broken_token = getObj('graphic', door.broken_id);
            if (broken_token) broken_token.set({layer: 'objects', name: 'Broken'});
            var lock_token = getObj('graphic', door.lock_id);
            if (lock_token) lock_token.set({name: 'Lock', represents: '', bar1_value: (door.lock_hidden['original'] ? 'Hidden' : ''), aura1_radius: '', aura2_radius: ''});
            _.each(door.paths, function (path_id) {
                var path = getObj('path', path_id);
                if (path) path.set({layer: 'objects'});
            });

            state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.open_id; });
            state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.closed_id; });
            if (typeof door.switch_id != 'undefined') state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.switch_id; });
            if (typeof door.switch2_id != 'undefined') state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.switch2_id; });
            if (typeof door.broken_id != 'undefined') state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.broken_id; });
            if (typeof door.lock_id != 'undefined') state['DoorMaster'].lockedTokens = _.reject(state['DoorMaster'].lockedTokens, function (x) { return x == door.lock_id; });

            state['DoorMaster'].doors = _.reject(state['DoorMaster'].doors, function (x) { return x.id == door.id; });
            showDialog('Destruction Complete', 'The door tokens have all been unlocked and all pieces returned to the token layer.', 'GM');
        } else showDialog('Destruction Error', (_.size(msg.selected) != 1 ? 'Too many tokens selected.' : 'Invalid door ID.'), 'GM');
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
        if (typeof door.lock_id == 'undefined') {
            var open_token = getObj('graphic', door.open_id);
            var closed_token = getObj('graphic', door.closed_id);
            if (reset) {
                open_token.set({represents: door.key_char_id});
                if (door.hidden) open_token.set(hidden_aura_settings);
                closed_token.set({represents: door.key_char_id});
                if (door.hidden) closed_token.set(hidden_aura_settings);
            } else {
                open_token.set({represents: door.key_char_id});
                closed_token.set({represents: door.key_char_id});
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
                var door = getDoorFromTokenID(token.get('id'));
                if (door) {
                    // Ignore input from a disabled yet still selected Lock token
                    if (typeof door.lock_id != 'undefined' && token.get('id') == door.lock_id && token.get('represents') == '') {
                        showDialog('', 'This lock no longer functions.', msg.who);
                        return;
                    }

                    if (passphrase == door.lock_passphrase) {
                        switch (door.condition) {
                            case 'Locked':
                                door.condition = 'Unlocked';
                                if (door.key_reset) {
                                    if (typeof door.lock_id == 'undefined') enableKey(door, true);
                                    else enableLock(door, true);
                                }
                                showDialog('Key Used', 'Success! The door is now unlocked.', msg.who);
                                break;
                            case 'Unlocked':
                                if (door.open) toggleDoorOpen(door);
                                door.condition = 'Locked';
                                showDialog('Key Used', 'This door is now locked.', msg.who);
                                break;
                            default:
                                showDialog('Key Used', 'Using a key on this door makes no sense right now.', msg.who);
                        }
                    } else {
                        var message = 'Passphrase "' + passphrase + '" is incorrect. The door remains ' + (door.condition == 'Locked' ? 'locked' : 'unlocked') + '.';
                        if (door.condition != 'Locked' && door.condition != 'Unlocked') message = 'Using a key on this door makes no sense right now.';
                        showDialog('Key Used', message, msg.who);
                    }
                } else showDialog('Key Use Error', 'Invalid door ID.', msg.who);
            } else showDialog('Key Use Error', 'Invalid token.', msg.who);
        } else {
            showDialog('Key Use Error', 'You must select a door or lock token.', msg.who);
        }
    },

    commandDoorStatus = function (msg, alert = '') {
        var door, message = '', parms = msg.content.split(/\s+/i);
        if (parms[2] && parms[2] != '') {
            door = _.find(state['DoorMaster'].doors, function (x) { return x.id == parms[2]; });
        } else if (_.size(msg.selected) == 1) {
            var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
            if (token) {
                var token_id = token.get('id');
                door = getDoorFromTokenID(token_id);
            } else showDialog('Door Status Error', 'Invalid token.', 'GM');
        } else showDialog('Door Status Error', 'You must select a door or switch token.', 'GM');

        if (door) {
            var actions = parms[3] ? parms[3].split('|') : [];
            if (actions[0] == '--token-lock') {
                state['DoorMaster'].lockedTokens.push(door.open_id);
                state['DoorMaster'].lockedTokens.push(door.closed_id);
                if (typeof door.switch_id != 'undefined') state['DoorMaster'].lockedTokens.push(door.switch_id);
                if (typeof door.switch2_id != 'undefined') state['DoorMaster'].lockedTokens.push(door.switch2_id);
                if (typeof door.broken_id != 'undefined') state['DoorMaster'].lockedTokens.push(door.broken_id);
                if (typeof door.lock_id != 'undefined') state['DoorMaster'].lockedTokens.push(door.lock_id);
                door.tokens_locked = true;
                alert = 'All door tokens have been locked.';
            }
            if (actions[0] == '--set-cond' && actions[1] && _.find(DOOR_CONDITIONS, function (x) { return x == actions[1]; })) {
                if (door.open && actions[1] != 'Unlocked' && actions[1] != 'Disabled') toggleDoorOpen(door);
                door.condition = actions[1];
                alert = 'Condition has been updated.';
            }
            if (actions[0] == '--reveal-door') {
                revealDoor(door);
                alert = 'Door has been revealed.';
            }
            if (actions[0] == '--reveal-switch') {
                revealSwitch(door);
                alert = 'Switch has been revealed.';
            }
            if (actions[0] == '--keyhole') {
                enableKey(door);
                alert = 'Key has been enabled.';
            }
            if (actions[0] == '--show-lock') {
                enableLock(door);
                alert = 'Lock has been enabled.';
            }
            if (actions[0] == '--passphrase') {
                var passphrase = msg.content.split(/\s*\|\s*/i);
                if (passphrase[1] && passphrase[1].trim() != '') {
                    door.lock_passphrase = passphrase[1].trim();
                    alert = 'Passphrase has been updated.';
                } else {
                    alert = '⚠️ Passphrase was blank! Not changed.';
                }
            }
            if (actions[0] == '--toggle-aon') {
                door.all_or_nothing = !door.all_or_nothing;
                alert = 'All-or-nothing has been updated.';
            }
            if (actions[0] == '--toggle-key-reset') {
                door.key_reset = !door.key_reset;
                alert = 'Key reset has been updated.';
            }
            if (actions[0] == '--lock-dc' && actions[1] && actions[1] != '' && isNum(actions[1])) {
                door.lockDC = parseInt(actions[1]);
                alert = 'Lock DC has been updated.';
            }
            if (actions[0] == '--break-dc' && actions[1] && actions[1] != '' && isNum(actions[1])) {
                door.breakDC = parseInt(actions[1]);
                alert = 'Break DC has been updated.';
            }

            if (alert != '') {
                message += '<p style=\'' + styles.msg + '\'>' + alert + '</p>';
            }

            message += '<p>';
            message += '<b>Condition:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --set-cond|?{Set Condition|Unlocked|Locked|Barred|Stuck|Disabled}" title="Change condition">' + door.condition + '</a><br>';
            message += '<b>Visibility:</b> ' + (door.hidden ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --reveal-door" title="Reveal door to players">' + door.visibility + '</a>' : door.visibility) + '<br>';
            message += '<b>Lock DC:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --lock-dc|?{Lock DC|' + door.lockDC + '}" title="Change lock DC">' + door.lockDC + '</a><br>';
            message += '<b>Break DC:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --break-dc|?{Break DC|' + door.breakDC + '}" title="Change break DC">' + door.breakDC + '</a><br>';

            if (door.has_key) {
                message += '<hr style="margin: 4px 12px;">';
                if (typeof door.lock_id != 'undefined') {
                    message += '<b>External Lock:</b> ' + (door.lock_hidden['current'] ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --show-lock" title="Allow players to use lock">Enable Lock</a>' : 'Lock enabled') + '<br>';
                } else {
                    message += '<b>Keyed Door:</b> ' + (door.key_char_id == state['DoorMaster'].doorCharID ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --keyhole" title="Allow players to use key">Enable key</a>' : 'Key enabled') + '<br>';
                }
                message += '<b>Key Reset:</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --toggle-key-reset" title="Turn key reset ' + (door.key_reset ? 'OFF' : 'ON') + '">' + (door.key_reset ? 'ON' : 'OFF') + '</a><br>';
                message += '<b>Passphrase:</b> <i>' + door.lock_passphrase + '</i> <a style=\'' + styles.textButton + 'text-decoration: none;\' href="!door status ' + door.id + ' --passphrase|?{Passphrase|' + door.lock_passphrase + '}" title="Change lock passphrase">&Delta;</a><br>';
                message += '<hr style="margin: 4px 12px;">';
            }

            message += '<b>Switch:</b> ' + (typeof door.switch_id == 'undefined' ? 'None' : (door.switch_hidden['current'] ? '<a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --reveal-switch" title="Reveal switch to players">Hidden</a>' : 'Visible')) + '<br>';

            message += '<b>"Broken" graphic?</b> ' + (typeof door.broken_id == 'undefined' ? 'no' : 'yes') + '<br>';
            message += '<b>Tokens locked?</b> ' + (door.tokens_locked ? 'Yes' : '<span style="color: #C91010;">No</span> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --token-lock" title="Lock all associated tokens">lock</a>') + '</p>';

            message += '<p><b>Linked Doors:</b> ' + (typeof door.linked != 'undefined' ? _.size(door.linked) : 'none') + ' <a style=\'' + styles.textButton + '\' href="!door link ' + door.id + '" title="Link selected door(s)">link</a><br>';
            if (typeof door.linked != 'undefined') message += '<b>All-or-nothing?</b> <a style=\'' + styles.textButton + '\' href="!door status ' + door.id + ' --toggle-aon" title="Turn all-or-nothing ' + (door.all_or_nothing ? 'OFF' : 'ON') + '">' + (door.all_or_nothing ? 'ON' : 'OFF') + '</a>';

            message += '</p>';
            showDialog((door.open ? 'Open Door' : 'Closed Door'), message, 'GM');
        } else showDialog('Door Status Error', 'Invalid door ID.', 'GM');
    },

    getDoorFromTokenID = function (token_id) {
        var door = _.find(state['DoorMaster'].doors, function (x) { return x.closed_id == token_id; });
        if (!door) door = _.find(state['DoorMaster'].doors, function (x) { return x.open_id == token_id; });
        if (!door) door = _.find(state['DoorMaster'].doors, function (x) { return x.switch_id == token_id; });
        if (!door) door = _.find(state['DoorMaster'].doors, function (x) { return x.switch2_id == token_id; });
        if (!door) door = _.find(state['DoorMaster'].doors, function (x) { return x.broken_id == token_id; });
        if (!door) door = _.find(state['DoorMaster'].doors, function (x) { return x.lock_id == token_id; });
        return door;
    },

    // Get all player controlled characters that are not "utility characters"
    getCharsFromPlayerID = function (player_id) {
        var chars = findObjs({type: 'character', archived: false});
        chars = _.filter(chars, function (char) {
            var controllers = char.get('controlledby').split(',');
            var level = getAttrByName(char.get('id'), 'level', 'current') || '0';
            return (_.find(controllers, function (x) { return x == player_id; }) && parseInt(level) > 0);
        });
        return chars;
    },

    getSkills = function (char_id, attribute = 'DEX') {
        var retSkills = '', skills = [];
        // Give the base attribute mod, just in case
        if (attribute == 'DEX') {
            var dex_mod = getAttrByName(char_id, 'dexterity_mod_with_sign', 'current') || '0';
            skills.push({name: 'Dexterity', mod: dex_mod});
        } else {
            var str_mod = getAttrByName(char_id, 'strength_mod_with_sign', 'current') || '0';
            skills.push({name: 'Strength', mod: str_mod});
        }

        var charAttrs = findObjs({type: 'attribute', characterid: char_id}, {caseInsensitive: true});
        var skillsForIDs = _.filter(charAttrs, function (attr) { return (attr.get('name').match(/^repeating_skill_(.+)_ability$/) !== null && attr.get('current') == attribute); });
        _.each(skillsForIDs, function (skill) {
            var skill_id = skill.get('name').replace(/^repeating_skill_([^_]+)_ability$/, '$1');
            var tmp_name = getAttrByName(char_id, 'repeating_skill_' + skill_id + '_name', 'current');
            // Filter out known irrelevant skills
            if ((tmp_name != 'Acrobatics' && tmp_name != 'Stealth' && attribute == 'DEX') || attribute == 'STR') {
                var tmp_mod = getAttrByName(char_id, 'repeating_skill_' + skill_id + '_total_with_sign', 'current') || '0';
                skills.push({name: tmp_name, mod: tmp_mod});
            }
        });

        // Return string for query
        _.each(skills, function (skill) { retSkills += '|' + skill.name + ',' + skill.mod + '::' + skill.name.replace(/\s/g, '~'); });
        return retSkills;
    },

    // Create Door Characters
    createDoorChars = function (msg) {
        if (!doorCharExists()) {
            var char = createObj("character", {name: 'DoorMaster', controlledby: 'all'});
            var char_id = char.get('id');
            char.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Use', characterid: char_id, action: '!door use', istokenaction: true });
            createObj("ability", { name: 'Pick', characterid: char_id, action: '!door pick', istokenaction: true });
            createObj("ability", { name: 'Break', characterid: char_id, action: '!door break', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: char_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].doorCharID = char_id;
        }

        if (!doorKeyedCharExists()) {
            var kchar = createObj("character", {name: 'DoorMaster Keyed', controlledby: 'all'});
            var kchar_id = kchar.get('id');
            kchar.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Use', characterid: kchar_id, action: '!door use', istokenaction: true });
            createObj("ability", { name: 'Key', characterid: kchar_id, action: '!door key ?{Enter Passphrase|}', istokenaction: true });
            createObj("ability", { name: 'Pick', characterid: kchar_id, action: '!door pick', istokenaction: true });
            createObj("ability", { name: 'Break', characterid: kchar_id, action: '!door break', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: kchar_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].doorKeyedCharID = kchar_id;
        }

        if (!switchCharExists()) {
            var schar = createObj("character", {name: 'DoorMaster Switch', controlledby: 'all'});
            var schar_id = schar.get('id');
            schar.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Use', characterid: schar_id, action: '!door use', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: schar_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].doorKeyedCharID = kchar_id;
        }

        if (!lockCharExists()) {
            var lchar = createObj("character", {name: 'DoorMaster Lock', controlledby: 'all'});
            var lchar_id = lchar.get('id');
            lchar.set({bio: '<p>This character is used by the <b>DoorMaster</b> script. <i>Do not</i> delete this character or it will break the script.'});

            createObj("ability", { name: 'Key', characterid: lchar_id, action: '!door key ?{Enter Passphrase|}', istokenaction: true });
            createObj("ability", { name: 'Pick', characterid: char_id, action: '!door pick', istokenaction: true });
            createObj("ability", { name: 'Help', characterid: lchar_id, action: '!door help', istokenaction: true });

            state['DoorMaster'].doorKeyedCharID = kchar_id;
        }
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

    rollDice = function (skill_mod, adv_dis = '0') {
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
        end_result.formula = (end_result.adv_dis != '0' ? '2' : '1') + 'd20' + ((end_result.adv_dis == '+1') ? 'kh1' : (end_result.adv_dis == '-1' ? 'kl1' : ''))
            + ' ' + mod + '[' + end_result.skill.toLowerCase() + '] = (' + (end_result.adv_dis != '0' ? end_result.roll1 + '+' +  end_result.roll2 : end_result.base) + ')'
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

    detectSheet = function () {
        var sheet = 'Unknown', char = findObjs({type: 'character'})[0];
        if (char) {
            var charAttrs = findObjs({type: 'attribute', characterid: char.get('id')}, {caseInsensitive: true});
            if (_.find(charAttrs, function (x) { return x.get('name') == 'character_sheet' && x.get('current').search('Shaped') != -1; })) sheet = '5e Shaped';
            if (_.find(charAttrs, function (x) { return x.get('name').search('mancer') != -1; })) sheet = '5th Edition OGL';
        }
        return sheet;
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

    handleMove = function(obj, prev) {
        // Enforces locks on tokens
        if (_.find(state['DoorMaster'].lockedTokens, function (x) { return x == obj.get('id'); })) {
            obj.set({left: prev.left, top: prev.top, rotation: prev.rotation});
        }
    },

    registerEventHandlers = function () {
		on('chat:message', handleInput);
        on('change:graphic', handleMove);
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
