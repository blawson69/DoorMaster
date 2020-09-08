# DoorMaster

> **New in ver 4.8:** Now you can set a door to [automatically open](#auto-open) when unlocked for Keyed doors or when using Dials or Tiles.

This [Roll20](http://roll20.net/) script provides a robust system of door creation and management. It allows players to interact with doors, attempt to pick locks, or try to break through doors. GMs can create hidden doors that can be revealed to players at any time, make trapped doors with a variety of triggers, use various puzzle-type methods for unlocking doors, provide any number of paths to serve as Dynamic Lighting lines, include Switches for alternative door control, and add a token to visually illustrate a broken door. All related tokens can be locked to prevent them from accidentally being moved by players.

DoorMaster is for use with the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped) and the D&D 5th Edition OGL Sheet.

## Table of Contents
- [Door Creation](#door-creation)
- [Door States](#door-states)
- [Door Visibility](#door-visibility)
- [Switches](#switches)
- [Keyed Doors](#keyed-doors)
  - [Lock Tokens](#lock-tokens)
- [Linked Doors](#linked-doors)
  - [Flags](#flags)
- [Trapped Doors](#trapped-doors)
  - [Triggers](#triggers)
  - [Disable DC](#disable-dc)
  - [Trap Effect](#trap-effect)
- [Skill Checks](#skill-checks)
  - [Tools](#tools)
- [Dials](#dials)
- [Tiles](#tiles)
- [User Actions](#user-actions)
- [Door Status](#door-status)
  - [Labels](#abels)
  - [Pinging Tokens](#pinging-tokens)
  - [Auto Open](#auto-open)
- [Configuration](#configuration)
- [Destroying Doors](#destroying-doors)

---
## Door Creation

There are a minimum of two tokens needed to create a door: A token named "Closed" representing the door in its closed State, and one named "Open" for when it is open. The Closed token will contain the startup information for the door. Aside from the name, you will set the [State](#door-states) of the door and its [Visibility](#door-visibility). You can also provide the "Lock DC" for when a player attempts to pick the lock. If none is provided, it will default to 12. The "Break DC" is used when a character attempts to open the door by force. If none is provided, it will default to 30 for Obstructed doors and 15 for all others. If making a Keyed door ([see below](#keyed-doors)), the Passphrase will be provided here.

Below is the information to provide and the field placement for each:

|  | Current | Max |
| ---- |:----:|:----:|
| Bar 1 | State | Visibility |
| Bar 2 | Lock DC | Break DC |
| Bar 3 | [Passphrase](#keyed-doors) |  |

If you wish to use a switch, lever, or other off-the-door method of opening and closing the door, provide a token named "Switch" ([see below](#switches)).

You can use an optional token named "Broken" to depict the door in a broken, unusable State. If an attempt to break a door down results in the Broken State, this token will replace the Open or Closed tokens and the door will no longer be available for player interaction.

Paths for Dynamic Lighting are optional. You can use no paths at all for trapdoors, or provide more than one path for things like prison bars. These will all act as Dynamic Lighting lines in the Closed State, and will be disabled in the Open State.

When you have all of the elements for your door, you select all of them and send the `!door create` command in chat. This assembles your door and closes it. A [Status window](#door-status) for the door will appear, where you can update or modify most of the door's settings. It will also allow you to lock all related tokens to prevent accidental movement or [link other doors](#linked-doors). You can return to this status window at any time.

**Note:** The creation process replaces token names with the ID of the associated door. *Do not* rename tokens after your door is created or your door *will not* function.

## Door States

Each door will have one of the following States. Typically, you will only use the first six when [creating a door](#door-creation). The last two are set by DoorMaster when certain conditions are met:
- **Unlocked** - Players can open and close the door effortlessly.
- **Locked** - The door has a lock that either needs a key or can be picked open.
- **[Keyed](#keyed-doors)** - The door has a lock with which the player can interact. This status is **only** used when setting up the Closed token to tell DoorMaster that the door is Keyed, and will be set to the Locked State during door creation.
- **Barred** - This door is barred _on the player's side_. Clicking the [Use button](#doormaster-characters) will lift/remove the bar, setting the door to the Unlocked State.
- **Obstructed** - This door is obstructed by a bar or other immovable objects _from the opposite side_. It cannot be picked or busted through. If the obstruction is a bar, the GM will need to change the State to Barred if players encounter the door from the other side.
- **Stuck** -  This door is not locked, but won't open without being forced.
- **Disabled** - A disabled door has had its lock damaged. It cannot be unlocked with a key or by picking it.
- **Broken** - A broken door has been damaged to the point it is unusable. These doors are always open and cannot be closed by any means. You *cannot* set this State during door creation.

You can change the door's State at any time in the [Status window](#door-status) with any one of the door's tokens selected. Note that setting an open door to a Locked, Barred, Obstructed, or Stuck State will close that door as well.

## Door Visibility

Visible doors will be assigned the DoorMaster character (see below) and ([optionally](#configuration)) be given an aura to indicate a door with which the players can interact. If you want to create a Secret or Concealed door, you *must* indicate this during [door creation](#door-creation). Place either "Secret" or "Concealed" in the Bar 1 max field of the Closed token ([see above](#door-creation)).

Even Unlocked doors that are Secret or Concealed will be undetectable by players, assuming the graphics you use blend into the map. They will not receive a player-visible aura and will not be assigned the DoorMaster character. They *will* receive a gm-only aura to show it as a hidden door. The [Status window](#door-status) will provide a link to reveal a hidden door, but a visible door cannot be made Secret or Concealed.

## Switches

Switches are optional tokens that enable operation of the door from a remote location, be it across the room or down a hallway. Select a graphic you wish to use for the Switch and name it "Switch". If you want to hide your Switch until a later time - it is concealed or otherwise hidden - put "Hidden" in the first Bar 1 field of the Switch token. The [Status window](#door-status) will provide a link for revealing the Switch.

If you want to have an "on/off" effect for your Switch, provide a second token named "Switch2". When the Switch is used on an Unlocked door, DoorMaster will toggle between the two Switch tokens.

## Keyed Doors

Doors can have "keys" to unlock them. These are passphrases - passwords or sentences - that you provide. To create such a door, use "Keyed" as the door [State](#door-states) during [door creation](#door-creation) and enter the passphrase you wish to use in the first Bar 3 box. Upon creation, the door will be Locked and you will have the following additional functionality in the [Status window](#door-status):
- The ability to manually enable the use of a "Key" token action button. This button lets players enter a passphrase in an attempt to unlock the door. Until enabled, the door will only have the usual [token action buttons](#doormaster-characters) available. If a [Lock token](#lock-tokens) is being used, the "Key" button will appear there instead.
- The passphrase will be displayed, which you can change at any time.
- You can choose to remove the "Key" token action whenever the door is unlocked with the proper passphrase. By default this "Key Reset" function is OFF, allowing players to *re-lock* the door with the passphrase as well.
- You can set the door to [automatically open](#auto-open) when the correct passphrase is given.

Passphrases are case-sensitive by default and should be alphanumeric. You may use punctuation and spaces, but avoid characters used in URLs (colons, forward slashes, etc.). Passphrases do not have to be unique, but remember that entering a non-unique passphrase on one door will _not_ unlock other doors with the same passphrase. You can turn off case sensitivity in the Status window.

### Lock Tokens

If you have a [Keyed Door](#keyed-doors) and wish to provide key input separate from the door itself, you can provide a token named "Lock". This especially handy when creating doors that are locked by magical means - puzzles, etc. - that can reveal the passcode after the puzzle or test is completed correctly. This Lock token will be the token with which players must interact when using a key or attempting to pick the lock.

If you want to hide your Lock until a later time - it is concealed or otherwise hidden - put "Hidden" in the first Bar 1 field of the Lock token. The [Status window](#door-status) will provide a link for revealing the Lock.

## Linked Doors

You can create a link to one or more other doors via the [Status window](#door-status). This makes the door referenced by the Status window the "master" door and all linked doors are "secondary" doors. When the master door is opened, the secondary doors are opened (as long as they are Unlocked). This is a one-way link, so opening a secondary door does not affect the master. Two-way connections can be made simply by linking the secondary door back to the master.

Linking doors in this way provides for any number of effects:
- Allow one Switch to *control multiple doors.* Create Switches for every door in the group, then hide all but the master Switch behind Dynamic Lighting lines.
- Create a lever that *changes walls in a labyrinth.* This is almost the same as the above, but all secondary doors are all Secret, Unlocked doors that act as walls and dividers in the labyrinth. Only the master door needs a Switch.
- *Create a puzzle* where players must make all the doors in the group opened or closed. Secondary doors are linked to the master and other secondary doors in such a way that only by using the doors in the correct sequence will have them all closed or open at once.
- Make doors with *multiple Switches.* Create two Switched doors, and either hide the secondary door's tokens behind Dynamic Lighting lines or use transparent graphics to leave only the Switch token accessible.
- Make doors operated by other doors or Switches *on another page.* Generate the status window for the master door, then jump to another page and link the door you want.

### Flags
Once you have linked one or more doors, you will have the following options:
- **All-or-Nothing** - When set to OFF (default), all Unlocked secondary doors will be opened/closed and the rest will be ignored. Setting this to ON will require all secondary doors to be Unlocked before _any_ of them will open. Broken doors are the exception and will allow operation when All-or-Nothing is ON. If there are any non-Unlocked secondary doors, the GM will be notified. The master door *must* be Unlocked to operate any secondary doors. If it is not, players will receive the standard feedback based on the master door's [State](#door-states).
- **Master Lock** - Turning this setting ON lets all secondary doors be unlocked whenever the master door is unlocked. This flag overrides the "All-or-Nothing" flag for obvious reasons, and will need to be OFF in order to use the other flag. It will not change any other States on the secondary doors.

## Trapped Doors

You can create a door that is trapped by adding data to the "Open" door token before [door creation](#door-creation). Every trap has a trigger, a Disable DC, and a trap effect. This information goes into the Open token's first Bar 1, Bar 2, and GM Notes fields, respectively, and are highlighted below.

|  | Current | Max |
| ---- |:----:|:----:|
| Bar 1 | Trigger |  |
| Bar 2 | Disable DC |  |

| GM Notes |
| ---- |
| Trap Effect |

Most traps must be manually reset once they have been triggered, while others do not need to be reset or have a mechanism that automatically resets the trap. Once your trapped door is created, you will be able to tell DoorMaster from the [Status window](#door-status) whether the trap should be automatically reset after it gets triggered. The default is Off. You can also reset the trap manually in the Status window.

Some traps may render a door unusable once triggered, either because of damage to the door or other factors. From the Status window, you can set whether triggering the effect will "break" the door. The default is Off. Note that if auto reset is on, this function will be disabled.

You can also provide an optional token named "Trap" to give a graphic representation of the trap after the effect has been triggered. This may be a blade, spike pit, soot from an explosion, a blast of fire, etc. If the trap auto reset option (above) is on, this token will be shown for about 1.5 seconds and then disappear.

Detecting traps is out of the scope of this script and the GM will follow the same procedures as always for trap detection. Once a character has successfully detected a trap on the door, however, a "Disable" token action button can be made available through the Status window. This will allow a character to attempt to disable the trap in the same manner as picking a lock. If the attempt is successful, the trap is disabled and the button will go away.

### Triggers

A trigger is an action the player takes on the door that sets off the trap's effect. A trap may have more than one trigger depending on the kind of trap. Below are the possible triggers and how they work:
- **Open** - Any time a door is opened. A door must be closed and [Unlocked](#door-states) before this trigger will fire, or be forced open using the [Break button](#doormaster-characters).
- **Touch** - Any time a door is touched. This trigger is set off by **any** use of the Use, Pick, Break, _or Disable_ buttons and applies to all door States except Broken. If not using a [Lock token](#lock-tokens), using the Key button on the door will also trigger the trap.

  Note: This trigger supersedes **all** interactions. It is highly recommended to keep the trap reset function off (see above) when using this trigger.
- **Touch-Locked** - Any time a door is touched when it is Locked. This trigger only works when using a [Lock token](#lock-tokens). If you have not set a Lock token, the trap will revert to using the Touch trigger.
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
1. [Tools](#tools) that are relevant to these tasks are at the top of the list if present, as they are most the specific and the most likely "GM approved" option.
2. The skill closest to relevant use for the task will be provided. For Dexterity-based tasks, this skill is Sleight of Hand skill. Strength-based tasks use Athletics. If the character is proficient in the skill, that bonus is included in the attempt.
3. The base attribute bonus corresponding to the skill is the final option. Lock picking and trap disabling are Dexterity-based, and door breaking is Strength-based.

### Tools

The tools relevant to DoorMaster are [Thieves' Tools](https://roll20.net/compendium/dnd5e/Thieves%27%20Tools), the [Crowbar](https://roll20.net/compendium/dnd5e/Crowbar), and the [Portable Ram](https://roll20.net/compendium/dnd5e/Portable%20ram). In order to use them, you must add them to the character sheet in a way that is not simply sitting in inventory. This process differs depending on the sheet you are using for your game.

For the Shaped sheet, you will add these tools as custom Skills, choosing the attribute on which they are based: Dexterity for Thieves' Tools, and Strength for the Crowbar and Portable Ram. Indicate whether or not the character has proficiency with the tool. Setting this skill to be automatically at advantage is not detected by the script, so players will still be asked in the dialog. Note that the script will _add the +4 bonus for the Portable Ram for you_, since the sheet does not allow modifiers to skills.

For the OGL sheet, they are added to the Tool Proficiencies & Custom Skills section. Select the corresponding attribute, and for the Portable Ram you can add the +4 modifier. There is no way to turn off proficiency for a tool, so if you allow use of non-proficient tools you can change the modifier to compensate. Regardless of the mod you add, the script will attribute 4 points out of the total roll modifier to the ram when it breaks down the numbers for roll results. For example: If the character's strength bonus is 2, this gives a total of 4 assuming a +2 proficiency bonus. You can set the mod for the ram to 2 instead of 4 in order to compensate for non-proficiency. DoorMaster will give the roll result as `2[str] + 4[Portable Ram]`. Note that the Thieves' Tools and Crowbar do not imply a bonus, but you can still use the modifier to compensate for non-proficiency.

## Dials

Dials are one or more rotating tokens you can use as a "combination lock" style of unlocking a door. Set the hands of a clock to a certain time, point arrows to numbers/letters/symbols/etc., line up image fragments, whatever you can think of. To create a Dial token, simply name it "Dial" and rotate it to its unlocked position. This position is what DoorMaster will use to determine the proper orientation for the Dial. After your [door is created](#door-creation), Dials are rotated to the default 0 degree rotation (handle up) for player discovery. Dials only work on doors in the Locked [State](#door-states), and will set them to Unlocked once the Dial is rotated into the correct position. If you use multiple Dials, players will need to rotate all of them into the correct position to unlock the door.

You can optionally provide a colorful or mysterious message to be given to players when they get all Dials rotated correctly. To do this, place your message in the Dial token's first Bar 1 field. If you have more than one Dial, different messages in each Dial will give a randomized response. If no messages are provided, a default one will be used. When the door is unlocked, players will then receive this message as feedback describing what happened. Incorrectly rotated Dials will give no feedback.

You can create Dials using tokens set to "Is Drawing" from the Advanced context menu, allowing you to use more than simple 45° increments. In this case, there is a small tolerance of ±4°, so if your Dial's correct setting is 60° the player can place the Dial between 56° and 64° and it will still count as a correct rotation. On a token only one cell in size this is an extremely small difference, so be sure not to crowd relevant elements for your Dials.

All Dials will get a GM-only aura to indicate if they are in the correct rotation; a green aura means it is correct, and a red one indicates an incorrect position. When the door is unlocked, the Dials will be disabled and the auras will disappear.

[Triggers](#triggers) are provided that allow you to set your [trapped door](#trapped-doors) to trigger on incorrect Dial settings. You can also set the door to [automatically open](#auto-open) when unlocked.

## Tiles

Tiles are one or more tokens that must be placed in a specific location on the map to unlock a door. Create picture puzzles, place discovered artifacts onto the proper pedestal, put words/symbols in a specific order, whatever you desire. To create a Tile token, simply name it "Tile" and place it in the position on the map that corresponds to the placement needed to unlock the door. After the [door is created](#door-creation), Tiles will be offset from their original position and may be moved into any order you want for player discovery. Tiles only work on doors in the Locked [State](#door-states), and will set them to Unlocked once the Tile is moved into the correct position. If you use multiple Tiles, players will need to move all of them into the correct position to unlock the door.

An alternative to using multiple Tiles is to have only one "true" Tile along with one or more "Decoy" tiles. This allows for a "choose the right one" style of puzzle: Only moving the true Tile into place will unlock the door. Decoy Tiles are created by naming the token "Decoy" instead of "Tile" before door creation, and will be usable by all players just like other Tiles.

You can optionally provide a colorful or mysterious message to be given to players when they get all Tiles positioned correctly. To do this, place your message in the Tile token's first Bar 1 field. If you have more than one Tile, different messages in each Tile will give a randomized response. You may provide responses on Decoy tokens as if they are Tiles. If no messages are provided, a default one will be used. When the door is unlocked, players will then receive this message as feedback describing what happened. Incorrectly positioned Tiles or correctly positioned Decoys will give no feedback.

You can create Tiles using tokens set to "Is Drawing" from the Advanced context menu, allowing you position them more precisely. In this case, there is a small tolerance of ±4 pixels in both directions, and it is recommended to provide a graphical suggestion of placement such as a hole, groove, impression, etc.

All Tiles will get a GM-only aura to indicate if they are in the correct position; a green aura means it is correct, and a red one indicates an incorrect position. When the door is unlocked, the Tiles will be disabled and the auras will disappear. Decoys will not get an aura regardless of their position.

[Triggers](#triggers) are provided to let you to set your [trapped door](#trapped-doors) to trigger on incorrect Tile settings. You can also set the door to [automatically open](#auto-open) when unlocked.

**Note:** You _cannot_ use Tiles along with Dials on the same door. If any Dials are set on a door, all Tile and Decoy tokens will be ignored.

## User Actions

DoorMaster characters are created automatically when you first install the script, and are set on the appropriate tokens to allow players to interact with them. These characters are essential for player interaction and *must not be deleted.* Deleted DoorMaster characters will be re-created if the sandbox is restarted, but doors connected to the old character will lose functionality.

The "DoorMaster" characters are used for all visible doors and provide some combination of the following token action buttons:
- **Use** - Use a door or Switch. This should be the first button used. It will open and close Unlocked doors, and provides feedback on the State of the door if it cannot be opened.
- **Pick** - This button begins the steps to make an attempt to pick a lock. If the player controls more than one character represented on the page, they will be asked to select which character is making the attempt. The list of characters will only include characters to which the player has specifically been assigned control, i.e. no character with the "All Players" assignment.

  The player will then be provided a "Pick Lock" button which will allow them to select the Dexterity skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to pick a lock.

   If enabled in [config](#configuration), a fumble at trying to pick the lock can result in the lock being Disabled. This prevents use of a key or subsequent attempts to pick the lock.
- **Break** - This button begins an attempt to open the door by force. As above, if the player controls more than one character, they will be asked to select which character is making the attempt.

  The player will then be provided a "Break Open" button which will allow them to select the Strength skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to break a door.

  If the attempt to force the door open succeeds, there is a 20% chance to break the door (setting it to the Broken [State](#door-states)) completely, rendering the door useless. If a Locked door is forced open, there is also a 10% chance to destroy the lock (Disabled).

- **Key** - This button prompts the player to enter a passphrase. If the passphrase is correct, the door will be unlocked. If the [key reset function](#keyed-doors) is off, this button will also allow the door to be locked using the passphrase as well.

- **Disable** - This button allows an attempt to disable a trap. If the player controls more than one character, they will be asked to select which character is making the attempt. A "Disable Trap" button will then appear to allow them to select the Dexterity skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to disable a trap.

  If enabled in [config](#configuration), a fumble at disabling a trap will trigger the trap.
- **Help** - Shows a help menu that explains the other token action buttons.

## Door Status

You can see detailed stats for any door by using the `!door status` command with _any_ door token selected. This status window also comes up immediately upon [creating a new door](#door-creation). All post-creation modifications/updates to your doors are done through this dialog. You will be provided information about the door's State, locks, and traps, as well as links to lock tokens and to [link other doors](#linked-doors).

### Labels
You can re-label the doors, [Switches](#switches), [Dials](#dials), and [Tiles](#tiles) to better represent the object in use. For instance, a door may be a porthole or a stone slab. A Switch might actually be a floor tile that gets depressed, or a statue's arm that works as a lever. To change labels, click the current label and provide a new one.

### Pinging Tokens
You may have door elements scattered across your map, particularly when using [Switches](#switches) and [Lock Tokens](#lock-tokens). To enable location of all elements of a door, a map pin icon link (📍) is located next to the State, Switch, and External Lock output in the Status window to ping the door, Switch and Lock Tokens, respectively. This ping is visible to the GM only.

### Auto Open
You can have some doors automatically open when unlocked by setting this to 'ON'. This enables passphrases, Dials, and Tiles to operate the door rather than requiring direct user action. For instance, shifting the walls of a maze based on speaking a magic word. Auto Open is _only_ available for [Keyed doors](#keyed-doors) and doors using [Dials](#dials) or [Tiles](#tiles). If the door has any [linked doors](#linked-doors), they _will not_ be opened automatically.

## Configuration

The Configuration Menu allows you to change these DoorMaster options:
- **Door Auras** - You can use an aura to indicate to players that a door token can be interacted with. The default is "on" and the color is set to an unobtrusive medium grey. You can turn this feature off and on, and change the color.

- **Hidden Door Indicator** - This is a aura used to show the GM a door that is Secret or Concealed. You cannot turn it off, but you can change the color.

- **Lock Picking Fumbles** - You can choose to allow fumbles at lock picking attempts to disable the door's lock (Disabled), preventing it from being unlocked by key or more picking attempts. Default is On.

- **Trap Disabling Fumbles** - You can choose to allow fumbles at trap disabling attempts, which will trigger the trap instead of disabling it. Default is On.

- **Show Results** - You can choose to show players the results of their skill rolls. If turned off, players will only see a "success" or "fail" dialog. If on, this dialog will also include the roll result, the skill they used, and whether or not they rolled at Advantage or Disadvantage. Default is Off. These results are always provided to the GM if they are not shown publicly to the players.

- **Door Interactions** - You can have all door interactions whispered to the players instead of being public. Note that trap effects will always been public, and character/skill decisions (except for the final result) will always be whispered. Default is Off.

- **Obfuscate States** - By default the [State](#door-states) of the door is obfuscated so players do not definitively know what State the door is in. Turning this feature off will show the door's State in the title of the feedback dialog to players.

The Configuration Menu also tells you how many doors you've created so far, and will give a button for generating the DoorMaster macro if it has been accidentally deleted. This macro provides quick access to the oft-used [Status](#door-status), [Create](#door-creation), and [Destroy](#destroying-doors) commands.

## Destroying Doors

Sometimes you may need to remove a previously created door, in case a token has been deleted, or missed during creation. To do this, select any of the door's tokens and use the `!door destroy` command. This will remove the DoorMaster character from the tokens, put their respective names back ("Closed" on the Closed token, etc.), unlock the tokens if they have been locked, remove any auras, and return all existing tokens and paths to the token layer. The Closed token will have the current State, Visibility, and DCs written to the appropriate fields.
