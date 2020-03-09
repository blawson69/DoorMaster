# DoorMaster

This [Roll20](http://roll20.net/) script provides a robust system of door creation and management. It allows players to interact with doors, attempt to pick locks, or try to break through doors. GMs can create hidden doors that can be revealed to players at any time, provide any number of paths to serve as Dynamic Lighting lines, include switches for alternative door control, and add a token to visually illustrate a broken door. You have the option to lock all related tokens to prevent them from accidentally being moved.

DoorMaster is for use with the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped) and the D&D 5th Edition OGL Sheet.

## Table of Contents
- [Door Creation](#door-creation)
- [Door States](#door-states)
- [Door Visibility](#door-visibility)
- [Switches](#switches)
- [Keyed Doors](#keyed-doors)
  - [Lock Tokens](#lock-tokens)
- [Linked Doors](#linked-doors)
- [Trapped Doors](#trapped-doors)
  - [Triggers](#triggers)
  - [Disable DC](#disable-dc)
  - [Trap Effect](#trap-effect)
- [Skill Checks](#skill-checks)
  - [Tools](#tools)
- [Dials](#dials)
- [Tiles](#tiles)
- [DoorMaster Characters](#doormaster-characters)
- [Door Status](#door-status)
- [Configuration](#configuration)
- [Destroying Doors](#destroying-doors)

---
## Door Creation

There are a minimum of two tokens needed to create a door: A token named "Closed" representing the door in its closed State, and one named "Open" for when it is open. The Closed token will contain the startup information for the door. Aside from the name, you will set the [State](#door-states) of the door and its [Visibility](#door-visibility). You can also provide the "Lock DC" for when a player attempts to pick the lock. If none is provided, it will default to 12. The "Break DC" is used when a character attempts to open the door by force. If none is provided, it will default to 30 for Barred doors and 15 for all others. If making a Keyed door ([see below](#keyed-doors)), the Passphrase will be provided here.

Below is the information to provide and the field placement for each:

|  | Current | Max |
| ---- |:----:|:----:|
| Bar 1 | State | Visibility |
| Bar 2 | Lock DC | Break DC |
| Bar 3 | [Passphrase](#keyed-doors) |  |

If you wish to use a switch, lever, or other off-the-door method of opening and closing the door, provide a token named "Switch" ([see below](#switches)).

You can use an optional token named "Broken" to depict the door in a broken, unusable State. If an attempt to break a door down results in the Broken State, this token will replace the Open or Closed tokens and the door will no longer be available for player interaction.

Paths for Dynamic Lighting are optional. You can use no paths at all for trapdoors, or provide more than one path for things like prison bars. These will all act as Dynamic Lighting lines in the Closed State, and will be disabled in the Open State.

When you have all of the elements for your door, you select all of them and send the `!door create` command in chat. This assembles your door and closes it. A status window for the door will appear, where you can update or modify most of the door's settings. It will also allow you to lock all related tokens to prevent accidental movement or [link other doors](#linked-doors). You can return to this [Status window](#door-status) at any time.

**Note:** The creation process replaces token names with the ID of the associated door. *Do not* rename tokens after your door is created or your door *will not* function.

## Door States

Each door will have one of the following States. Typically, you will only use the first six when [creating a door](#door-creation). The last two are set by DoorMaster when certain conditions are met:
- **Unlocked** - Players can open and close the door effortlessly.
- **Locked** - The door has a lock that either needs a key or can be picked open.
- **[Keyed](#keyed-doors)** - The door has a lock with which the player can interact. This status is **only** used to tell DoorMaster that the door is Keyed, and will be converted to the Locked State during door creation.
- **Barred** - This door is barred _on the player's side_. Clicking the [Use button](#doormaster-characters) will lift/remove the bar, setting the door to the Unlocked State.
- **Obstructed** - This door is obstructed by a bar or other immovable objects _from the opposite side_. It cannot be picked or busted through. If the obstruction is a bar, the GM will need to change the State to Barred if players encounter the door from the other side.
- **Stuck** -  This door is not locked, but won't open without being forced.
- **Disabled** - A disabled door has had its lock damaged. It cannot be unlocked with a key or by picking it.
- **Broken** - A broken door has been damaged to the point it is unusable. These doors are always open and cannot be closed by any means. You *cannot* set this State during door creation.

You can change the door's State at any time in the [Status window](#door-status) with any one of the door's tokens selected. Note that setting an open door to a Locked, Barred, or Stuck State will close that door as well.

## Door Visibility

Visible doors will be assigned the DoorMaster character (see below) and ([optionally](#configuration)) be given an aura to indicate a door with which the players can interact. If you want to create a Secret or Concealed door, you *must* indicate this during [door creation](#door-creation). Place either "Secret" or "Concealed" in the Bar 1 max field of the Closed token ([see above](#door-creation)).

Even Unlocked doors that are Secret or Concealed will be undetectable by players, assuming the graphics you use blend into the map. They will not receive a player-visible aura and will not be assigned the DoorMaster character. They *will* receive a gm-only aura to show it as a hidden door. The [Status window](#door-status) will provide a link to reveal a hidden door, but a visible door cannot be made Secret or Concealed.

## Switches

Switches are optional tokens that enable operation of the door from a remote location, be it across the room or down a hallway. Select a graphic you wish to use for the switch and name it "Switch". If you want to hide your Switch until a later time - it is concealed or otherwise hidden - put "Hidden" in the first Bar 1 field of the Switch token. The [Status window](#door-status) will provide a link for revealing the Switch.

If you want to have an "on/off" effect for your Switch, provide a second token named "Switch2". When the switch is used on an Unlocked door, DoorMaster will toggle between the two switch tokens.

## Keyed Doors

Doors can have "keys" to unlock them. These are passphrases - passwords or sentences - that you provide. To create such a door, use "Keyed" as the door [State](#door-states) during [door creation](#door-creation) and enter the passphrase you wish to use in the first Bar 3 box. Upon creation, the door will be Locked and you will have the following additional functionality in the [Status window](#door-status):
- The ability to manually enable the use of a "Key" token action button. This button lets players enter a passphrase in an attempt to unlock the door. Until enabled, the door will only have the usual [token action buttons](#doormaster-characters) available. If a [Lock token](#lock-tokens) is being used, the "Key" button will appear there instead.
- The passphrase will be displayed, which you can change at any time.
- You can choose to remove the "Key" token action whenever the door is unlocked with the proper passphrase. By default this "Key Reset" function is OFF, allowing players to *lock* the door with the passphrase as well.

Passphrases are case-sensitive and should be alphanumeric. You may use punctuation and spaces, but avoid characters used in URLs (colons, forward slashes, etc.). Passphrases do not have to be unique, but remember that entering a non-unique passphrase on one door will _not_ unlock other doors with the same passphrase.

### Lock Tokens

If you have a [Keyed Door](#keyed-doors) and wish to provide key input separate from the door itself, you can provide a token named "Lock". This especially handy when creating doors that are locked by magical means - puzzles, etc. - that can reveal the passcode after the puzzle or test is completed correctly. This Lock token will be the token with which players must interact when using a key or attempting to pick the lock.

If you want to hide your Lock until a later time - it is concealed or otherwise hidden - put "Hidden" in the first Bar 1 field of the Lock token. The [Status window](#door-status) will provide a link for revealing the Lock.

## Linked Doors

You can create a link to one or more other doors via the [Status window](#door-status). This makes the door referenced by the Status window the "master" door and all linked doors are "secondary" doors. When the master door is opened, the secondary doors are opened (as long as they are Unlocked). This is a one-way link, so opening a secondary door does not affect the master. Two-way connections can be made simply by linking the secondary door back to the master.

Linking doors in this way provides for any number of effects:
- Allow one switch to *control multiple doors.* Create switches for every door in the group, then hide all but the master switch behind Dynamic Lighting lines.
- Create a lever that *changes walls in a labyrinth.* This is almost the same as the above, but all secondary doors are all Secret, Unlocked doors that act as walls and dividers in the labyrinth. Only the master door needs a switch.
- *Create a puzzle* where players must make all the doors in the group opened or closed. Secondary doors are linked to the master and other secondary doors in such a way that only by using the doors in the correct sequence will have them all closed or open at once.
- Make doors with *multiple switches.* Create two switched doors, and either hide the secondary door's tokens behind Dynamic Lighting lines or use transparent graphics to leave only the switch token accessible.
- Make doors operated by other doors or switches *on another page.* Generate the status window for the master door, then jump to another page and link the door you want.

Once you have linked doors, there is an "all-or-nothing" toggle. Setting this to "ON" will require all of the doors to be Unlocked before any of them will open. If set to "OFF", all Unlocked doors in the group will be opened/closed and the rest will be ignored. Broken doors are the exception for the toggle and will allow operation when all-or-nothing is ON. If there are any non-Unlocked secondary doors, the GM will be notified.

The master door *must* be Unlocked to operate any secondary doors. If it is not, players will receive the standard feedback based on the master door's [State](#door-states).

## Trapped Doors

You can create a door that is trapped by adding data to the "Open" door token before [door creation](#door-creation). Every trap has a trigger, a Disable DC, and a trap effect. This information goes into the Open token's first Bar 1, Bar 2, and GM Notes fields, respectively, and are highlighted below.

|  | Current | Max |
| ---- |:----:|:----:|
| Bar 1 | Trigger |  |
| Bar 2 | Disable DC |  |

| GM Notes |
| ---- |
| Trigger Effect |

Most traps must be manually reset once they have been triggered, while others do not need to be reset or have a mechanism that automatically resets the trap. Once your trapped door is created, you will be able to tell DoorMaster from the [Status window](#door-status) whether the trap should be automatically reset after it gets triggered. The default is Off. You can also reset the trap manually in the Status window.

Some traps may render a door unusable once triggered, either because of damage to the door or other factors. From the Status window, you can set whether triggering the effect will "break" the door. The default is Off. Note that if auto reset is on, this function will be disabled.

You can also provide an optional token named "Trap" to give a graphic representation of the trap after the effect has been triggered. This may be a blade, spike pit, soot from an explosion, a blast of fire, etc. If the trap auto reset option (above) is on, this token will be shown for about 1.5 seconds and then disappear.

Detecting traps is out of the scope of this script and the GM will follow the same procedures as always for trap detection. Once a character has successfully detected a trap on the door, however, a "Disable" token action button can be made available through the Status window. This will allow a character to attempt to disable the trap in the same manner as picking a lock. If the attempt is successful, the trap is disabled and the button will go away.

### Triggers

A trigger is an action the player takes on the door that sets off the trap's effect. A trap may have more than one trigger depending on the kind of trap. Below are the possible triggers and how they work:
- **Open** - Any time a door is opened. A door must be closed and [Unlocked](#door-states) before this trigger will fire, or be forced open using the [Break button](#doormaster-characters).
- **Touch** - Any time a door is touched. This trigger is set off by **any** use of the Use, Pick, Break, _or Disable_ buttons and applies to all door States except Broken. If not using a [Lock token](#lock-tokens), using the Key button on the door will also trigger the trap.

  Note: This trigger supersedes **all** interactions. It is highly recommended to keep the trap reset function off (see above) when using this trigger.
- **Pick** - Whenever is door's lock is picked, _whether or not_ the attempt is successful. Lockpicking traps only trigger when the actual attempt is made, so players will go through the entire [decision process](#doormaster-characters) until the Pick Lock button is executed for the selected character.
- **Fail-Pick** - When an attempt to pick a lock fails. Successful attempts will not trip this trigger.
- **Unlock** - When a door is unlocked, either by successfully picking the lock or by using _any other means_.
- **Wrong-Code** - When using a [Key](#keyed-doors) and the wrong passcode is given.
- **Misdial** - When a single [Dial](#dials) is incorrectly rotated. This _will not_ trigger if other Dials remain in an incorrect rotation.
- **All-Misdial** - When any Dial is incorrectly rotated. If multiple Dials are in use and the trap reset function is on, the trap will trigger until _every_ Dial is rotated to the correct position.
- **Misplace** - When a single [Tile](#tiles) is incorrectly positioned. This _will not_ trigger if other Tiles remain incorrectly positioned.
- **All-Misplace** - When any Tile is incorrectly positioned. If multiple Tiles are in use and the trap reset function is on, the trap will trigger until _every_ Tile is positioned correctly.
- **Decoy** - When a Decoy is positioned where a true Tile belongs.

You _must_ provide at least one trigger in order to set a door as being trapped. If the Open token's first Bar 1 field is empty or does not match one of the above triggers, the door will not be trapped.

### Disable DC

The Disable DC is used when a character attempts to disable the trap. If no DC is given, it will default to 15.

### Trap Effect

The trap effect is provided in the Open token's GM Notes field. You can give as much information as you wish here, depending on your trap and what should happen once it's triggered: darts flying out of the wall, a blade slicing out, ceiling drops, etc. An alternative option is to use a [roll template](https://roll20.zendesk.com/hc/en-us/articles/360037257334-How-to-Make-Roll-Templates). This allows you to provide a melee or magical attack dialog with rolled damage, saving throw links/buttons and any other information you like that matches a familiar format.

If you wish to use the name of the character who triggered the trap in your effect description - places where you would use `@{selected|character_name}` or `@{target|character_name}` in a roll template, for instance - use `[WHO]` as a name placeholder and DoorMaster will substitute it with the name of the character. If the script cannot determine which character is using the door, they will simply be called "Victim".

If not using a roll template, you can still provide die roll expressions that will be executed whenever the trap is triggered. In your effect description, surround your die expression in @ signs, i.e. `@1d8+2@`. You may use as many die expressions as you want and each will be evaluated separately. You **should not** use @ signs for any other purpose or it will give unintended results.

## Skill Checks

When a character [attempts](#doormaster-characters) to pick a lock, break down a door, or disable a trap, they will be provided a number of options. These are designed to accommodate the greatest number of game rules and the GM will need to announce which one(s) the players can use. The options provided are:
1. Two sets of [tools](#tools) are relevant to these tasks: Thieves' Tools and the Portable Ram. As they are most the specific and the most likely "GM approved" option, one of these tools sits at the top of the list.
2. The skill closest to relevant use for the task will be provided. For Dexterity-based tasks, this skill is Sleight of Hand skill. Strength-based tasks use Athletics. If the character is proficient in the skill, that bonus is included in the attempt.
3. The base attribute bonus corresponding to the skill is the final option. Lock picking and trap disabling are Dexterity-based, and door breaking is Strength-based.

### Tools

In order to use Thieves' Tools or the Portable Ram, you must add them to the character sheet in a way that is not simply sitting in inventory. This process differs depending on the sheet you are using for your game.

For the Shaped sheet, you will add these tools as custom Skills, choosing the attribute on which they are based: Dexterity for thieves' tools and Strength for portable ram. Indicate whether or not the character has proficiency with the tool. Setting this skill to be automatically at advantage is not detected by the script, so players will still be asked in the dialog. Note that the script will _add the +4 bonus for the ram for you_, since the sheet does not allow modifiers to skills.

For the OGL sheet, the thieves' tools and portable ram are added to the Tool Proficiencies & Custom Skills section. Select the corresponding attribute, and for the portable ram you can add the +4 modifier. There is no way to turn off proficiency for a tool, so if you allow use of non-proficient tools you can change the modifier to compensate. Regardless of the mod you add, the script will attribute 4 points out of the total roll modifier to the ram when it breaks down the numbers for roll results. For example: If the character's strength bonus is 2, this gives a total of 4 including the proficiency bonus. You can set the mod for the ram to 2 instead of 4 in order to compensate for non-proficiency. DoorMaster will give the roll result as `2[str] + 4[portable ram]`. Note that the thieves' tools do not imply a bonus, but you can still use the modifier to compensate for proficiency.

## Dials

Dials are one or more rotating tokens you can use as a "combination lock" style of unlocking a door. Set the hands of a clock to a certain time, point arrows to numbers/letters/symbols/etc., line up image fragments, whatever you can think of. To create a Dial token, simply name it "Dial" and rotate it to its unlocked position. This position is what DoorMaster will use to determine the proper orientation for the Dial. After your [door is created](#door-creation), Dials are rotated to the default 0 degree rotation (handle up) for player discovery. Dials only work on doors in the Locked [State](#door-states), and will set them to Unlocked once the Dial is rotated into the correct position. If you use multiple Dials, players will need to rotate all of them into the correct position to unlock the door.

You can optionally provide a colorful or mysterious message to be given to players when they get all Dials rotated correctly. To do this, place your message in the Dial token's first Bar 1 field. If you have more than one Dial, different messages in each Dial will give a randomized response. If no messages are provided, a default one will be used. When the door is unlocked, players will then receive this message as feedback describing what happened. Incorrectly rotated Dials will give no feedback.

You can create Dials using tokens set to "Is Drawing" from the Advanced context menu, allowing you to use more than simple 45° increments. In this case, there is a small tolerance of ±4°, so if your Dial's correct setting is 60° the player can place the Dial between 56° and 64° and it will still count as a correct rotation. On a token only one cell in size this is an extremely small difference, so be sure not to crowd relevant elements for your Dials.

All Dials will get a GM-only aura to indicate if they are in the correct rotation; a green aura means it is correct, and a red one indicates an incorrect position. When the door is unlocked, the Dials will be disabled and the auras will disappear.

New [triggers](#triggers) have been added that allows you to set your trap to trigger on incorrect Dial settings.

## Tiles

Tiles are one or more tokens that must be placed in a specific location on the map to unlock a door. Create picture puzzles, place discovered artifacts onto the proper pedestal, put words/symbols in a specific order, whatever you desire. To create a Tile token, simply name it "Tile" and place it in the position on the map that corresponds to the placement needed to unlock the door. After the [door is created](#door-creation), Tiles will be offset from their original position and may be moved into any order you want for player discovery. Tiles only work on doors in the Locked [State](#door-states), and will set them to Unlocked once the Tile is moved into the correct position. If you use multiple Tiles, players will need to move all of them into the correct position to unlock the door.

An alternative to using multiple Tiles is to have only one "true" Tile along with one or more "Decoy" tiles. This allows for a "choose the right one" style of puzzle: Only moving the true Tile into place will unlock the door. Decoy Tiles are created by naming the token "Decoy" instead of "Tile" before door creation, and will be usable by all players just like other Tiles.

You can optionally provide a colorful or mysterious message to be given to players when they get all Tiles positioned correctly. To do this, place your message in the Tile token's first Bar 1 field. If you have more than one Tile, different messages in each Tile will give a randomized response. You may provide responses on Decoy tokens as if they are Tiles. If no messages are provided, a default one will be used. When the door is unlocked, players will then receive this message as feedback describing what happened. Incorrectly positioned Tiles or correctly positioned Decoys will give no feedback.

You can create Tiles using tokens set to "Is Drawing" from the Advanced context menu, allowing you position them more precisely. In this case, there is a small tolerance of ±4 pixels in both directions, and it is recommended to provide a graphical suggestion of placement such as a hole, groove, impression, etc.

All Tiles will get a GM-only aura to indicate if they are in the correct position; a green aura means it is correct, and a red one indicates an incorrect position. When the door is unlocked, the Tiles will be disabled and the auras will disappear. Decoys will not get an aura regardless of their position.

New [triggers](#triggers) have been added to let you to set your trap to trigger on incorrect Tile settings.

**Note:** You _cannot_ use Tiles along with Dials on the same door. If any Dials are set on a door, all Tile and Decoy tokens will be ignored.

## DoorMaster Characters

DoorMaster characters are created automatically when you first install the script, and are set on the appropriate tokens to allow players to interact with them. These characters are essential for player interaction and *must not be deleted.* Deleted DoorMaster characters will be re-created if the sandbox is restarted, but doors connected to the old character will lose functionality.

The "DoorMaster" character is used for all visible doors and has four token action buttons:
- **Use** - Use a door or switch. This should be the first button used. It will open and close Unlocked doors, and provides feedback on the State of the door if it cannot be opened.
- **Pick** - This button begins the steps to make an attempt to pick a lock. If the player controls more than one character, they will be asked to select which character is making the attempt. The list of characters will only include characters to which the player has specifically been assigned control, i.e. no character with the "All Players" assignment.

  The player will then be provided a "Pick Lock" button which will allow them to select the Dexterity skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to pick a lock.

   If enabled in [config](#configuration), a fumble at trying to pick the lock can result in the lock being Disabled. This prevents use of a key or subsequent attempts to pick the lock.
- **Break** - This button begins an attempt to open the door by force. As above, if the player controls more than one character, they will be asked to select which character is making the attempt.

  The player will then be provided a "Break Open" button which will allow them to select the Strength skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to break a door.

   If the attempt to force the door open succeeds, there is a 20% chance to break the door (setting it to the Broken [State](#door-states)) completely, rendering the door useless. If a Locked door is forced open, there is also a 10% chance to destroy the lock (Disabled).
- **Help** - Shows a help menu that explains the other token action buttons.

The "DoorMaster Keyed" character adds the following token action button:
- **Key** - This button prompts the player to enter a passphrase. If the passphrase is correct, the door will be unlocked. If the [key reset function](#keyed-doors) is off, this button will also allow the door to be locked using the passphrase as well.

The "DoorMaster Trapped" character adds the following token action button:
- **Disable** - This button allows an attempt to disable a trap. If the player controls more than one character, they will be asked to select which character is making the attempt. A "Disable Trap" button will then appear to allow them to select the Dexterity skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to disable a trap.

 If enabled in [config](#configuration), a fumble at disabling a trap will trigger the trap.

The "DoorMaster Trapped Keyed" character combines the functionality of the "DoorMaster Keyed" and "DoorMaster Trapped" in for doors that are both trapped and keyed.

The "DoorMaster Switch" character is set on non-hidden switch tokens, and only provides the *Use* and *Help* buttons.

The "DoorMaster Lock" character is set on non-hidden lock tokens, and provides the *Key*, *Pick*, and *Help* buttons.

## Door Status

You can see the stats for any door by using the `!door status` command with _any_ door token selected. You will be provided the following information:
- Whether the door is open or closed
- Re-label the door and switch. Enter a word for each to better represent the object. Change "door" to "chest", "switch" to "lever", etc. All player dialogs will use the new label.
- The [State](#door-states) of the door (editable)
- The [Visibility](#door-visibility) of the door (reveal only)
- The current Lock DC (editable)
- The current Break DC (editable)
- Whether there is a Switch, and its visibility (reveal only)
- If [keyed](#keyed-doors), whether the lock is enabled (enable only)
- If keyed, shows the passphrase (editable)
- If keyed, shows if Key Reset is on or off (toggle)
- If [trapped](#trapped-doors), whether the trap is active (toggle)
- If trapped, the current Disable DC (editable)
- If trapped, a list of the Triggers
- If trapped, whether the trap resets after it's triggered (toggle)
- If trapped, whether the door is Broken after it's triggered (toggle)
- If trapped, the beginning words of the effect
- How many [Dials](#dials), if any, are in use with the door
- How many [Tiles](#tiles) and/or Decoys, if any, are in use with the door
- Whether the tokens are locked (lockable)

## Configuration

The Configuration Menu allows you to change these DoorMaster options:
- **Door Auras** - You can use an aura to indicate to players that a door token can be interacted with. The default is "on" and the color is set to an unobtrusive medium grey. You can turn this feature off and on, and change the color.
- **Hidden Door Indicator** - This is a aura used to show the GM a door that is Secret or Concealed. You cannot turn it off, but you can change the color.
- **Lock Picking Fumbles** - You can choose to allow fumbles at lock picking attempts to disable the door's lock (Disabled), preventing it from being unlocked by key or more picking attempts. Default is On.
- **Trap Disabling Fumbles** - You can choose to allow fumbles at trap disabling attempts, which will trigger the trap instead of disabling it. Default is On.
- **Show Results** - You can choose to show players the results of their skill rolls. If turned off, players will only see a "success" or "fail" dialog. If on, this dialog will also include the roll result, the skill they used, and whether or not they rolled at Advantage or Disadvantage. Default is Off. These results are always provided to the GM if they are not shown publicly to the players.
- **Door Interactions** - You can have all door interactions whispered to the players instead of being public. Note that trap effects will always been public, and character/skill decisions (except for the final result) will always be whispered. Default is Off.
- **Obfuscate States** - By default the [State](#door-states) of the door is obfuscated so players do not definitively know what state the door is in. Turning this feature off will show the door's State in the title of the feedback dialog to players.

The Configuration Menu also tells you how many doors you've created so far, and gives a button for [creating a door](#door-creation) or viewing a selected door's [status](#door-status).

## Destroying Doors

Sometimes you may need to remove a previously created door, in case a token has been deleted, or missed during creation. To do this, select any of the door's tokens and use the `!door destroy` command. This will remove the DoorMaster character from the tokens, put their respective names back ("Closed" on the Closed token, etc.), unlock the tokens if they have been locked, remove any auras, and return all existing tokens and paths to the token layer. The Closed token will have the current State, Visibility, and DCs written to the appropriate fields.
